import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // 예시 API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
