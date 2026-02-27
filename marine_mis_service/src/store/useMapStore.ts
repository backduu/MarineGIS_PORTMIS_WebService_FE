import { defineStore } from 'pinia';
import { ref } from 'vue';

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
}

export const useMapStore = defineStore('map', () => {
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
      url: 'http://127.0.0.1:8020/geoserver/korea_coast/wms'
    }
  ]);

  const toggleLayer = (layerId: string) => {
    const layer = layers.value.find(l => l.id === layerId);
    if (layer) {
      layer.isOn = !layer.isOn;
    }
  };

  const setLayerStatus = (layerId: string, status: boolean) => {
    const layer = layers.value.find(l => l.id === layerId);
    if (layer) {
      layer.isOn = status;
    }
  };

  return {
    layers,
    toggleLayer,
    setLayerStatus
  };
});
