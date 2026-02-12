import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapBody = () => {
  // 대한민국 중심 좌표 설정
  const position = [36.5, 127.5];
  const zoom = 7;

  return (
    <main className="flex-1 relative z-0">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* 기본 OpenStreetMap 레이어 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* GeoServer로부터 데이터를 가져오기 위한 WMS 레이어 예시 */}
        {/* 실제 환경에서는 GeoServer URL과 레이어 이름을 설정해야 함 */}
        {/* 
        <WMSTileLayer
          url="YOUR_GEOSERVER_WMS_ENDPOINT"
          layers="YOUR_LAYER_NAME"
          format="image/png"
          transparent={true}
          attribution="GeoServer"
        />
        */}
      </MapContainer>
    </main>
  );
};

export default MapBody;
