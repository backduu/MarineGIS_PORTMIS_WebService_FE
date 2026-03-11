import api from '@/api/axios';

export interface WaterTempItem {
  lat: string;         // 위도
  lon: string;         // 경도
  obsvtrNm: string;    // 관측소명
  obsrvnDt: string;    // 관측일시
  wtem: string;        // 수온
}

export interface WaterTempApiResponse {
  header: {
    resultCode: string;
    resultMsg: string;
  };
  body: {
    items: {
      item: WaterTempItem[];
    };
  };
  numOfRows: number;
  pageNo: number;
  totalCount: number;
  type: string;
}

export const observatoryService = {
  /**
   * 수온 정보를 가져옵니다.
   * 수정자: 백두현
   */
  async getWaterTemp(): Promise<WaterTempItem[]> {
    try {
      const response = await api.get<WaterTempApiResponse>('/observatory/water-temp');
      return response.data?.body?.items?.item || [];
    } catch (error) {
      console.error('Failed to fetch water temperature data:', error);
      return [];
    }
  }
};
