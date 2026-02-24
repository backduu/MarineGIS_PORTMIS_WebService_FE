<script setup lang="ts">
/**
 * script setup: Vue 3의 Composition API를 간결하게 사용할 수 있는 구문입니다.
 * 컴포넌트 내부에서 반응형 상태, 라이프사이클 훅, 스토어 등을 설정합니다.
 */
import { onMounted } from 'vue'; // 컴포넌트가 DOM에 마운트된 후 실행할 작업을 위한 훅
import { useUserStore } from '@/store/useUserStore'; // 사용자 상태 관리를 위한 Pinia 스토어
import Header from '@/components/layout/Header.vue'; // 상단 헤더 컴포넌트
import Footer from '@/components/layout/Footer.vue'; // 하단 푸터 컴포넌트
import Sidebar from '@/components/layout/Sidebar.vue'; // 좌측 사이드바 컴포넌트
import MapBody from '@/components/map/MapBody.vue'; // 메인 지도 컴포넌트
import './App.css'; // App 전용 스타일

// Pinia 스토어 인스턴스를 가져옴
const userStore = useUserStore();

// 컴포넌트 마운트 시 실행되는 라이프사이클 훅
onMounted(() => {
  // 초기 사용자 정보 로드 (예시로 ID 1번 사용자 정보를 API로부터 가져옴)
  userStore.fetchUser(1);
});
</script>

<template>
  <!-- 전체 레이아웃 구성을 담당하는 루트 태그 -->
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 헤더 영역 -->
    <Header />

    <!-- 메인 컨텐츠 영역 (사이드바 + 지도) -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 사이드바 영역 -->
      <Sidebar />

      <!-- 메인 바디 영역: Leaflet 지도가 표시됩니다. -->
      <MapBody />
    </div>

    <!-- 푸터 영역 -->
    <Footer />
  </div>
</template>

<style scoped>
/* style scoped: 해당 컴포넌트 내에서만 적용되는 CSS 스타일 정의 */
</style>
