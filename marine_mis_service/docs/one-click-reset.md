# 원클릭 리셋(한국 해역 보기) 기능 구현 가이드

이 문서는 사용자가 3D 지도 조작 중 길을 잃었을 때, 즉시 한국 해역 중심으로 카메라를 복구하는 '원클릭 리셋' 기능의 구현 내용을 설명합니다.

## 1. 개요
3D 지도는 자유로운 회전과 이동이 가능하여 초보 사용자가 조작 시 위치를 놓치기 쉽습니다. 이를 방지하기 위해 고정된 '홈' 버튼을 제공하여 UX 안정성을 확보합니다.

## 2. 주요 로직 (Script)
`Cesium.Viewer.camera.flyTo` API를 사용하여 지정된 좌표로 부드럽게 이동합니다.

```typescript
// src/components/map/MapBody.vue

const resetView = () => {
  if(cesiumViewer.value) {
    cesiumViewer.value.camera.flyTo({
      // 중심 좌표: 경도 127.5, 위도 36.5, 높이 1,200km
      destination: Cesium.Cartesian3.fromDegrees(127.5, 36.5, 1200000.0),
      duration: 1.5, // 이동 시간 (초)
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT // 부드러운 가감속 효과
    });
  }
}
```

## 3. UI 구성 (Template)
지도의 우측 상단에 `absolute` 포지셔닝을 사용하여 버튼을 배치했습니다. Tailwind CSS를 활용해 반투명 배경과 클릭 피드백을 적용했습니다.

```html
<!-- 리셋 버튼 레이아웃 -->
<div class="absolute top-6 right-6 z-10 flex flex-col gap-2">
  <button
      @click="resetView"
      class="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-900 px-4 py-2.5 rounded-lg shadow-xl border border-blue-100 transition-all active:scale-95 font-bold text-sm"
  >
    <!-- Home Icon (SVG) -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
    한국 해역 보기
  </button>
</div>
```

## 4. 특징
- **부드러운 전환**: `flyTo`를 사용하여 급격한 화면 전환 대신 비행하는 듯한 애니메이션을 제공합니다.
- **높은 가독성**: `z-10` 설정을 통해 지도 레이어보다 항상 위에 표시되도록 설계되었습니다.
- **최적화**: `easingFunction`을 적용하여 시작과 끝이 부드러운 움직임을 구현했습니다.
