<script setup lang="ts">
import { ref } from 'vue';
import { sidebarMenu, type SubMenuItem } from '@/constants/menuData';
import { useMapStore } from '@/store/useMapStore';

/**
 * Sidebar.vue: 좌측 사이드바 메뉴 컴포넌트입니다.
 * 각종 관리 기능 및 설정으로 이동할 수 있는 메뉴 목록을 포함합니다.
 */

const menuItems = ref([...sidebarMenu]);
const mapStore = useMapStore();

const toggleMenu = (index: number) => {
  menuItems.value[index].isOpen = !menuItems.value[index].isOpen;
};

const toggleLayer = (subMenu: any) => {
  if (typeof subMenu === 'object' && subMenu.isToggleable) {
    subMenu.isOn = !subMenu.isOn;
    
    // 연결된 레이어 ID가 있는 경우 스토어의 상태 업데이트
    if (subMenu.layerId) {
      mapStore.setLayerStatus(subMenu.layerId, subMenu.isOn);
    }

    /*console.log(`${subMenu.name} is now ${subMenu.isOn ? 'ON' : 'OFF'}`);*/
  }
};

const getSubMenuName = (subMenu: string | SubMenuItem) => {
  return typeof subMenu === 'string' ? subMenu : subMenu.name;
};
</script>`

<template>
  <!-- 좌측에 고정된 사이드바 영역 -->
  <aside class="bg-gray-100 w-64 border-r border-gray-300 flex-shrink-0 flex flex-col">
    <!-- 사이드바 제목 -->
    <div class="p-4 font-bold border-b border-gray-300">Menu</div>
    
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
                class="p-2 hover:bg-gray-200 rounded cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200 flex justify-between items-center"
                @click="toggleLayer(subMenu)"
              >
                <span>{{ getSubMenuName(subMenu) }}</span>
                <!-- Toggle Switch for Layer on/off -->
                <div 
                  v-if="typeof subMenu === 'object' && subMenu.isToggleable"
                  class="relative inline-block w-10 h-5 transition duration-200 ease-in-out"
                >
                  <input 
                    type="checkbox" 
                    :checked="subMenu.isOn" 
                    class="opacity-0 w-0 h-0"
                    readonly
                  />
                  <span 
                    class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200"
                    :class="subMenu.isOn ? 'bg-blue-500' : 'bg-gray-300'"
                  ></span>
                  <span 
                    class="absolute left-1 bottom-1 bg-white w-3 h-3 rounded-full transition-transform duration-200 transform"
                    :class="{ 'translate-x-5': subMenu.isOn }"
                  ></span>
                </div>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
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
