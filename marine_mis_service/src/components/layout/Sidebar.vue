<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { sidebarMenu, type SubMenuItem } from '@/constants/menuData';
import { useMapStore } from '@/store/useMapStore';
import { useUserStore } from '@/store/useUserStore';

/**
 * Sidebar.vue: 좌측 사이드바 메뉴 컴포넌트입니다.
 * 각종 관리 기능 및 설정으로 이동할 수 있는 메뉴 목록을 포함합니다.
 */

const menuItems = ref([...sidebarMenu]);
const mapStore = useMapStore();
const userStore = useUserStore();

onMounted(() => {
  // 초기 로드 시 필요한 작업이 있으면 정의 (현재는 토글 시 로딩으로 변경됨)
});

const toggleMenu = (index: number) => {
  menuItems.value[index].isOpen = !menuItems.value[index].isOpen;
};

const handleRegionChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  mapStore.updateViewParams(value);
  
  // 지역이 목록에 존재하는지 확인 후 위치 정보 요청
  const isValidRegion = mapStore.regions.some(r => r.sggNam === value);
  if (isValidRegion) {
    mapStore.fetchRegionLocation(value);
  }
};

const clearSearch = () => {
  mapStore.updateViewParams('');
};

const handleViewModeChange = (mode: 'coastal' | 'open-sea') => {
  /*모드 전환 시 이전 모드의 상태들을 초기화 (사이드바 메뉴 상태 포함)*/
  if (mapStore.viewMode !== mode) {
    menuItems.value.forEach(menu => {
      if (menu.subMenus) {
        menu.subMenus.forEach(subMenu => {
          if (typeof subMenu === 'object' && subMenu.isToggleable) {
            subMenu.isOn = false;
          }
        });
      }
    });
  }
  
  mapStore.setViewMode(mode);
  console.log('View mode changed to:', mode);
};

const toggleLayer = (subMenu: any) => {
  if (typeof subMenu === 'object' && subMenu.isToggleable) {
    // 해안선 레이어(korea_coastline) 관련 기능의 경우 로그인 여부 확인
    const isCoastlineRelated = subMenu.layerId === 'korea_coastline' || 
                             subMenu.type === 'style';
                             
    if (isCoastlineRelated && !userStore.user) {
      alert('해안선 관련 기능은 로그인 후 이용 가능합니다.');
      return;
    }

    subMenu.isOn = !subMenu.isOn;

    if (subMenu.type === 'style') {
      mapStore.setStyleMode(subMenu.isOn ? 'analysis' : 'default');

      if (subMenu.isOn) {
        mapStore.fetchRegions();
      }
    }

    console.log(`${subMenu.name} is now ${subMenu.isOn ? 'ON' : 'OFF'}`);
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

    <!-- 해안선 모드 / 개방해 모드 전환 탭 -->
    <div class="px-4 py-3 bg-white border-b border-gray-200">
      <div class="flex bg-gray-100 p-1 rounded-lg">
        <button
          @click="handleViewModeChange('coastal')"
          class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200"
          :class="mapStore.viewMode === 'coastal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          해안선 모드
        </button>
        <button
          @click="handleViewModeChange('open-sea')"
          class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200"
          :class="mapStore.viewMode === 'open-sea' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          개방해 모드
        </button>
      </div>
    </div>
    
    <!-- 메뉴 네비게이션 목록 -->
    <nav class="flex-1 overflow-y-auto p-4 text-sm">
      <!-- 모드에 따른 컨텐츠 필터링 -->
      <ul v-if="mapStore.viewMode === 'coastal'" class="space-y-2">
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
                <div
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
                </div>


                <!-- 검색 가능 선택창: 수심별 해안선 메뉴가 켜져 있을 때만 표시 -->
                <div v-if="typeof subMenu === 'object' && subMenu.type === 'style' && subMenu.isOn" class="px-2 pb-2">
                  <div class="relative flex items-center">
                    <input 
                      type="text"
                      list="region-list"
                      class="w-full p-2 pr-8 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="지역 검색/선택"
                      :value="mapStore.currentSearchVal"
                      @input="handleRegionChange"
                    />
                    <button 
                      v-if="mapStore.currentSearchVal"
                      class="absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      @click="clearSearch"
                      aria-label="검색어 초기화"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <datalist id="region-list">
                    <option v-for="region in mapStore.regions" :key="region.id" :value="region.sggNam">
                      {{ region.sggNam }}
                    </option>
                  </datalist>
                </div>
                <!-- 필터형 메뉴 아이템 (제거됨) -->
              </li>
            </ul>
          </transition>
        </li>
      </ul>
      <!-- /*TODO: 개방해 모드 Placeholder, 추후 개방해 api관련 ui 추가*/ -->
      <div v-else-if="mapStore.viewMode === 'open-sea'" class="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-60">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span class="text-xs font-medium">개방해 모드 준비 중...</span>
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
