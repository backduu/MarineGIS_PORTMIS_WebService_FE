import axios from 'axios';

// Axios 인스턴스 생성 (API 통신을 위한 기본 설정)
const api = axios.create({
  // 모든 요청에 공통으로 붙는 기본 URL 설정
  baseURL: 'http://localhost:8080/api/',
  // 요청 헤더 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// 생성한 api 인스턴스를 내보내어 다른 파일에서 사용할 수 있게 함
export default api;
