<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue';
import MapBody from '@/components/map/MapBody.vue';
</script>

<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- 사이드바 영역 -->
    <Sidebar />

    <!-- 메인 바디 영역: Leaflet 지도가 표시됩니다. -->
    <MapBody />
  </div>
</template>

<style scoped>
</style>
