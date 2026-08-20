import { defineStore } from 'pinia';
import { ref } from 'vue';
import {observatoryLocationService, observatoryService, type WaterTempItem} from '@/services/observatoryService';

export interface LayerConfig {
  id: string;
  name: string;
  layers: string; // GeoServer layer name
  format?: string;
  transparent?: boolean;
  version?: string;
  attribution?: string;
  isOn: boolean;
  type: 'wms' | 'tile' | 'wfs';
  url: string;
  viewparams?: string;
  env?: string;
  styles?: string;
  cqlFilter?: string; // grp_isl
}

export const useMapStore = defineStore('map', () => {
  const viewMode = ref<'3d-globe'>('3d-globe');
  const waterTempData = ref<WaterTempItem[]>([]);
  const obsLocations = ref<any[]>([]);
  const obsCurrentPage = ref(1);
  const hasMoreObs = ref(true);
  const isLoadingObs = ref(false);
  const obsLocMode = ref<'all' | any> ('all');
  const selectedObsCode = ref<string>(''); // 현재 선택된 관측소 코드를 저장할 상태
  const isObsModalOpen = ref(false); // 조위관측소 모달창 관련
  const selectedStartDate = ref(new Date().toISOString().split('T')[0]); // 조위관측소 모달창 관련, 기본값 오늘
  const selectedEndDate = ref(new Date().toISOString().split('T')[0]); // 조위관측소 모달창 관련, 기본값 오늘
  const activeObsFeature = ref<any>(null); // active된 관측소 정보 저장할 상태

  const fetchNextObservatoryLocations = async () => {
    if (isLoadingObs.value || !hasMoreObs.value) return;

    isLoadingObs.value = true;
    try {
      const pageSize = 10;
      const newLocations = await observatoryLocationService.getObservationLocation(obsCurrentPage.value, pageSize);

      if (newLocations && newLocations.length > 0) {
        // 기존 목록에 새로운 데이터 추가
        obsLocations.value = [...obsLocations.value, ...newLocations];
        obsCurrentPage.value += 1;

        // 가져온 데이터가 요청한 사이즈보다 작으면 더 이상 데이터가 없는 것으로 판단
        if (newLocations.length < pageSize) {
          hasMoreObs.value = false;
        }
      } else {
        hasMoreObs.value = false;
      }
    } catch (error) {
      console.error('Failed to fetch observatory locations:', error);
    } finally {
      isLoadingObs.value = false;
    }
  };

  /**
   * 조위관측소 정보를 초기화하고 첫 페이지를 로드합니다.
   */
  const resetAndFetchObservatoryLocations = async () => {
    obsLocations.value = [];
    obsCurrentPage.value = 1;
    hasMoreObs.value = true;
    await fetchNextObservatoryLocations();
  };

  const fetchObservatoryLocations = async () => {
    const location = await observatoryLocationService.getObservationLocation(1, 100);
    if (location) {
      obsLocMode.value = location;
    }
  }

  /**
   * 조위관측소 실측 수온 데이터를 가져오고 선택한 관측소 코드를 전송합니다.
   */
  const fetchWaterTemp = async (obsCode?: string) => {

    // 파라미터가 있으면 해당 값을 사용하고, 없으면 store의 상태를 사용.
    const targetObs = obsCode || selectedObsCode.value;

    // '전체 관측소'인 경우 파라미터 없이 보냅니다.
    const param = targetObs === '전체 관측소' ? undefined : targetObs;

    waterTempData.value = await observatoryService.getWaterTemp(param);
    console.log('WaterTempData:', waterTempData.value);
  };

  /*실측 수온 데이터를 초기화하는 액션*/
  const clearWaterTemp = () => {
    /*수온 데이터 초기화 로직 명시*/
    waterTempData.value = [];
  };

  const layers = ref<LayerConfig[]>([]);

  // Partial<LayerConfig>를 사용하여 원하는 필드만 넘길 수 있게 함.
  const setLayerStatus = (layerId: string, updates: Partial<LayerConfig>) => {
    const index = layers.value.findIndex(l => l.id === layerId);
    if (index !== -1) {
      // 기존 객체에 새로운 변경사항을 덮어씌움 (Spread 배열 사용)
      layers.value[index] = { ...layers.value[index], ...updates };
    }
  };

  const toggleLayer = (layerId: string) => {
    const layer = layers.value.find(l => l.id === layerId);
    if (layer) {
      setLayerStatus(layerId, { isOn: !layer.isOn });
    }
  };

  /**
   * 모든 지도 상태와 레이어 설정을 초기화하는 함수입니다.
   * 로그아웃 시 지도의 레이어와 반응형 변수들을 한꺼번에 날려버리기 위해 추가했습니다.
   */
  const resetMapState = () => {
    /* 초기 모드를 3D Globe 모드로 리셋 */
    viewMode.value = '3d-globe';

    // 레이어 상태 초기화
    layers.value = layers.value.map(layer => ({
      ...layer,
      isOn: false,
      viewparams: '',
      env: '',
      styles: '',
      cqlFilter: ''
    }));

    /*로그아웃 시 실측 데이터 초기화*/
    waterTempData.value = [];
  };

  return {
    layers,
    toggleLayer,
    setLayerStatus,
    viewMode,
    resetAndFetchObservatoryLocations,
    fetchNextObservatoryLocations,
    isLoadingObs,
    obsLocations,
    resetMapState,
    waterTempData,     /*수온 데이터 상태 내보내기*/
    fetchWaterTemp,    /*수온 데이터 페치 액션 내보내기*/
    clearWaterTemp,     /*수온 데이터 초기화 액션 내보내기*/
    selectedObsCode,
    isObsModalOpen,
    selectedStartDate,
    selectedEndDate,
    activeObsFeature,
  };
});
