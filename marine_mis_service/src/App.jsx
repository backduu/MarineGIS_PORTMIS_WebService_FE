import { useEffect } from 'react';
import useUserStore from './store/useUserStore';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import MapBody from './components/map/MapBody';
import './App.css';

function App() {
  const { fetchUser } = useUserStore();

  useEffect(() => {
    // 초기 사용자 정보 로드 (예시로 ID 1번 사용자 가져옴)
    fetchUser(1);
  }, [fetchUser]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 헤더 */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Sidebar />

        {/* 바디 (지도 표시) */}
        <MapBody />
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default App;
