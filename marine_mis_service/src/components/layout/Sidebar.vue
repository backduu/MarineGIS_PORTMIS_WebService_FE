<script setup lang="ts">
import { ref } from 'vue';
import { sidebarMenu } from '@/constants/menuData';
import { useMapStore } from '@/store/useMapStore';

/**
 * Sidebar.vue: 좌측 사이드바 메뉴 컴포넌트입니다.
 * 3D 디지털 트윈 관련 메뉴가 배치될 예정입니다.
 */

const menuItems = ref([...sidebarMenu]);
const mapStore = useMapStore();

const toggleMenu = (index: number) => {
  menuItems.value[index].isOpen = !menuItems.value[index].isOpen;
};

const getSubMenuName = (subMenu: any) => {
  return typeof subMenu === 'string' ? subMenu : subMenu.name;
};
</script>

<template>
  <!-- 좌측에 고정된 사이드바 영역 -->
  <aside class="absolute top-4 left-4 bottom-4 bg-cy-panel/85 backdrop-blur w-64 flex flex-col z-10 rounded-sm border border-neon-cyan/50 text-neon-cyan/80 font-mono-cyber glow-cyan overflow-hidden">
    <!-- 상단 네온 라인 -->
    <div class="h-0.5 bg-gradient-to-r from-neon-cyan via-neon-pink to-transparent"></div>

    <!-- 사이드바 제목 -->
    <div class="p-4 font-cyber font-bold uppercase tracking-[0.3em] text-neon-cyan text-glow-cyan border-b border-neon-cyan/30">3D Digital Twin</div>

    <!-- 메뉴 네비게이션 목록 -->
    <nav class="flex-1 overflow-y-auto p-4 text-sm">
      <ul class="space-y-2">
        <li v-for="(menu, index) in menuItems" :key="menu.name">
          <div 
            class="p-2 border-l-2 border-transparent hover:border-neon-pink hover:bg-neon-cyan/10 hover:text-neon-cyan cursor-pointer flex justify-between items-center uppercase tracking-wider transition-colors duration-200"
            @click="toggleMenu(index)"
          >
            <span>{{ menu.name }}</span>
            <span class="transform transition-transform duration-200" :class="{ 'rotate-180': menu.isOpen }">
              ▼
            </span>
          </div>
          
          <transition name="expand">
            <ul v-if="menu.isOpen" class="pl-4 mt-1 space-y-1 overflow-hidden">
              <li 
                v-for="subMenu in menu.subMenus" 
                :key="getSubMenuName(subMenu)"
                class="flex flex-col space-y-1"
              >
                <div class="p-2 border-l-2 border-neon-cyan/20 hover:border-neon-pink hover:bg-neon-cyan/10 cursor-pointer text-neon-cyan/60 hover:text-neon-cyan transition-colors duration-200 flex justify-between items-center">
                  <span>{{ getSubMenuName(subMenu) }}</span>
                </div>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
      <div class="mt-8 p-4 border border-dashed border-neon-yellow/60 bg-neon-yellow/5">
        <p class="text-xs text-neon-yellow font-semibold mb-1 uppercase tracking-widest flex items-center gap-2">
          <span class="inline-block h-1.5 w-1.5 bg-neon-yellow shadow-[0_0_6px_#fcee0a] animate-pulse"></span>
          3D Globe Mode Active
        </p>
        <p class="text-[10px] text-neon-yellow/70">CesiumJS 엔진을 통한 3D 공간 정보 서비스가 제공됩니다.</p>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 200px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
