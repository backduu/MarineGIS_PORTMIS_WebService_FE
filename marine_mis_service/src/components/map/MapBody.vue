<script setup lang="ts">
/**
 * MapBody.vue: CesiumJS를 사용하여 3D 디지털 트윈 지도를 표시하고 관리하는 컴포넌트입니다.
 */
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/useMapStore';
import ObsDetailModal from "@/components/map/ObsDetailModal.vue";
import { MAJOR_PORTS, type PortLandmark } from "@/constants/ports";

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
      navigationHelpButton: false, // 도움말 제공 (마우스 활용)
      sceneModePicker: false, // 2D/3D 모드 변경 가능
      baseLayerPicker: false, // 기본 레이어 선택 기능
      geocoder: false, // 위치 검색 기능
      homeButton: false,
      fullscreenButton: false,
      infoBox: false, // 세슘 기본 팝업 끄기
      selectionIndicator: false, // 클릭 시 나오는 초록색 테두리 끄기
      // scene3DOnly:true, // 3D 모드 고정
      creditContainer: document.createElement("div") // 크레딧 표시 영역 제거
    });

    addLandmarks(cesiumViewer.value);

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

// 뷰를 한국 해역 중심으로 초기화
const resetView = () => {
  if(cesiumViewer.value) {
    cesiumViewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(127.5, 36.5, 1200000.0),
      duration: 1.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }
}

// 대표 항만 랜드마크 마킹
const addLandmarks = (viewer: Cesium.Viewer, portList: PortLandmark[] = MAJOR_PORTS) => {
  portList.forEach(port => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(port.lon, port.lat, port.height ?? 500),
      label: {
        text: port.name,
        font: 'bold 12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#3b82f6'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
  });
}
</script>

<template>
  <!-- 지도가 그려질 컨테이너 영역 -->
  <main class="flex-1 relative z-0">
    <div ref="cesiumContainer" style="height: 100%; width: 100%;"></div>

    <!-- 리셋 버튼 -->
    <div class="absolute top-6 right-6 z-10 flex flex-col gap-2">
      <button
          @click="resetView"
          class="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-900 px-4 py-2.5 rounded-lg shadow-xl border border-blue-100 transition-all active:scale-95 font-bold text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        한국 해역 보기
      </button>
    </div>
    <!-- 조위관측소 상세 모달 -->
    <ObsDetailModal />
  </main>
</template>

<style scoped>
</style>
