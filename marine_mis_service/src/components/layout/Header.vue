<script setup lang="ts">
import { useUserStore } from '@/store/useUserStore';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<template>
  <header class="bg-blue-800 text-white h-16 flex items-center justify-between px-6 shadow-md z-10">
    <div class="text-xl font-bold">Marine GIS Service</div>
    <div class="text-sm">
      <span v-if="user">환영합니다. <span class="font-semibold">{{ user.name }}</span>님</span>
      <span v-else>사용자 정보를 불러오는 중...</span>
    </div>
  </header>
</template>

<style scoped>
</style>
