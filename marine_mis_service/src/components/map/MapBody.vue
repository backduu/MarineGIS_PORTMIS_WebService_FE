<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;

onMounted(() => {
  if (mapContainer.value) {
    // 대한민국 중심 좌표 설정
    const position: L.LatLngExpression = [36.5, 127.5];
    const zoom = 7;

    // 이동 제한 영역 설정
    const koreaBounds: L.LatLngBoundsExpression = [
      [32.0, 123.0], // 남서단
      [40.0, 132.0], // 북동단
    ];

    // 지도 초기화
    map = L.map(mapContainer.value, {
      center: position,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: koreaBounds,
      maxBoundsViscosity: 1.0, // 영역 밖으로 튕겨 나가는 강도 (1.0은 완전 고정)
    });

    // 기본 OpenStreetMap 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // WMS 레이어 추가
    L.tileLayer.wms('http://127.0.0.1:8020/geoserver/korea_coast/wms', {
      layers: 'korea_coast:all_countries_coastline_2025',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      attribution: 'Korea Coast WMS'
    }).addTo(map);
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});
</script>

<template>
  <main class="flex-1 relative z-0">
    <div ref="mapContainer" style="height: 100%; width: 100%;"></div>
  </main>
</template>

<style scoped>
/* Leaflet 관련 스타일 보정 (필요시) */
:deep(.leaflet-control-container) {
  z-index: 400;
}
</style>
