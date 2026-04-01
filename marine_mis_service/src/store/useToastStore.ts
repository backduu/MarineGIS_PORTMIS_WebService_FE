import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

/**
 * 프로젝트 전체에서 사용될 Toast 메시지 상태를 관리하는 스토어입니다.
 */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([]);

  /**
   * 새로운 Toast 메시지를 추가합니다.
   * 동일한 메시지가 이미 표시중인지 확인할 수 있습니다.
   * @param message 표시할 메시지
   * @param type 메시지 타입 ('info', 'success', 'warning', 'error')
   * @param duration 표시 시간 (기본값: 3000ms)
   */
  const addToast = (message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    const isDuplicate = toasts.value.some(t => t.message === message);
    if (isDuplicate) return; // 이미 동일한 메시지가 떠 있다면 무시.

    const id = Math.random().toString(36).substring(2, 11);
    const newToast: ToastMessage = {id, message, type, duration};

    toasts.value.push(newToast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  /**
   * 특정 ID의 Toast 메시지를 제거합니다.
   * @param id 제거할 메시지 ID
   */
  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return {
    toasts,
    addToast,
    removeToast
  };
});
