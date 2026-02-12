import { create } from 'zustand';
import api from '../api/axios';

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // 사용자 정보 가져오기 (예시: user 1번 정보를 가져오는 함수)
  fetchUser: async (userId = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/${userId}`);
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 사용자 정보 초기화
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
