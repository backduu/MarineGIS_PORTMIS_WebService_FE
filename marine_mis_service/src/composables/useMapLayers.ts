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

  /**
   * WFS 데이터를 가져와서 레이어를 만들고 지도에 추가합니다.
   */
  const createNewWfsLayer = (config: LayerConfig, mapInstance: L.Map) => {
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

    axios.get(wfsUrl).then(response => {
      // 비동기로 데이터를 가져온 후 지도가 여전히 유효한지 확인 후 addTo(...) 호출
      if(!mapInstance || !(mapInstance as any)._container) return;

      const geojsonData = response.data;
      const wfsLayer = L.geoJSON(geojsonData, {
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
      wfsLayer.addTo(mapInstance);
      activeLayers.set(config.id, wfsLayer);
    });
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
        if (!isCurrentlyOnMap) {
          // 레이어를 켜야 하는데 지도에 없는 경우 추가
          let newLayer: L.Layer;

          if(config.type === 'wfs') {
            // WFS 레이어가 처음 활성화될 때 레이어 생성 함수 호출
            createNewWfsLayer(config, mapInstance);
          } else {
            // 레이어를 켜야 하는데 지도에 없는 경우 추가
            let newLayer: L.Layer;

            if (config.type === 'wms') {
              newLayer = GeoServerService.createWmsLayer(config);

              // 타일에러 리바운싱을 적용
              const lastErrorTime = new Map<string, number>();

              // 인증 실패 및 레이어 불러오기 에러가 발생할때 에러를 표출합니다.
              (newLayer as L.TileLayer.WMS).on('tileerror', (error) => {
                const now = Date.now();
                const lastTime = lastErrorTime.get(config.id) || 0;

                // 마지막 에러 발생 후 3초가 지나지 않았다면 toast를 띄우지 않습니다. (=> debouncing)
                if(now - lastTime < 3000) return;

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
          }
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
            if(config.cqlFilter) {
              params.CQL_FILTER = config.cqlFilter;
            }

            existingLayer.setParams(params);
          }
        } else if (config.type === 'wfs') {
          // 이미 지도에 WFS 레이어가 있는 상태에서 설정이 변경된 경우엔 기존 레이어를 제거하고 새로운 설정으로 다시 생성하여 실시간으로 지도에 반영되도록 함.
          const layerToRemove = activeLayers.get(config.id);
          if(layerToRemove) {
            mapInstance.removeLayer(layerToRemove);
            activeLayers.delete(config.id);
          }

          // 백새로운 설정으로 레이어 재생성
          createNewWfsLayer(config, mapInstance);
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

