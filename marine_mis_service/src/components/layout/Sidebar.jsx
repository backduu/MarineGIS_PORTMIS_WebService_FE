const Sidebar = () => {
  return (
    <aside className="bg-gray-100 w-64 border-r border-gray-300 flex-shrink-0 flex flex-col">
      <div className="p-4 font-bold border-b border-gray-300">Menu</div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li className="p-2 hover:bg-gray-200 rounded cursor-pointer">지도 레이어 관리</li>
          <li className="p-2 hover:bg-gray-200 rounded cursor-pointer">선박 위치 추적</li>
          <li className="p-2 hover:bg-gray-200 rounded cursor-pointer">항만 시설 정보</li>
          <li className="p-2 hover:bg-gray-200 rounded cursor-pointer">시스템 설정</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
