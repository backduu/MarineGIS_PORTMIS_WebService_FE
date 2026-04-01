<script setup lang="ts">
/**
 * script setup: Vue 3의 Composition API를 간결하게 사용할 수 있는 구문입니다.
 * 컴포넌트 내부에서 반응형 상태, 라이프사이클 훅, 스토어 등을 설정합니다.
 */
import { onMounted } from 'vue'; // 컴포넌트가 DOM에 마운트된 후 실행할 작업을 위한 훅
import { useUserStore } from '@/store/useUserStore'; // 사용자 상태 관리를 위한 Pinia 스토어
import Header from '@/components/layout/Header.vue'; // 상단 헤더 컴포넌트
import Footer from '@/components/layout/Footer.vue'; // 하단 푸터 컴포넌트
import ToastContainer from '@/components/common/ToastContainer.vue'; // 토스트 메시지 컨테이너
import './App.css'; // App 전용 스타일

const userStore = useUserStore();

// 앱이 처음 로드되거나 새로고침 될 때 실행
onMounted(() => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('accessToken');
  
  // 로컬 스토리지에 사용자 정보와 토큰이 있다면 스토어 상태를 복구
  if (savedUser && token) {
    userStore.user = JSON.parse(savedUser);
  }
});

</script>

<template>
  <!-- 전체 레이아웃 구성을 담당하는 루트 태그 -->
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 헤더 영역 -->
    <Header />

    <!-- 메인 컨텐츠 영역 (라우터 뷰를 통한 동적 렌더링) -->
    <RouterView />

    <!-- 푸터 영역 -->
    <Footer />

    <!-- 토스트 메시지 알림 영역 -->
    <ToastContainer />
  </div>
</template>

<style scoped>
/* style scoped: 해당 컴포넌트 내에서만 적용되는 CSS 스타일 정의 */
</style>
