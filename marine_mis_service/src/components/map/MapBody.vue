<script setup lang="ts">
/**
 * MapBody.vue: Leaflet 라이브러리를 사용하여 지도를 표시하고 관리하는 컴포넌트입니다.
 * React-Leaflet 대신 순수 Leaflet 객체를 사용하여 직접 제어합니다.
 */
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet'; // Leaflet 핵심 라이브러리
import 'leaflet/dist/leaflet.css'; // Leaflet 기본 스타일 (마커, 팝업 등 표시용)
import { useMapLayers } from '@/composables/useMapLayers';
import { useMapStore } from '@/store/useMapStore';
import { useUserStore } from '@/store/useUserStore';

// template의 <div ref="mapContainer">에 접근하기 위한 ref 변수
const mapContainer = ref<HTMLElement | null>(null);
const mapStore = useMapStore();
const userStore = useUserStore();

// Leaflet 지도 인스턴스를 저장할 변수
let map: L.Map | null = null;

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
  if (location && map) {
    const bounds = parseBBox(location.bbox);
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    } else if (location.centerJson) {
      // BBOX 파싱 실패 시 중심점(GeoJSON) 사용 시도
      try {
        const center = JSON.parse(location.centerJson);
        if (center.type === 'Point' && Array.isArray(center.coordinates)) {
          const [lng, lat] = center.coordinates;
          map.setView([lat, lng], 13);
        }
      } catch (e) {
        console.error('Failed to parse centerJson:', e);
      }
    }
  }
});

onMounted(() => {
  // 컴포넌트가 마운트되고 DOM 요소가 생성된 후 실행
  if (mapContainer.value) {
    // 대한민국 중심 좌표 설정 (위도, 경도)
    const position: L.LatLngExpression = [36.5, 127.5];
    // 초기 줌 레벨
    const zoom = 7;

    // 지도의 이동 범위를 대한민국 영역으로 제한
    const koreaBounds: L.LatLngBoundsExpression = [
      [32.0, 123.0], // 남서단 좌표
      [40.0, 132.0], // 북동단 좌표
    ];

    // Leaflet 지도 초기화
    const mapInstance = L.map(mapContainer.value, {
      center: position,       // 초기 중심점
      zoom: zoom,             // 초기 줌
      minZoom: 7,             // 최소 축소 레벨
      maxZoom: 18,            // 최대 확대 레벨
      maxBounds: koreaBounds, // 이동 가능 범위 제한
      maxBoundsViscosity: 1.0, // 범위 밖으로 나가지 않도록 하는 강도 (1.0 = 완전 고정)
    });
    map = mapInstance;

    // 기본 배경 지도 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // WMS 레이어 및 기타 레이어 관리를 위한 Composable 연결
    useMapLayers(mapInstance);
  }
});

// 컴포넌트가 소멸되기 직전에 호출 (메모리 누수 방지를 위한 지도 객체 제거)
onBeforeUnmount(() => {
  if (map) {
    (map as L.Map).remove(); // 지도 인스턴스 해제
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
