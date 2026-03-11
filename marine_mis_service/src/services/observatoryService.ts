import api from '@/api/axios';

export interface WaterTempItem {
  lat: string;         // 위도
  lon: string;         // 경도
  obsvtrNm: string;    // 관측소명
  obsrvnDt: string;    // 관측일시
  wtem: string;        // 수온
}

export interface ObsLocation {
  lat: string;        // 위도
  log: string;        // 경도
  obsType: string;    // 관측소 유형
  obsvtrNm: string;   // 관측소 명
  obsvtrEnNm: string; // 관측소 명 (영문)
}

export const observatoryService = {
  /**
   * 수온 정보를 가져옵니다.
   */
  async getWaterTemp(): Promise<WaterTempItem[]> {
    try {
      const response = await api.get<WaterTempItem[]>('/observatory/water-temp');

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch water temperature data:', error);
      return [];
    }
  }
};

export const observatoryLocationService = {
  /**
   * 수온 관측소 위치 정보를 가져옵니다.
   */
  async getObservationLocation(page: number = 1, size: number = 100): Promise<ObsLocation[]> {
    try {
      const response = await api.get<ObsLocation[]>('/observatory/location', {
        params: { page, size }
      });

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch water temperature location:', error);
      return [];
    }
  }
}
