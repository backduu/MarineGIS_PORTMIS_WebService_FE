<script setup lang="ts">
import { useToastStore } from '@/store/useToastStore';

/**
 * ToastContainer 컴포넌트입니다.
 * useToastStore에서 관리되는 모든 메시지를 화면 우측 하단에 표시합니다.
 */
const toastStore = useToastStore();
</script>

<template>
  <div class="fixed bottom-10 right-10 flex flex-col gap-2 z-[9999]">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="min-w-[200px] px-4 py-3 rounded-lg shadow-lg text-white flex justify-between items-center transition-all"
        :class="{
          'bg-blue-500': toast.type === 'info',
          'bg-green-500': toast.type === 'success',
          'bg-yellow-500': toast.type === 'warning',
          'bg-red-500': toast.type === 'error'
        }"
      >
        <span>{{ toast.message }}</span>
        <button 
          @click="toastStore.removeToast(toast.id)"
          class="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
