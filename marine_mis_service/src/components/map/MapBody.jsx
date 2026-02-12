import L from 'leaflet';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapBody = () => {
  // 대한민국 중심 좌표 설정
  const position = [36.5, 127.5];
  const zoom = 7;

  // 이동 제한 영역 설정
  const koreaBounds = [
      [32.0, 123.0], // 남서단
      [40.0, 132.0], // 북동단
  ];

  return (
    <main className="flex-1 relative z-0">
      <MapContainer 
        center={position} 
        zoom={zoom}
        minZoom={7}
        maxZoom={18}
        maxBounds={koreaBounds} // 이 영역 밖으로 이동 불가
        maxBoundsViscosity={155.0} // 영역 밖으로 튕겨 나가는 강도 (1.0은 완전 고정)
        style={{ height: '100%', width: '100%' }}
      >
        {/* 기본 OpenStreetMap 레이어*/}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <WMSTileLayer
          url="http://127.0.0.1:8020/geoserver/korea_coast/wms"
          params={{
              layers: "korea_coast:all_countries_coastline_2025",
              format: "image/png",
              version: "1.1.1",
              transparent: true,
              /*crs: L.CRS.EPSG4326*/
          }}
        />
      </MapContainer>
    </main>
  );
};

export default MapBody;
