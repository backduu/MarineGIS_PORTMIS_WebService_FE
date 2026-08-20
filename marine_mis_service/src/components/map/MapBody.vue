<script setup lang="ts">
/**
 * MapBody.vue: CesiumJS를 사용하여 3D 디지털 트윈 지도를 표시하고 관리하는 컴포넌트입니다.
 */
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/useMapStore';
import ObsDetailModal from "@/components/map/ObsDetailModal.vue";
Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

const cesiumViewer = ref<Cesium.Viewer | null>(null);
const cesiumContainer = ref<HTMLElement | null>(null);
const mapStore = useMapStore();

const initCesium = () => {
  if (cesiumViewer.value) {
    cesiumViewer.value.destroy();
    cesiumViewer.value = null;
  }

  if (cesiumContainer.value) {
    cesiumViewer.value = new Cesium.Viewer(cesiumContainer.value, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false, // 애니메이션 적용해서 시간 흐름 제어할 수 있게 함
      timeline: false, // 타임라인 바가 나와서 특정 시간대 조회할 수 있게 함
      navigationHelpButton: true, // 도움말 제공 (마우스 활용)
      sceneModePicker: true, // 2D/3D 모드 변경 가능
      baseLayerPicker: true, // 기본 레이어 선택 기능
      geocoder: true, // 위치 검색 기능
      homeButton: false,
      fullscreenButton: true,
      infoBox: false, // 세슘 기본 팝업 끄기
      selectionIndicator: false, // 클릭 시 나오는 초록색 테두리 끄기
      // scene3DOnly:true, // 3D 모드 고정
      creditContainer: document.createElement("div") // 크레딧 표시 영역 제거
    });

    // 한국 좌표로 초기 카메라 설정 (Cesium은 라디안 단위 사용)
    cesiumViewer.value.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(127.5, 36.5, 1000000.0)
    });
  }
};

onMounted(() => {
  initCesium();
});

// 컴포넌트가 소멸되기 직전에 호출 (메모리 누수 방지를 위한 객체 제거)
onBeforeUnmount(() => {
  if (cesiumViewer.value) {
    cesiumViewer.value.destroy();
  }
});
</script>

<template>
  <!-- 지도가 그려질 컨테이너 영역 -->
  <main class="flex-1 relative z-0">
    <div ref="cesiumContainer" style="height: 100%; width: 100%;"></div>

    <!-- 조위관측소 상세 모달 -->
    <ObsDetailModal />
  </main>
</template>

<style scoped>
</style>
