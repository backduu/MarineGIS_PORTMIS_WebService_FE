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
    ],
    isOpen: true
  },
  {
    name: '시스템 설정',
    subMenus: ['계정 관리', '권한 설정', '로그 관리'],
    isOpen: false
  },
  {
    name: '조위 관측소 조회',
    subMenus: [
      { 
        name: '조위관측소 선택', 
        isToggleable: false, 
        type: 'layer', 
        layerId: 'ocean_obs_position',
        options: [
          { label: '전체 관측소', value: 'all' },
          { label: '인천 관측소', value: 'DT_0001' },
          { label: '부산 관측소', value: 'DT_0002' },
          { label: '목포 관측소', value: 'DT_0003' }
        ]
      },
      { name: '관측소 실측 수온', isToggleable: true, isOn: false, type: 'filter', value: 'temp' },
      { name: '관측소 실측 기온', isToggleable: true, isOn: false, type: 'filter', value: 'air_temp' },
      { name: '관측소 실측 기압', isToggleable: true, isOn: false, type: 'filter', value: 'air_press' },
      { name: '관측소 실측 풍향/풍속', isToggleable: true, isOn: false, type: 'filter', value: 'wind' }
    ],
    isOpen: false
  }
];
