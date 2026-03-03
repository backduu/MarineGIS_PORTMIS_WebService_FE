import { createApp } from 'vue'; // Vue 애플리케이션 인스턴스를 생성하기 위한 함수
import { createPinia } from 'pinia'; // 상태 관리를 위한 Pinia 인스턴스 생성 함수
import router from './router';
import App from './App.vue'; // 최상위 루트 컴포넌트
import './index.css'; // 글로벌 스타일시트 (Tailwind CSS 포함)

// Vue 애플리케이션 인스턴스 생성
const app = createApp(App);

// Pinia (상태 관리 라이브러리) 초기화
const pinia = createPinia();

// 애플리케이션에 Pinia 플러그인 등록
app.use(pinia);

// 애플리케이션에 라우터 등록
app.use(router);

// index.html의 <div id="app"> 요소에 Vue 애플리케이션 마운트
app.mount('#app');
