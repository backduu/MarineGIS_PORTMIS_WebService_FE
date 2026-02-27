import L from 'leaflet';
import { type LayerConfig } from '@/store/useMapStore';

/**
 * GeoServer와 관련된 Leaflet 레이어 생성 로직을 관리하는 서비스입니다.
 */
export const GeoServerService = {
  /**
   * LayerConfig 설정을 기반으로 Leaflet WMS 레이어 객체를 생성합니다.
   */
  createWmsLayer(config: LayerConfig): L.TileLayer.WMS {
    return L.tileLayer.wms(config.url, {
      layers: config.layers,
      format: config.format || 'image/png',
      transparent: config.transparent !== undefined ? config.transparent : true,
      version: config.version || '1.1.1',
      attribution: config.attribution || ''
    });
  },

  /**
   * 필요한 경우 GeoServer REST API 등을 통한 추가 연동 로직을 이곳에 정의할 수 있습니다.
   */
};
