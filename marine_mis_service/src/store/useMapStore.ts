import { defineStore } from 'pinia';
import { ref } from 'vue';
import { regionService, type Region } from '@/services/regionService';

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
}

export const useMapStore = defineStore('map', () => {
  const currentSearchVal = ref('');
  const currentStyleMode = ref<'default' | 'analysis'>('default');
  const regions = ref<Region[]>([]);

  const fetchRegions = async () => {
    regions.value = await regionService.getRegions();
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
    }
  ]);

  const updateViewParams = (searchVal?: string) => {
    if (searchVal !== undefined) currentSearchVal.value = searchVal;

    const newEnv = `search_val:${currentSearchVal.value}`;
    setLayerStatus('korea_coastline', { viewparams: '', env: newEnv });
  };

  const setStyleMode = (mode: 'default' | 'analysis') => {
    currentStyleMode.value = mode;
    const styleName = mode === 'analysis' ? 'coastline_analysis_style' : '';
    // 수심별 해안선 모드가 켜지면 레이어도 켬, 꺼지면 레이어도 끔
    const isOn = mode === 'analysis';
    setLayerStatus('korea_coastline', { styles: styleName, isOn });
  };

  // Partial<LayerConfig>를 사용하여 원하는 필드만 넘길 수 있게 함.
  const setLayerStatus = (layerId: string, updates: Partial<LayerConfig>) => {
    const index = layers.value.findIndex(l => l.id === layerId);
    if (index !== -1) {
      // 기존 객체에 새로운 변경사항을 덮어씌움 (Spread 배열 사용)
      layers.value[index] = { ...layers.value[index], ...updates };
    }

    // console.log(
    //     'toggleLayer',
    //     layers.value.map(l => ({ id: l.id, isOn: l.isOn }))
    // )
  };


  const toggleLayer = (layerId: string) => {
    const layer = layers.value.find(l => l.id === layerId);
    if (layer) {
      setLayerStatus(layerId, { isOn: !layer.isOn });
    }
  }


  return {
    layers,
    currentSearchVal,
    currentStyleMode,
    toggleLayer,
    setLayerStatus,
    updateViewParams,
    setStyleMode,
    regions,
    fetchRegions
  };
});
