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
  <aside class="bg-gray-100 w-64 border-r border-gray-300 flex-shrink-0 flex flex-col">
    <!-- 사이드바 제목 -->
    <div class="p-4 font-bold border-b border-gray-300">3D Digital Twin</div>

    <!-- 메뉴 네비게이션 목록 -->
    <nav class="flex-1 overflow-y-auto p-4 text-sm">
      <ul class="space-y-2">
        <li v-for="(menu, index) in menuItems" :key="menu.name">
          <div 
            class="p-2 hover:bg-gray-200 rounded cursor-pointer flex justify-between items-center transition-colors duration-200"
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
                <div class="p-2 hover:bg-gray-200 rounded cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200 flex justify-between items-center">
                  <span>{{ getSubMenuName(subMenu) }}</span>
                </div>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
      <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p class="text-xs text-blue-800 font-semibold mb-1">3D Globe Mode Active</p>
        <p class="text-[10px] text-blue-600">CesiumJS 엔진을 통한 3D 공간 정보 서비스가 제공됩니다.</p>
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
