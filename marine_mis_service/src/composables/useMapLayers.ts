import { watch, onUnmounted, ref, type Ref } from 'vue';
import L from 'leaflet';
import { useMapStore, type LayerConfig } from '@/store/useMapStore';
import { useToastStore } from '@/store/useToastStore';
import { GeoServerService } from '@/services/geoServerService';
import axios from 'axios';

/**
 * Leaflet 지도 인스턴스와 GeoServer 레이어 간의 동기화를 관리하는 Composable입니다.
 * mapInstance를 Ref로 전달받아 라이프사이클 훅이 setup() 단계에서 안전하게 등록되도록 수정
 */
export function useMapLayers(mapRef: Ref<L.Map | null>) {
  const mapStore = useMapStore();
  const toastStore = useToastStore();
  // 생성된 레이어 객체들을 관리 (레이어 ID -> Leaflet 레이어 객체)
  const activeLayers = new Map<string, L.Layer>();
  // 현재 진행 중인 WFS 요청을 추적하기 위한 Map (중복 요청 방지)
  const pendingRequests = new Map<string, AbortController>();

  /**
   * 비동기 요청 시 발생할 수 있는 레이스 컨디션을 방지하고, syncLayers에서 기존 WFS 레이어가 있을 경우 재사용합니다.
   *
   * WFS 데이터를 가져와서 레이어를 만들고 지도에 추가합니다.
   */
  const createOrUpdateWfsLayer = async (config: LayerConfig, mapInstance: L.Map) => {
    // 이전 요청이 있다면 취소 (Optional: axios CancelToken 또는 AbortController 사용 가능)
    if (pendingRequests.has(config.id)) {
      pendingRequests.get(config.id)?.abort();
    }
    const controller = new AbortController();
    pendingRequests.set(config.id, controller);

    const params = new URLSearchParams({
      service: 'WFS',
      version: config.version || '1.1.0',
      request: 'GetFeature',
      typeName: config.layers,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
    });

    if (config.cqlFilter) {
      params.append('CQL_FILTER', config.cqlFilter);
    }

    const wfsUrl = `${config.url}?${params.toString()}`;

    try {
      const response = await axios.get(wfsUrl, {signal: controller.signal});
      const geojsonData = response.data;

      // 지도가 파괴되었는지 확인
      if (!mapInstance || !(mapInstance as any)._container) return;

      let wfsLayer = activeLayers.get(config.id) as L.GeoJSON;

      if (wfsLayer && mapInstance.hasLayer(wfsLayer)) {
        // [최적화] 기존 레이어가 있다면 데이터를 비우고 새로 넣음
        wfsLayer.clearLayers();
        wfsLayer.addData(geojsonData);
      } else {
        // 처음 생성하는 경우
        wfsLayer = L.geoJSON(geojsonData, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#af146a",
              color: "#653838",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            });
          },
          onEachFeature: (feature, layer) => {
            // 툴팁 설정
            if (feature.properties.obsvtr_nm) {
              layer.bindTooltip(feature.properties.obsvtr_nm, {
                sticky: true,
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip',
              });
            }

            // 팝업 설정
            const popupContent = `
            <div style="padding: 10px; min-width: 180px;">
              <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #af146a; font-weight: bold;">
                ${feature.properties.obsvtr_nm}
              </h4>
              <div style="font-size: 12px; line-height: 1.6; margin-bottom: 10px;">
                <p style="margin: 4px 0;"><b>코드:</b> ${feature.properties.obs_code || '-'}</p>
                <div style="margin-top: 8px;">
                  <label style="display: block; font-weight: bold; margin-bottom: 2px;">시작 날짜</label>
                  <input type="date" id="start-pop-date-${feature.properties.obs_code}"
                         value="${mapStore.selectedStartDate}"
                         style="width: 100%; border: 1px solid #ccc; padding: 2px 4px; border-radius: 4px;"/>
                </div>
                <div style="margin-top: 8px;">
                  <label style="display: block; font-weight: bold; margin-bottom: 2px;">종료 날짜</label>
                  <input type="date" id="end-pop-date-${feature.properties.obs_code}"
                         value="${mapStore.selectedEndDate}"
                         style="width: 100%; border: 1px solid #ccc; padding: 2px 4px; border-radius: 4px;"/>
                </div>
              </div>
              <button onclick="window.dispatchEvent(new CustomEvent('open-sea-modal', {
                detail: {
                  code: '${feature.properties.obs_code}',
                  name: '${feature.properties.obsvtr_nm}',
                  startId: 'start-pop-date-${feature.properties.obs_code}',
                  endId: 'end-pop-date-${feature.properties.obs_code}'
                }
              }))"
              style="width: 100%; background: #af146a; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                상세 데이터 조회
              </button>
            </div>
          `;
            layer.bindPopup(popupContent);

            // 클릭이벤트
            layer.on('click', () => {
              //console.log("선택된 관측소:", feature.properties);
              // if (feature.properties.obs_code) {
              //   mapStore.fetchWaterTemp(feature.properties.obs_code);
              // }
            });
          }
        });
        // 지도에 추가하기 직전에 다시 한 번 확인
        if (mapInstance.hasLayer(wfsLayer)) return;

        try {
          wfsLayer.addTo(mapInstance);
          activeLayers.set(config.id, wfsLayer);
        } catch (e) {
          console.error('레이어 추가 중 오류 발생:', e);
        }
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        // 요청 취소는 에러로 처리하지 않음
      } else {
        console.error('WFS Layer Update Error:', error);
      }
    } finally {
      pendingRequests.delete(config.id);
    }
  };



  /**
   * 레이어 상태에 따라 지도에 추가하거나 제거합니다.
   * 또한 viewparams나 styles가 변경된 경우 레이어를 다시 로드합니다.
   */
  const syncLayers = () => {
    const mapInstance = mapRef.value;
    if (!mapInstance) return;

    mapStore.layers.forEach((config) => {
      const isCurrentlyOnMap = activeLayers.has(config.id);

      if (config.isOn) {
        if (config.type === 'wfs') {
          // WFS 레이어 최적화: 매번 레이어를 제거하고 생성하는 대신,
          // createOrUpdateWfsLayer 내부에서 기존 레이어가 있으면 clearLayers() 후 addData()를 수행하도록 수정하여
          // Leaflet의 latLngToLayerPoint null 에러(레이스 컨디션)를 방지.
          createOrUpdateWfsLayer(config, mapInstance);
        } else if (!isCurrentlyOnMap) {
          // WMS 또는 타일 레이어를 켜야 하는데 지도에 없는 경우 추가
          let newLayer: L.Layer;

          if (config.type === 'wms') {
            newLayer = GeoServerService.createWmsLayer(config);

            // 타일에러 리바운싱을 적용
            const lastErrorTime = new Map<string, number>();

            // 인증 실패 및 레이어 불러오기 에러가 발생할때 에러를 표출
            (newLayer as L.TileLayer.WMS).on('tileerror', (error) => {
              const now = Date.now();
              const lastTime = lastErrorTime.get(config.id) || 0;

              // 마지막 에러 발생 후 3초가 지나지 않았다면 toast를 띄우지 않는다. (=> debouncing)
              if (now - lastTime < 3000) return;

              lastErrorTime.set(
                config.id,
                now
              );

              console.error('WMS tile error:', error);
              toastStore.addToast(`레이어(${config.name})를 불러오는 중 에러가 발생했습니다.`, 'error');
            });
          } else {
            newLayer = L.tileLayer(config.url, { attribution: config.attribution });
          }

          newLayer.addTo(mapInstance);
          activeLayers.set(config.id, newLayer);
        } else if (config.type === 'wms') {
          // 이미 지도에 있는 WMS 레이어의 경우 viewparams나 styles가 변경되었을 수 있음
          const existingLayer = activeLayers.get(config.id) as L.TileLayer.WMS;

          if (existingLayer && existingLayer.setParams) {
            const params: any = {
              STYLES: config.styles || '',
              VIEWPARAMS: config.viewparams || '',
              ENV: config.env || '',
              CQL_FILTER: config.cqlFilter || '',
              layers: config.layers,
            };

            // CQL_FILTER 적용
            if (config.cqlFilter) {
              params.CQL_FILTER = config.cqlFilter;
            }

            existingLayer.setParams(params);
          }
        }
      } else if (!config.isOn && isCurrentlyOnMap) {
        // 레이어를 꺼야 하는데 지도에 있는 경우 제거
        const layerToRemove = activeLayers.get(config.id);
        if (layerToRemove) {
          mapInstance.removeLayer(layerToRemove);
          activeLayers.delete(config.id);
        }
      }
    });
  };

  // mapStore의 layers 상태 변화를 감시하여 레이어 동기화
  const stopWatch = watch(
    () => mapStore.layers,
    () => {
      syncLayers();
    },
    { deep: true, immediate: true }
  );

  /*지도 인스턴스가 바뀌었을 때(모드 전환 등) 레이어를 재동기화하기 위한 watch 추가*/
  watch(mapRef, (newMap) => {
    if (newMap) {
      activeLayers.clear(); // 새 지도이므로 관리 목록 초기화
      syncLayers();
    }
  });

  onUnmounted(() => {
    stopWatch();
    activeLayers.clear();
  });

  return {
    syncLayers
  };
}

