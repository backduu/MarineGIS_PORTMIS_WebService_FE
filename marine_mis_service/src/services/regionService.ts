import axios from 'axios';
import api from '@/api/axios';

export interface Region {
  id: number;
  sggNam: string;
}

export const regionService = {
  async getRegions(): Promise<Region[]> {
    try {
      const response = await api.get('/coastline/regions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      return [];
    }
  }
};
