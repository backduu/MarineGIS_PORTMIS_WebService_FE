import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

/**
 * 라우터 설정 파일 (src/router/index.ts)
 * 
 * 애플리케이션의 모든 경로와 이에 대응하는 컴포넌트를 정의합니다.
 */

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/mypage',
    name: 'mypage',
    // 마이페이지 같은 경우 나중에 지연 로딩(Lazy Loading)으로 구현할 수 있습니다.
    component: () => import('@/views/HomeView.vue') // 현재는 임시로 HomeView 연결
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/HomeView.vue') // 현재는 임시로 HomeView 연결
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
