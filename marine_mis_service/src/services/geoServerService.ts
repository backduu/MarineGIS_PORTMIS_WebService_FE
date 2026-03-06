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
      attribution: config.attribution || '',
      styles: config.styles || '',
      viewparams: config.viewparams || '',
      env: config.env || ''
    } as L.WMSOptions);
  },

  /**
   * GetFeatureInfo URL을 생성하여 GeoServer에 특정 좌표의 피처 정보를 요청합니다.
   * WMS 레이어는 단순한 이미지이므로, 클릭한 지점의 실제 데이터를 가져오기 위해 이 서비스가 필요합니다.
   */
  async getFeatureInfo(
    map: L.Map,
    config: LayerConfig,
    latlng: L.LatLng,
    point: L.Point
  ): Promise<any> {
    // GetFeatureInfo는 WMS 표준 인터페이스로, 이미지 내 특정 픽셀 좌표(X, Y)에 해당하는 속성 정보를 요청.
    const size = map.getSize();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const params: Record<string, string | number | boolean> = {
      SERVICE: 'WMS',
      VERSION: config.version || '1.1.1',
      REQUEST: 'GetFeatureInfo',
      FORMAT: config.format || 'image/png',
      TRANSPARENT: true,
      QUERY_LAYERS: config.layers,
      LAYERS: config.layers,
      INFO_FORMAT: 'application/json', /* 서버로부터 XML이 아닌 JSON 형태의 순수 데이터를 받아옵니다. */
      X: Math.floor(point.x),
      Y: Math.floor(point.y),
      SRS: 'EPSG:4326',
      WIDTH: size.x,
      HEIGHT: size.y,
      BBOX: `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`, /* 현재 지도가 보여주고 있는 사각형 범위(Bounding Box)를 계산합니다. */
      FEATURE_COUNT: 1,
    };

    if (config.viewparams) {
      params.VIEWPARAMS = config.viewparams; /* SQL View에 파라미터를 전달하기 위한 인자입니다. */
    }

    const queryString = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val.toString())}`)
      .join('&');

    const url = `${config.url}?${queryString}`;

    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching GetFeatureInfo:', error);
      return null;
    }
  },

  /**
   * 필요한 경우 GeoServer REST API 등을 통한 추가 연동 로직을 이곳에 정의할 수 있습니다.
   */
};
