export interface PortLandmark {
    id: string;
    name: string;
    lon: number;
    lat: number;
    height?: number;
}

export const MAJOR_PORTS: PortLandmark[] = [
    { id: 'BUSAN', name: '부산항', lon: 129.0756, lat: 35.1028 },
    { id: 'INCHEON', name: '인천항', lon: 126.6326, lat: 37.4526 },
    { id: 'ULSAN', name: '울산항', lon: 129.3589, lat: 35.5053 },
    { id: 'YEOSU_GWANGYANG', name: '여수·광양항', lon: 127.7357, lat: 34.7411 },
    { id: 'PYEONGTAEK_DANGJIN', name: '평택·당진항', lon: 126.7616, lat: 36.9921 }
];