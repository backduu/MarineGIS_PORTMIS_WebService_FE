<script setup lang="ts">
/**
 * MapBody.vue: Leaflet 라이브러리를 사용하여 지도를 표시하고 관리하는 컴포넌트입니다.
 * React-Leaflet 대신 순수 Leaflet 객체를 사용하여 직접 제어합니다.
 */
import { onMounted, ref, onBeforeUnmount } from 'vue';
import L from 'leaflet'; // Leaflet 핵심 라이브러리
import 'leaflet/dist/leaflet.css'; // Leaflet 기본 스타일 (마커, 팝업 등 표시용)
import { useMapLayers } from '@/composables/useMapLayers';

// template의 <div ref="mapContainer">에 접근하기 위한 ref 변수
const mapContainer = ref<HTMLElement | null>(null);
// Leaflet 지도 인스턴스를 저장할 변수
let map: L.Map | null = null;
let syncLayers: (() => void) | null = null;

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
    map = L.map(mapContainer.value, {
      center: position,       // 초기 중심점
      zoom: zoom,             // 초기 줌
      minZoom: 7,             // 최소 축소 레벨
      maxZoom: 18,            // 최대 확대 레벨
      maxBounds: koreaBounds, // 이동 가능 범위 제한
      maxBoundsViscosity: 1.0, // 범위 밖으로 나가지 않도록 하는 강도 (1.0 = 완전 고정)
    });

    // 기본 배경 지도 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // WMS 레이어 및 기타 레이어 관리를 위한 Composable 연결
    const mapLayerManager = useMapLayers(map);
    syncLayers = mapLayerManager.syncLayers;
  }
});

// 컴포넌트가 소멸되기 직전에 호출 (메모리 누수 방지를 위한 지도 객체 제거)
onBeforeUnmount(() => {
  if (map) {
    map.remove(); // 지도 인스턴스 해제
  }
});
</script>

<template>
  <!-- 지도가 그려질 컨테이너 영역 -->
  <main class="flex-1 relative z-0">
    <div ref="mapContainer" style="height: 100%; width: 100%;"></div>
  </main>
</template>

<style scoped>
/* Leaflet 컨트롤(줌 버튼 등)의 레이어 순서를 관리하기 위한 스타일 */
:deep(.leaflet-control-container) {
  z-index: 400;
}
</style>
