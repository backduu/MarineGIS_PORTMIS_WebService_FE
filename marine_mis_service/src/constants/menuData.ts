export interface SubMenuItem {
  name: string;
  isToggleable?: boolean;
  isOn?: boolean;
  layerId?: string; // 연결된 지도 레이어 ID
  type?: 'layer' | 'style' | 'filter';
  value?: any;
  options?: Array<{label: string; value: string}>; // 라디오/선택박스 옵션
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
      { name: '해안선 분석', isToggleable: true, isOn: false, type: 'style', value: 'analysis' },
      {
        name: '지형 필터',
        isToggleable: false,
        isOn: false,
        type: 'filter',
        value: 'all',
        options: [
          { label: '전체 표시', value: '0' },
          { label: '내륙(본토) 해안선', value: '1' },
          { label: '부속 도서(섬) 해안선', value: '2' }
        ]
      },
    ],
    isOpen: true
  },
  {
    name: '시스템 설정',
    subMenus: ['계정 관리', '권한 설정', '로그 관리'],
    isOpen: false
  },
];
