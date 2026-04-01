<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { sidebarMenu, type SubMenuItem } from '@/constants/menuData';
import { useMapStore } from '@/store/useMapStore';
import { useUserStore } from '@/store/useUserStore';
import {observatoryLocationService} from "@/services/observatoryService";

/**
 * Sidebar.vue: 좌측 사이드바 메뉴 컴포넌트입니다.
 * 각종 관리 기능 및 설정으로 이동할 수 있는 메뉴 목록을 포함합니다.
 */

const menuItems = ref([...sidebarMenu]);
const mapStore = useMapStore();
const userStore = useUserStore();

// 커스텀 셀렉트 박스 상태 관리
const isObsDropdownOpen = ref(false);
const selectedObsLabel = ref('관측소를 선택하세요');

onMounted(async () => {
  // 초기 로드 시 조위관측소 첫 페이지 로드
  await mapStore.resetAndFetchObservatoryLocations();
});

const toggleMenu = (index: number) => {
  menuItems.value[index].isOpen = !menuItems.value[index].isOpen;
};

// 조위관측소 드롭다운 토글
const toggleObsDropdown = () => {
  isObsDropdownOpen.value = !isObsDropdownOpen.value;
};

// 조위관측소 선택 처리
const selectObs = (obs: any, subMenu: any) => {
  selectedObsLabel.value = obs.obsvtrNm;
  subMenu.value = obs.obsvtrNm; // 또는 ID가 있다면 ID 사용
  handleObsChangeManual(obs.obsvtrNm, subMenu);
  isObsDropdownOpen.value = false;
};

// 드롭다운 스크롤 이벤트 핸들러
const handleObsScroll = async (event: Event) => {
  const target = event.target as HTMLElement;
  // 스크롤이 바닥에 닿았는지 확인 (여유값 5px)
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
    await mapStore.fetchNextObservatoryLocations();
  }
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

    /*실측 수온 토글 시 API 호출 또는 데이터 초기화*/
    if (subMenu.value === 'temp') {
      if (subMenu.isOn) {
        mapStore.fetchWaterTemp();
      } else {
        mapStore.clearWaterTemp();
      }
    }

    /*토글된 메뉴가 레이어 타입인 경우 mapStore의 해당 레이어 상태 업데이트*/
    if (subMenu.type === 'layer' && subMenu.layerId) {
      mapStore.setLayerStatus(subMenu.layerId, { isOn: subMenu.isOn });
    }

    if (subMenu.type === 'style') {
      mapStore.setStyleMode(subMenu.isOn ? 'analysis' : 'default');

      if (subMenu.isOn) {
        mapStore.fetchRegions();
      }
    }

    console.log(`${subMenu.name} is now ${subMenu.isOn ? 'ON' : 'OFF'}`);
  }
};

const handleObsChange = async (event: Event, subMenu: any) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value;

  await handleObsChangeManual(selectedValue, subMenu);
};

const handleObsChangeManual = async (selectedValue: string, subMenu: any) => {
  // 선택된 값 저장
  subMenu.value = selectedValue;

  // 선택된 관측소에 따라 지도 레이어 상태를 업데이트
  if (selectedValue === '전체 관측소') {
    mapStore.setLayerStatus('ocean_obs_location', {
      isOn: true,
      cqlFilter: ''
    });
  } else {
    mapStore.setLayerStatus('ocean_obs_location', {
      isOn: true,
      cqlFilter: `obsvtr_nm = '${selectedValue}'`
    });
    console.log(`Selected observatory: ${selectedValue}`);
    
    // API 호출 시 페이징 파라미터 적용
    // const location = await observatoryLocationService.getObservationLocation(1, 10);
    // console.log('API Response:', location);
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
        <li v-for="(menu, index) in menuItems.filter(m => m.name !== '조위 관측소 조회')" :key="menu.name">
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
<!--                    <input -->
<!--                      type="text"-->
<!--                      list="region-list"-->
<!--                      class="w-full p-2 pr-8 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"-->
<!--                      placeholder="지역 검색/선택"-->
<!--                      :value="mapStore.currentSearchVal"-->
<!--                      @input="handleRegionChange"-->
<!--                    />-->
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
      <!-- /*개방해 모드 전용 UI*/ -->
      <div v-else-if="mapStore.viewMode === 'open-sea'" class="space-y-6">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            배경지도 선택
          </h4>
          <div class="space-y-2">
            <label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
              <input 
                type="radio" 
                name="basemap" 
                value="BASEMAP_RLTM3857"
                :checked="mapStore.baseMapMode === 'BASEMAP_RLTM3857'"
                @change="mapStore.setBaseMapMode('BASEMAP_RLTM3857')"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="text-xs">기본 배경지도 (Vectormap)</span>
            </label>
            <label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
              <input 
                type="radio" 
                name="basemap" 
                value="BASEMAP_ENC573857"
                :checked="mapStore.baseMapMode === 'BASEMAP_ENC573857'"
                @change="mapStore.setBaseMapMode('BASEMAP_ENC573857')"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="text-xs">전자해도 (ENC)</span>
            </label>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            조위관측소 조회
          </h4>
          <p class="text-[11px] text-gray-400 italic mb-3">* 실시간 API 데이터 연동</p>

          <div class="space-y-1">
            <template v-for="menu in menuItems">
              <template v-if="menu.name === '조위 관측소 조회'">
                <div 
                  v-for="subMenu in menu.subMenus" 
                  :key="getSubMenuName(subMenu)"
                  class="flex flex-col space-y-1"
                >
                  <!-- 커스텀 무한 스크롤 선택박스 형태 (조위관측소 선택) -->
                  <div 
                    v-if="typeof subMenu === 'object' && subMenu.options"
                    class="p-2 space-y-2"
                  >
                    <label class="text-xs text-gray-600 font-semibold">{{ getSubMenuName(subMenu) }}</label>
                    <div class="relative">
                      <div 
                        @click="toggleObsDropdown"
                        class="w-full p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer flex justify-between items-center"
                      >
                        <span>{{ selectedObsLabel }}</span>
                        <span class="text-gray-400 text-[10px]">▼</span>
                      </div>
                      
                      <!-- 드롭다운 목록 영역 -->
                      <div 
                        v-if="isObsDropdownOpen"
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto"
                        @scroll="handleObsScroll"
                      >
                        <div 
                          class="p-2 text-xs hover:bg-blue-50 cursor-pointer text-gray-500 italic border-b border-gray-100"
                          @click="selectObs({obsvtrNm: '전체 관측소'}, subMenu)"
                        >
                          전체 관측소
                        </div>
                        <div 
                          v-for="obs in mapStore.obsLocations" 
                          :key="obs.obsvtrNm"
                          @click="selectObs(obs, subMenu)"
                          class="p-2 text-xs hover:bg-blue-50 cursor-pointer text-gray-700"
                        >
                          {{ obs.obsvtrNm }}
                        </div>
                        <!-- 로딩 표시 -->
                        <div v-if="mapStore.isLoadingObs" class="p-2 text-center text-[10px] text-gray-400">
                          로딩 중...
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 토글 형태 (나머지 실측 데이터) -->
                  <div 
                    v-else
                    class="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    @click="toggleLayer(subMenu)"
                  >
                    <span class="text-xs text-gray-600">{{ getSubMenuName(subMenu) }}</span>
                    <div 
                      v-if="typeof subMenu === 'object' && subMenu.isToggleable"
                      class="relative inline-block w-8 h-4 transition duration-200 ease-in-out"
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
                        class="absolute left-0.5 bottom-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 transform"
                        :class="{ 'translate-x-4': subMenu.isOn }"
                      ></span>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
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
