import axios from 'axios';
import api from '@/api/axios';

export interface Region {
  id: number;
  sggNam: string;
}

export interface RegionLocation {
  centerJson: string; // GeoJSON
  bbox: string;       // BOX(x min, y min, x max, y max)
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
  },

  async getRegionLocation(sggNam: string): Promise<RegionLocation | null> {
    try {
      const response = await api.get('/coastline/location', {
        params: { sggNam }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch location for ${sggNam}:`, error);
      return null;
    }
  }
};
