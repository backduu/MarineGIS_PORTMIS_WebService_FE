import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as any,
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchUser(userId: number = 1) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/users/${userId}`);
        this.user = response.data;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    clearUser() {
      this.user = null;
    },
  },
});
