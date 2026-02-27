import { watch, onUnmounted } from 'vue';
import L from 'leaflet';
import { useMapStore, type LayerConfig } from '@/store/useMapStore';
import { GeoServerService } from '@/services/geoServerService';

/**
 * Leaflet 지도 인스턴스와 GeoServer 레이어 간의 동기화를 관리하는 Composable입니다.
 */
export function useMapLayers(mapInstance: L.Map | null) {
  const mapStore = useMapStore();
  
  // 생성된 레이어 객체들을 관리 (레이어 ID -> Leaflet 레이어 객체)
  const activeLayers = new Map<string, L.Layer>();

  /**
   * 레이어 상태에 따라 지도에 추가하거나 제거합니다.
   */
  const syncLayers = () => {
    if (!mapInstance) return;

    mapStore.layers.forEach((config) => {
      const isCurrentlyOnMap = activeLayers.has(config.id);

      if (config.isOn && !isCurrentlyOnMap) {
        // 레이어를 켜야 하는데 지도에 없는 경우 추가
        let newLayer: L.Layer;
        if (config.type === 'wms') {
          newLayer = GeoServerService.createWmsLayer(config);
        } else {
          newLayer = L.tileLayer(config.url, { attribution: config.attribution });
        }
        
        newLayer.addTo(mapInstance);
        activeLayers.set(config.id, newLayer);
      } else if (!config.isOn && isCurrentlyOnMap) {
        // 레이어를 꺼야 하는데 지도에 있는 경우 제거
        const layerToRemove = activeLayers.get(config.id);
        if (layerToRemove) {
          mapInstance.removeLayer(layerToRemove);
          activeLayers.delete(config.id);
        }
      }
    });
  };

  // mapStore의 layers 상태 변화를 감시하여 레이어 동기화
  const stopWatch = watch(
    () => mapStore.layers,
    () => {
      syncLayers();
    },
    { deep: true, immediate: true }
  );

  onUnmounted(() => {
    stopWatch();
    activeLayers.clear();
  });

  return {
    syncLayers
  };
}
