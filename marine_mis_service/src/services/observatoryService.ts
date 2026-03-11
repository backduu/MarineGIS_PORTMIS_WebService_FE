import api from '@/api/axios';

export interface WaterTempItem {
  lat: string;         // 위도
  lon: string;         // 경도
  obsvtrNm: string;    // 관측소명
  obsrvnDt: string;    // 관측일시
  wtem: string;        // 수온
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
