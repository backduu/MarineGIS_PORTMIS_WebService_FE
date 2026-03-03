import { defineStore } from 'pinia'; // Pinia 스토어 정의를 위한 함수
import api from '@/api/axios'; // 설정된 Axios 인스턴스

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  username: string;
  name: string;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
  lastLogin?: string;
}

/**
 * 사용자 정보와 관련된 상태 및 액션을 관리하는 Pinia 스토어
 * React의 Zustand와 유사하게 상태(state), 액션(actions)을 정의합니다.
 */
export const useUserStore = defineStore('user', {
  /**
   * 상태(State): 애플리케이션에서 유지되는 데이터
   * Vue 3의 reactive와 유사하게 작동하며, 상태 변화는 컴포넌트에서 감지됩니다.
   */
  state: () => ({
    user: null as User | null, // 사용자 정보 데이터
    isLoading: false,   // 데이터 로딩 상태
    error: null as string | null, // 에러 메시지
  }),

  /**
   * 액션(Actions): 상태를 변경하거나 비즈니스 로직을 처리하는 함수
   * 컴포넌트 내부의 메서드처럼 사용됩니다.
   */
  actions: {
    // 로그인 액션 추가
    async login(loginData: any) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', loginData);
        // 백엔드 Response DTO에 맞춰 상태 저장
        this.user = {
          username: response.data.username,
          name: response.data.name,
          role: response.data.role,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          lastLogin: response.data.lastLogin
        };
        
        // 로컬 스토리지 등에 토큰 저장 로직이 필요할 수 있음
        localStorage.setItem('accessToken', response.data.accessToken);
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || '로그인에 실패했습니다.';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    // TODO 자동로그인 로직시 사용 예정
    // 특정 ID를 가진 사용자 데이터를 API로부터 가져오는 비동기 액션
    async fetchUser(userId: number = 1) {
      this.isLoading = true; // 로딩 시작
      this.error = null;     // 이전 에러 초기화
      try {
        // Axios를 이용한 API 요청
        const response = await api.get(`/users/${userId}`);
        // 성공 시 응답 데이터를 상태에 저장
        this.user = response.data;
      } catch (error: any) {
        // 실패 시 에러 메시지 저장
        this.error = error.message;
      } finally {
        this.isLoading = false; // 성공/실패 여부와 관계없이 로딩 종료
      }
    },
    // 저장된 사용자 정보를 초기화하는 액션
    clearUser() {
      this.user = null;
    },
  },
});
