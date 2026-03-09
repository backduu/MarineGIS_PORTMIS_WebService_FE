import { defineStore } from 'pinia';
import { ref } from 'vue';
import { regionService, type Region, type RegionLocation } from '@/services/regionService';

export interface LayerConfig {
  id: string;
  name: string;
  layers: string; // GeoServer layer name
  format?: string;
  transparent?: boolean;
  version?: string;
  attribution?: string;
  isOn: boolean;
  type: 'wms' | 'tile';
  url: string;
  viewparams?: string;
  env?: string;
  styles?: string;
  cqlFilter?: string; // grp_isl
}

export const useMapStore = defineStore('map', () => {
  const currentSearchVal = ref('');
  const currentStyleMode = ref<'default' | 'analysis'>('default');
  const regions = ref<Region[]>([]);
  const locationToZoom = ref<RegionLocation | null>(null);
  const viewMode = ref<'coastal' | 'open-sea'>('coastal');
  const resetTrigger = ref(0); // 로그아웃 시 컴포넌트에 초기화 신호를 보내기 위한 변수

  const fetchRegions = async () => {
    regions.value = await regionService.getRegions();
  };

  const fetchRegionLocation = async (sggNam: string) => {
    const location = await regionService.getRegionLocation(sggNam);
    if (location) {
      locationToZoom.value = location;
    }
  };

  const layers = ref<LayerConfig[]>([
    {
      id: 'korea_coastline',
      name: '해안선 레이어',
      layers: 'korea_coast:all_countries_coastline_2025',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      attribution: 'Korea Coast WMS',
      isOn: false,
      type: 'wms',
      url: 'http://127.0.0.1:8020/geoserver/korea_coast/wms',
      viewparams: '',
      env: '',
      styles: ''
    },
    {
      id: 'coastline_popup',
      name: '해안선 팝업 레이어',
      layers: 'korea_coast:viewCoastline_popup',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      attribution: 'Korea Coast Popup',
      isOn: false,
      type: 'wms',
      url: 'http://127.0.0.1:8020/geoserver/korea_coast/wms',
      viewparams: '',
      env: '',
      styles: ''
    }
  ]);

  const updateViewParams = (searchVal?: string) => {
    if (searchVal !== undefined) currentSearchVal.value = searchVal

    const newEnv = `search_val:${currentSearchVal.value}`;
    setLayerStatus('korea_coastline', { viewparams: '', env: newEnv });
  };

  const setStyleMode = (mode: 'default' | 'analysis') => {
    currentStyleMode.value = mode;
    const styleName = mode === 'analysis' ? 'coastline_analysis_style' : '';
    // 수심별 해안선 모드가 켜지면 레이어도 켬, 꺼지면 레이어도 끔
    const isOn = mode === 'analysis';
    setLayerStatus('korea_coastline', { styles: styleName, isOn });
    
    // 팝업용 SQL View 레이어도 함께 토글
    setLayerStatus('coastline_popup', { isOn });
  };

  // Partial<LayerConfig>를 사용하여 원하는 필드만 넘길 수 있게 함.
  const setLayerStatus = (layerId: string, updates: Partial<LayerConfig>) => {
    const index = layers.value.findIndex(l => l.id === layerId);
    if (index !== -1) {
      // 기존 객체에 새로운 변경사항을 덮어씌움 (Spread 배열 사용)
      layers.value[index] = { ...layers.value[index], ...updates };
    }
  };

  /* 해안선 모드와 개방해 모드를 전환하는 함수*/
  const setViewMode = (mode: 'coastal' | 'open-sea') => {
    /* 모드 전환 시 이전 모드의 상태들을 초기화*/
    if (viewMode.value !== mode) {
      currentSearchVal.value = '';
      currentStyleMode.value = 'default';
      
      // 모든 레이어 끔 (또는 현재 모드 관련 레이어만 선별적으로 끔)
      layers.value = layers.value.map(layer => {
        return {
          ...layer,
          isOn: false,
          viewparams: '',
          env: '',
          styles: '',
          cqlFilter: ''
        };
      });
      
      resetTrigger.value += 1; // /* 팝업 닫기 및 지도 위치/줌 초기화 트리거*/
    }
    
    viewMode.value = mode;
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
    currentSearchVal.value = '';
    currentStyleMode.value = 'default';
    regions.value = [];
    locationToZoom.value = null;
    /* 초기 모드를 해안선 모드로 리셋 */
    viewMode.value = 'coastal';
    resetTrigger.value += 1; // 팝업 닫기 등 지도 객체 직접 제어를 위한 트리거

    // 레이어 상태 초기화 (isOn: false 및 필터/스타일 제거)
    layers.value = layers.value.map(layer => ({
      ...layer,
      isOn: false,
      viewparams: '',
      env: '',
      styles: '',
      cqlFilter: ''
    }));
  };

  return {
    layers,
    currentSearchVal,
    currentStyleMode,
    toggleLayer,
    setLayerStatus,
    updateViewParams,
    setStyleMode,
    regions,
    fetchRegions,
    locationToZoom,
    fetchRegionLocation,
    viewMode,
    setViewMode,
    resetMapState,
    resetTrigger
  };
});
