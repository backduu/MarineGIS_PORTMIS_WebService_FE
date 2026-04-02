<script setup lang="ts">
  import { useMapStore } from '@/store/useMapStore';

  const mapStore = useMapStore();

  const closeModal = () => {
    mapStore.isObsModalOpen = false; // 모달창 closed
  }
</script>

<template>
  <Transition name="fade">
    <!-- 배경 -->
    <div
        v-if="mapStore.isObsModalOpen"
        class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
    >
      <!-- 모달 컨테이너 -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">

        <!-- 헤더 영역 -->
        <div class="flex justify-between items-center bg-[#af146a] p-4 text-white">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 class="text-lg font-bold">조위관측소 상세 정보</h3>
          </div>
          <button @click="closeModal" class="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 본문 영역 -->
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <p class="text-xs text-gray-500 font-semibold uppercase">관측소 코드</p>
              <p class="text-lg font-bold text-gray-800">{{ mapStore.selectedObsCode || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-semibold uppercase">조회 기간</p>
              <p class="text-sm font-medium text-gray-700">
                {{ mapStore.selectedStartDate }} ~ {{ mapStore.selectedEndDate }}
              </p>
            </div>
          </div>

          <!-- 데이터 표시 영역 (추후 차트나 테이블이 들어갈 자리) -->
          <div class="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p class="text-gray-500 font-medium italic">해당 기간의 상세 관측 데이터(조위, 수온 등)가 로드될 예정입니다.</p>
              <p class="text-xs text-gray-400 mt-2">API 연동 후 차트 또는 리스트 형식으로 구현 가능합니다.</p>
            </div>
          </div>
        </div>

        <!-- 푸터 영역 -->
        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
              @click="closeModal"
              class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-md transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 애니메이션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>