# 랜드마크 마커 애니메이션 구현 가이드

이 문서는 CesiumJS의 `CallbackProperty`를 사용하여 주요 항만 마커에 동적인 시각 효과를 적용하는 방법을 설명합니다.

## 1. 구현 목표
- 정적인 점(Point) 형태의 마커에 펄스(Pulse) 효과를 부여하여 시인성을 높임.
- 지도 조작 시에도 부드럽게 유지되는 애니메이션 구현.

## 2. 핵심 로직
마커의 `pixelSize`와 `color` 속성에 실시간 계산 로직을 주입합니다.

```typescript
pixelSize: new Cesium.CallbackProperty((time) => {
  const seconds = time.secondsOfDay;
  return 8 + Math.abs(Math.sin(seconds * 2.5)) * 10;
}, false)