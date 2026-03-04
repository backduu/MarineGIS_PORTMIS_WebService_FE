export interface SubMenuItem {
  name: string;
  isToggleable?: boolean;
  isOn?: boolean;
  layerId?: string; // 연결된 지도 레이어 ID
  type?: 'layer' | 'style' | 'filter';
  value?: any;
}

export interface MenuItem {
  name: string;
  subMenus?: (string | SubMenuItem)[];
  isOpen: boolean;
}

export const sidebarMenu: MenuItem[] = [
  {
    name: '해안선 레이어 관리',
    subMenus: [
      { name: '수심별 해안선', isToggleable: true, isOn: false, type: 'style', value: 'analysis' },
    ],
    isOpen: true
  },
  {
    name: '시스템 설정',
    subMenus: ['계정 관리', '권한 설정', '로그 관리'],
    isOpen: false
  },
];
