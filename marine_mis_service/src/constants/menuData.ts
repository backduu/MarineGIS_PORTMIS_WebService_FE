export interface SubMenuItem {
  name: string;
  isToggleable?: boolean;
  isOn?: boolean;
  layerId?: string; // 연결된 지도 레이어 ID
}

export interface MenuItem {
  name: string;
  subMenus?: (string | SubMenuItem)[];
  isOpen: boolean;
}

export const sidebarMenu: MenuItem[] = [
  {
    name: '지도 레이어 관리',
    subMenus: [
      { name: '해안선 레이어', isToggleable: true, isOn: false, layerId: 'korea_coastline' },
      '항로 레이어',
      '해저 지형 레이어'
    ],
    isOpen: false
  },
  {
    name: '선박 위치 추적',
    subMenus: ['실시간 선박 위치', '선박 경로 히스토리'],
    isOpen: false
  },
  {
    name: '항만 시설 정보',
    subMenus: ['계류 시설', '하역 시설', '저장 시설'],
    isOpen: false
  },
  {
    name: '시스템 설정',
    subMenus: ['계정 관리', '권한 설정', '로그 관리'],
    isOpen: false
  },
];
