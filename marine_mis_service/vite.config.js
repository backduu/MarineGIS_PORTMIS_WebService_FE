import { defineConfig } from 'vite' // Vite 설정을 위한 함수
import vue from '@vitejs/plugin-vue' // Vite에서 Vue SFC(.vue 파일)를 지원하기 위한 플러그인
import tailwindcss from '@tailwindcss/vite' // Tailwind CSS 통합 플러그인
import path from 'path' // 경로 처리를 위한 Node.js 내장 모듈
import { fileURLToPath } from 'url' // ESM 환경에서 파일 URL을 경로로 변환하기 위한 모듈

// ESM 환경에서는 __dirname이 기본 제공되지 않으므로 직접 정의함
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), // Vue 플러그인 활성화
    tailwindcss(), // Tailwind CSS 플러그인 활성화
  ],
  resolve: {
    alias: {
      // '@' 문자를 'src' 디렉토리의 절대 경로로 연결 (예: '@/components/...')
      '@': path.resolve(__dirname, './src'),
    },
  },
})
