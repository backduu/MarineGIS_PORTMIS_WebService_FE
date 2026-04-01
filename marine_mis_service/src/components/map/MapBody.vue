<script setup lang="ts">
/**
 * MapBody.vue: Leaflet 라이브러리를 사용하여 지도를 표시하고 관리하는 컴포넌트입니다.
 * React-Leaflet 대신 순수 Leaflet 객체를 사용하여 직접 제어합니다.
 */
import { onMounted, ref, onBeforeUnmount, watch, type Ref } from 'vue';
import L from 'leaflet'; // Leaflet 핵심 라이브러리
import 'proj4';
import 'proj4leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet 기본 스타일 (마커, 팝업 등 표시용)
import { useMapLayers } from '@/composables/useMapLayers';
import { useMapStore } from '@/store/useMapStore';
import { useUserStore } from '@/store/useUserStore';

import { GeoServerService } from '@/services/geoServerService';

// template의 <div ref="mapContainer">에 접근하기 위한 ref 변수
const mapContainer = ref<HTMLElement | null>(null);
const mapStore = useMapStore();
const userStore = useUserStore();

// Coastline popup handler
const onMapClick = async (e: L.LeafletMouseEvent) => {
  if (!map.value) return;
  const mapInstance = map.value as L.Map; /*타입 안정성을 위해 명시적 캐스팅*/
  // 팝업 정보 조회를 위해 SQL View 레이어(coastline_popup)를 우선 사용합니다.
  const coastlineLayer = mapStore.layers.find(l => l.id === 'coastline_popup') || 
                         mapStore.layers.find(l => l.id === 'korea_coastline');
  
  if (!coastlineLayer || !coastlineLayer.isOn) return;
  const point = mapInstance.mouseEventToContainerPoint(e.originalEvent);
  const data = await GeoServerService.getFeatureInfo(mapInstance, coastlineLayer, e.latlng, point);
  if (data && data.features && data.features.length > 0) {
    const properties = data.features[0].properties;
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div style="padding: 10px; min-width: 200px; font-family: sans-serif;">
          <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #1e3a8a;">해안선 상세 정보</h4>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><th style="text-align: left; padding: 2px 0; color: #666;">명칭:</th><td>${properties.nam_obj || '이름 없음'}</td></tr>
            <tr><th style="text-align: left; padding: 2px 0; color: #666;">지역:</th><td>${properties.sgg_nam || '-'}</td></tr>
            <tr><th style="text-align: left; padding: 2px 0; color: #666;">길이:</th><td>${properties.length ? properties.length.toFixed(2) + 'm' : '-'}</td></tr>
            <tr><th style="text-align: left; padding: 2px 0; color: #666;">구분:</th>
              <td>
                <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; 
                  ${properties.cat_coa === '11' ? 'background-color: #dcfce7; color: #15803d;' : 'background-color: #ffedd5; color: #9a3412;'}">
                  ${properties.cat_coa === '11' ? '자연해안' : '인공해안'}
                </span>
              </td>
            </tr>
          </table>
        </div>
      `)
      .openOn(mapInstance);
  }
};

// Leaflet 지도 인스턴스를 저장할 변수
const map = ref<L.Map | null>(null);
const waterTempMarkers = L.layerGroup(); /*실측 수온 마커들을 관리할 레이어 그룹*/
let baseLayer: L.Layer | null = null; /*배경지도 레이어를 추적하기 위한 변수*/

/*setup() 단계에서 useMapLayers를 호출하여 라이프사이클 훅이 정상적으로 등록되도록 함*/
useMapLayers(map as Ref<L.Map | null>);

/*UTM-K(EPSG:5179) 좌표계 정의 (개방해 WMS용)*/
const crs5179 = (L as any).Proj ? new (L as any).Proj.CRS('EPSG:5179',
  '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs',
  {
    resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
    origin: [-200000, -2000000]
  }
) : L.CRS.EPSG3857;

/**
 * GeoServer에서 반환하는 BBOX 문자열 "BOX(xmin ymin, xmax ymax)"을
 * Leaflet LatLngBoundsExpression으로 변환합니다.
 */
const parseBBox = (bboxStr: string): L.LatLngBoundsExpression | null => {
  if (!bboxStr) return null;
  // "BOX(126.123 34.567, 127.890 35.123)" -> [126.123, 34.567, 127.890, 35.123]
  const match = bboxStr.match(/BOX\(([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)/);
  if (match) {
    const [, xmin, ymin, xmax, ymax] = match.map(Number);
    // Leaflet은 [ [latMin, lngMin], [latMax, lngMax] ] 형식을 사용
    return [
      [ymin, xmin],
      [ymax, xmax]
    ];
  }
  return null;
};

// 지역 위치 정보가 변경되면 해당 위치로 지도 이동
watch(() => mapStore.locationToZoom, (location) => {
  if (location && map.value) {
    const bounds = parseBBox(location.bbox);
    if (bounds) {
      // 자동으로 해당 좌표에 이동
      map.value.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    } else if (location.centerJson) {
      // BBOX 파싱 실패 시 중심점(GeoJSON) 사용 시도
      try {
        const center = JSON.parse(location.centerJson);
        if (center.type === 'Point' && Array.isArray(center.coordinates)) {
          const [lng, lat] = center.coordinates;
          map.value.setView([lat, lng], 13);
        }
      } catch (e) {
        console.error('Failed to parse centerJson:', e);
      }
    }
  }
});

// 로그아웃 등으로 인해 지도 상태가 초기화될 때 열려있는 팝업을 닫고 줌을 리셋합니다.
watch(() => mapStore.resetTrigger, () => {
  /*map.value가 null이더라도 getCenter 에러가 발생할 수 있는 레이스 컨디션 방지*/
  /*모드 전환 시에는 initMap()이 지도를 새로 그리기 때문에 별도의 setView 호출이 불필요하며 에러를 유발할 수 있음*/
  if (map.value && (map.value as any)._container) {
    try {
      /*팝업을 닫고 지도의 위치와 줌 레벨을 초기 상태로 되돌림*/
      map.value.closePopup();
      
      // 현재 지도 인스턴스가 유효한지(삭제되지 않았는지) 한 번 더 확인
      if (mapStore.viewMode === 'coastal') {
        map.value.setView([36.5, 127.5], 7);
      } else {
        map.value.setView([36, 127], 5); /*개방해 모드 초기 위치*/
      }
    } catch (e) {
      console.warn('Map reset skipped due to instance state:', e);
    }
  }
});

/*뷰 모드(해안선/개방해) 변경 시 지도 초기화*/
watch(() => mapStore.viewMode, () => {
  initMap();
});

/*개방해 모드에서 베이스맵 타입 변경 시 레이어 갱신*/
watch(() => mapStore.baseMapMode, () => {
  if (mapStore.viewMode === 'open-sea') {
    updateBaseLayer();
  }
});

/*실측 수온 데이터 변경 시 지도에 마커 표시*/
//CAUTION 실측 수온 데이터 조회 방식을 변경하여 마커 표시 watch 기능을 해제합니다.
// watch(() => mapStore.waterTempData, (newData) => {
//   if (!map.value) return;
//
//   waterTempMarkers.clearLayers();
//
//   newData.forEach(item => {
//     const lat = parseFloat(item.lat);
//     const lon = parseFloat(item.lon);
//
//     if (!isNaN(lat) && !isNaN(lon)) {
//       const marker = L.marker([lat, lon], {
//         icon: L.divIcon({
//           className: 'water-temp-marker',
//           html: `<div class="bg-blue-500 text-white rounded-full px-2 py-1 text-[10px] font-bold shadow-md border border-white whitespace-nowrap">
//                   ${item.wtem}°C
//                 </div>`,
//           iconSize: [40, 20],
//           iconAnchor: [20, 10]
//         })
//       });
//
//       marker.bindPopup(`
//         <div class="p-2 min-w-[150px]">
//           <h4 class="font-bold border-b pb-1 mb-2 text-blue-800">${item.obsvtrNm}</h4>
//           <p class="text-xs"><b>수온:</b> ${item.wtem}°C</p>
//           <p class="text-[10px] text-gray-500 mt-1 italic">측정시간: ${item.obsrvnDt}</p>
//         </div>
//       `);
//
//       waterTempMarkers.addLayer(marker);
//     }
//   });
//
//   if (mapStore.waterTempData.length > 0 && map.value) {
//     // 마커를 지도에 추가할 때 타입 안전성을 위해 명시적 캐스팅 추가
//     waterTempMarkers.addTo(map.value as L.Map);
//   } else {
//     waterTempMarkers.remove();
//   }
// }, { deep: true });

const updateBaseLayer = () => {
  if (!map.value) return;
  if (baseLayer) {
    map.value.removeLayer(baseLayer);
  }

  if (mapStore.viewMode === 'coastal') {
    const mapInstance = map.value as L.Map; /*타입 안정성을 위해 명시적 캐스팅*/
    // 해안선 모드: OpenStreetMap
    baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
  } else {
    const mapInstance = map.value as L.Map; /*타입 안정성을 위해 명시적 캐스팅*/
    // 개방해 모드: KHOA WMS Proxy
    /*백엔드 OceanProxyController의 변경된 URL 패턴(@RequestParam layers)에 맞춰 파라미터 전달*/
    baseLayer = (L.tileLayer as any).wms('http://localhost:8080/api/ocean-proxy/wms', {
      layers: mapStore.baseMapMode === 'BASEMAP_ENC573857' ? 'BASEMAP_ENC573857' : 'BASEMAP_RLTM3857', 
      format: 'image/png',
      transparent: false,
      version: '1.1.1',
      attribution: 'KHOA',
      noWrap: false,          // 지도가 가로로 무한 반복되도록 허용
      continuousWorld: true,  // 좌표계 계산을 중단하지 않음
      tileSize: 256           // KHOA 규격 고정
    }).addTo(mapInstance);
  }
};

const initMap = () => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  if (mapContainer.value) {
    const isCoastal = mapStore.viewMode === 'coastal';
    
    map.value = L.map(mapContainer.value, {
      center: isCoastal ? [36.5, 127.5] : [36, 127],
      zoom: 7,
      minZoom: 7,
      //zoom: isCoastal ? 7 : 5,
      //minZoom: isCoastal ? 7 : 5,
      maxZoom: 20,
      crs: L.CRS.EPSG3857,
      //crs: isCoastal ? L.CRS.EPSG3857 : crs5179, /*모드에 따라 좌표계 변경 (해안선: 3857, 개방해: 5179)*/
      worldCopyJump: false
    });

    if (isCoastal) {
      const koreaBounds: L.LatLngBoundsExpression = [
        [32.0, 123.0],
        [40.0, 132.0],
      ];
      map.value.setMaxBounds(koreaBounds);
    }

    map.value.on('click', (e: L.LeafletEvent) => {
      onMapClick(e as L.LeafletMouseEvent);
    });

    updateBaseLayer();
  }
};

onMounted(() => {
  initMap();
});

// 컴포넌트가 소멸되기 직전에 호출 (메모리 누수 방지를 위한 지도 객체 제거)
onBeforeUnmount(() => {
  if (map.value) {
    (map.value as L.Map).remove(); // 지도 인스턴스 해제
  }
});
</script>

<template>
  <!-- 지도가 그려질 컨테이너 영역 -->
  <main class="flex-1 relative z-0">
    <div ref="mapContainer" style="height: 100%; width: 100%;"></div>
    <!-- 우측 하단 플로팅 범례 (Legend) -->
    <div v-if="mapStore.layers.find(l => l.id === 'korea_coastline')?.isOn" class="absolute bottom-8 right-4 z-[1000] bg-white p-4 rounded-lg shadow-xl border border-gray-200 text-xs w-48">
      <h4 class="font-bold mb-2 border-b pb-1">해안선 범례</h4>
      <div class="space-y-2">
        <p class="text-[10px] text-gray-500 mb-1 italic">* 수심별 해안선 적용 중</p>
        <div class="flex items-center gap-2">
          <span class="w-4 h-0.5 bg-[#3b82f6]"></span>
          <span>얕은 수심 (연청색)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-0.5 bg-[#1e3a8a]"></span>
          <span>깊은 수심 (진청색)</span>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <span class="w-4 h-0.5 bg-[#ef4444] border-t border-dashed"></span>
          <span>강조 지역 (빨간 점선)</span>
        </div>
      </div>
      <div v-if="mapStore.currentSearchVal" class="mt-2 pt-2 border-t text-green-600 font-semibold">
        검색: '{{ mapStore.currentSearchVal }}'
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Leaflet 컨트롤(줌 버튼 등)의 레이어 순서를 관리하기 위한 스타일 */
:deep(.leaflet-control-container) {
  z-index: 400;
}
</style>
