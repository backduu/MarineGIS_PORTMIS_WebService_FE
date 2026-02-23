<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/store/useUserStore';
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import MapBody from '@/components/map/MapBody.vue';
import './App.css';

const userStore = useUserStore();

onMounted(() => {
  // 초기 사용자 정보 로드 (예시로 ID 1번 사용자 가져옴)
  userStore.fetchUser(1);
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 헤더 -->
    <Header />

    <div class="flex flex-1 overflow-hidden">
      <!-- 사이드바 -->
      <Sidebar />

      <!-- 바디 (지도 표시) -->
      <MapBody />
    </div>

    <!-- 푸터 -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
