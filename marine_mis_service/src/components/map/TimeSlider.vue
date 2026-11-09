<script setup lang="ts">

import { computed, onBeforeUnmount, watch } from 'vue'; // [수정 4] watch 추가

const props = defineProps<{
  dates?: string[];
}>();

const index = defineModel<number | undefined>();
const playing = defineModel<boolean>('playing', { default: false });

// 재생 간격(ms)
const PLAY_INTERVAL_MS = 1000;

// 타이머 ID 저장 변수
let timerId: ReturnType<typeof setInterval> | null = null;

// 로컬 시간 기준 YYYY-MM-DD (toISOString은 UTC라 한국 시간대에서 하루가 어긋날 수 있음)
const formatDate = (d: Date) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const buildRecentDates = (days: number) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return formatDate(d);
  });
};

const dateList = computed(() => (props.dates && props.dates.length > 0 ? props.dates : buildRecentDates(30)));
const lastIndex = computed(() => dateList.value.length - 1);

// 모델이 비어 있으면 마지막 날짜, 범위를 벗어나면 보정
const current = computed(() => Math.min(Math.max(index.value ?? lastIndex.value, 0), lastIndex.value));
const currentDate = computed(() => dateList.value[current.value]);
const progress = computed(() => (lastIndex.value === 0 ? 100 : (current.value / lastIndex.value) * 100));

const canPrev = computed(() => current.value > 0);
const canNext = computed(() => current.value < lastIndex.value);

const setIndex = (next: number) => {
  index.value = Math.min(Math.max(next, 0), lastIndex.value);
};

const onSliderInput = (e: Event) => {
  playing.value = false; // 직접 조작하면 재생 정지
  setIndex(Number((e.target as HTMLInputElement).value));
};

const stepBy = (delta: number) => {
  playing.value = false;
  setIndex(current.value + delta);
};

const stopTimer = () => {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
};

const tick = () => {
  const next = current.value + 1;
  setIndex(next);
  // 마지막 날짜에 도달한 즉시 멈춘다
  if (next >= lastIndex.value) {
    playing.value = false;
  }
};

watch(
  playing,
  (isPlaying) => {
    stopTimer(); // 중복 타이머 방지: 시작 전에 항상 기존 것부터 정리
    if (isPlaying) {
      if (current.value >= lastIndex.value) {
        setIndex(0);
      }
      timerId = setInterval(tick, PLAY_INTERVAL_MS);
    }
  },
  { immediate: true }, // 부모가 처음부터 playing=true 로 넘겨도 동작하게
);

const togglePlay = () => {
  playing.value = !playing.value;
};

// 컴포넌트가 unmount되기 전에 타이머 정리
onBeforeUnmount(stopTimer);
</script>

<template>
  <section
    class="absolute bottom-4 left-[18rem] right-6 mx-auto max-w-xl z-10 bg-cy-panel/85 backdrop-blur border border-neon-cyan/50 glow-cyan font-mono-cyber text-neon-cyan/80 px-3 py-2 select-none"
  >
    <!-- 상단 네온 라인 -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-neon-cyan via-neon-pink to-transparent"></div>

    <div class="flex items-center gap-3">
      <!-- 컨트롤 버튼 -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="!canPrev"
          @click="stepBy(-1)"
          class="ctrl-btn"
          aria-label="하루 전"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM9.5 12 18 6v12z" /></svg>
        </button>

        <button
          type="button"
          @click="togglePlay"
          class="ctrl-btn"
          :class="{ 'ctrl-btn-active': playing }"
          :aria-label="playing ? '일시정지' : '재생'"
        >
          <svg v-if="!playing" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
        </button>

        <button
          type="button"
          :disabled="!canNext"
          @click="stepBy(1)"
          class="ctrl-btn"
          aria-label="하루 후"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18V6l8.5 6z" /></svg>
        </button>
      </div>

      <!-- 현재 날짜 -->
      <span class="font-cyber text-xs font-bold tracking-wider text-neon-cyan text-glow-cyan whitespace-nowrap">{{ currentDate }}</span>

      <!-- 슬라이더 -->
      <input
        type="range"
        class="time-range flex-1"
        min="0"
        :max="lastIndex"
        step="1"
        :value="current"
        :style="{ '--progress': progress + '%' }"
        aria-label="날짜 선택"
        @input="onSliderInput"
      />
    </div>
  </section>
</template>

<style scoped>
/* 컨트롤 버튼 */
.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  border: 1px solid var(--color-neon-cyan, #00f0ff);
  color: var(--color-neon-cyan, #00f0ff);
  transition: all 0.2s;
}
.ctrl-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-neon-cyan, #00f0ff) 20%, transparent);
  box-shadow: 0 0 6px #00f0ff55;
}
.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.ctrl-btn-active {
  border-color: var(--color-neon-pink, #c2306f);
  color: var(--color-neon-pink, #c2306f);
  background: color-mix(in srgb, var(--color-neon-pink, #c2306f) 20%, transparent);
}

/* 슬라이더 (진행된 구간은 시안, 남은 구간은 옅게) */
.time-range {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: linear-gradient(
    to right,
    var(--color-neon-cyan, #00f0ff) var(--progress, 0%),
    color-mix(in srgb, var(--color-neon-cyan, #00f0ff) 20%, transparent) var(--progress, 0%)
  );
  outline: none;
  cursor: pointer;
}

/* Chrome / Edge / Safari */
.time-range::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
}
.time-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 22px;
  margin-top: -8px; /* (트랙 6px - 손잡이 22px) / 2 */
  background: var(--color-cy-bg, #07060f);
  border: 2px solid var(--color-neon-pink, #c2306f);
  box-shadow: 0 0 6px #c2306f88;
  transition: box-shadow 0.2s;
}
.time-range:hover::-webkit-slider-thumb,
.time-range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 10px #c2306fcc;
}

/* Firefox */
.time-range::-moz-range-track {
  height: 6px;
  background: color-mix(in srgb, var(--color-neon-cyan, #00f0ff) 20%, transparent);
}
.time-range::-moz-range-progress {
  height: 6px;
  background: var(--color-neon-cyan, #00f0ff);
}
.time-range::-moz-range-thumb {
  width: 10px;
  height: 18px;
  border-radius: 0;
  background: var(--color-cy-bg, #07060f);
  border: 2px solid var(--color-neon-pink, #c2306f);
  box-shadow: 0 0 6px #c2306f88;
}
</style>
