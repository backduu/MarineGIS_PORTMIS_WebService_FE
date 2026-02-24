<script setup lang="ts">
/**
 * Sidebar.vue: 좌측 사이드바 메뉴 컴포넌트입니다.
 * 각종 관리 기능 및 설정으로 이동할 수 있는 메뉴 목록을 포함합니다.
 */
</script>

<template>
  <!-- 좌측에 고정된 사이드바 영역 -->
  <aside class="bg-gray-100 w-64 border-r border-gray-300 flex-shrink-0 flex flex-col">
    <!-- 사이드바 제목 -->
    <div class="p-4 font-bold border-b border-gray-300">Menu</div>
    
    <!-- 메뉴 네비게이션 목록 -->
    <nav class="flex-1 overflow-y-auto p-4">
      <ul class="space-y-2">
        <li class="p-2 hover:bg-gray-200 rounded cursor-pointer">지도 레이어 관리</li>
        <li class="p-2 hover:bg-gray-200 rounded cursor-pointer">선박 위치 추적</li>
        <li class="p-2 hover:bg-gray-200 rounded cursor-pointer">항만 시설 정보</li>
        <li class="p-2 hover:bg-gray-200 rounded cursor-pointer">시스템 설정</li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
</style>
