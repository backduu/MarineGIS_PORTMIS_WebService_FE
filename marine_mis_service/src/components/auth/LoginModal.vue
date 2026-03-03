<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '@/store/useUserStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();
const isLoading = ref(false);
const errorMessage = ref('');

const loginForm = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = '아이디와 비밀번호를 입력해주세요.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // userStore.login이 함수인지 확인 (에러 방지용)
    if (typeof userStore.login !== 'function') {
      throw new Error('시스템 오류: 로그인 기능을 사용할 수 없습니다.');
    }

    const success = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    });

    if (success) {
      emit('close');
      // 폼 초기화
      loginForm.username = '';
      loginForm.password = '';
    } else {
      errorMessage.value = userStore.error || '로그인 중 오류가 발생했습니다.';
      // 서버 문제로 인한 실패 시 경고창 표시
      alert(`로그인 실패: ${errorMessage.value}\n서버 상태를 확인해주세요.`);
    }
  } catch (error: any) {
    console.error('Login Error:', error);
    errorMessage.value = error.message || '서버와의 통신 중 오류가 발생했습니다.';
    alert('서버 문제로 로그인을 진행할 수 없습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
  }
};

const closeGreeting = () => {
  emit('close');
  errorMessage.value = '';
};
</script>

<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
  >
    <!-- Modal Content -->
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-fade-in">
      <!-- Header -->
      <div class="bg-blue-900 p-6 text-white flex justify-between items-center">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-2-2m0 0l2-2m-2 2h8m-9 3h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          로그인
        </h2>
        <button @click="closeGreeting" class="text-blue-200 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-1">아이디</label>
            <input 
              v-model="loginForm.username"
              type="text" 
              id="username"
              placeholder="아이디를 입력하세요"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
            <input 
              v-model="loginForm.password"
              type="password" 
              id="password"
              placeholder="비밀번호를 입력하세요"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex justify-center items-center"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-sm">
          <a href="#" class="text-blue-600 hover:underline">비밀번호를 잊으셨나요?</a>
          <span class="text-gray-400">|</span>
          <button @click="$emit('close')" class="text-gray-600 hover:text-blue-600">회원가입</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
