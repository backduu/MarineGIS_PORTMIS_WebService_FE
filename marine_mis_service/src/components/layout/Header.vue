<script setup lang="ts">
/**
 * Header.vue: 애플리케이션 상단 바를 담당하는 컴포넌트입니다.
 * 로그인 성공 시 Pinia 스토어에서 사용자 이름을 가져와 표시합니다.
 */
import { useUserStore } from '@/store/useUserStore';
import { useMapStore } from '@/store/useMapStore';
import { storeToRefs } from 'pinia'; // 스토어의 상태를 반응형으로 유지하며 구조 분해 할당하기 위한 함수
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import LoginModal from '@/components/auth/LoginModal.vue';

const userStore = useUserStore();
const mapStore = useMapStore();
// storeToRefs를 사용하면 userStore.user가 변경될 때 컴포넌트도 자동으로 업데이트됩니다.
const { user, isLoading } = storeToRefs(userStore);
const router = useRouter();

const isLoginModalOpen = ref(false);

const openLoginModal = () => {
  isLoginModalOpen.value = true;
};

const closeLoginModal = () => {
  isLoginModalOpen.value = false;
};

// 로그아웃 처리 함수
const handleLogout = () => {
  /*로그아웃 시 사용자 정보와 지도 상태를 모두 초기화합니다.*/
  userStore.clearUser();
  mapStore.resetMapState();

  // 로그아웃 후 뒤로가기 방지를 위해 replace 사용합니다.
  router.replace('/');
}

</script>

<template>
  <header class="relative bg-cy-bg/90 backdrop-blur text-neon-cyan font-mono-cyber h-16 flex items-center justify-between px-6 border-b border-neon-cyan/60 shadow-[0_2px_14px_#00f0ff44] z-20">
    <!-- 하단 네온 스캔라인 -->
    <div class="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent"></div>

    <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
      <div class="border border-neon-cyan p-1.5 glow-cyan group-hover:border-neon-pink group-hover:glow-pink transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neon-cyan group-hover:text-neon-pink transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <span class="font-cyber text-xl font-extrabold uppercase tracking-[0.18em] text-glow-cyan">BigWave GIS <span class="text-neon-pink" style="text-shadow: 0 0 4px #c2306f66">Service</span></span>
    </div>

    <div class="flex items-center gap-6 text-sm font-medium">
      <span v-if="isLoading" class="flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-neon-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        연결 중...
      </span>

      <template v-else-if="user">
        <div class="flex items-center gap-4 border-r border-neon-cyan/30 pr-6 mr-2">
          <button class="hover:text-neon-pink transition relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-0 right-0 block h-2 w-2 bg-neon-pink shadow-[0_0_4px_#c2306f88] animate-pulse"></span>
          </button>
          
          <div 
            class="flex items-center gap-2 cursor-pointer hover:text-neon-pink transition"
            @click="router.push('/mypage')"
          >
            <div class="w-8 h-8 bg-neon-cyan/10 flex items-center justify-center text-xs font-bold border border-neon-cyan font-cyber cut-corners">
              {{ user.name.charAt(0) }}
            </div>
            <span><span class="font-bold text-glow-cyan">{{ user.name }}</span>님 환영합니다</span>
          </div>
        </div>

        <button
            @click="handleLogout"
            class="flex items-center gap-1.5 bg-transparent text-neon-cyan border border-neon-cyan px-4 py-2 uppercase tracking-widest transition duration-200 text-xs font-bold hover:bg-neon-pink/25 hover:text-white hover:border-neon-pink hover:glow-pink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </button>
      </template>

      <div v-else class="flex gap-3">
        <button
            @click="openLoginModal"
            class="border border-neon-cyan text-neon-cyan px-4 py-2 uppercase tracking-widest text-xs font-bold transition hover:bg-neon-cyan hover:text-black hover:glow-cyan"
        >
          로그인
        </button>
        <button
            @click="router.push('/signup')"
            class="bg-neon-pink/20 text-neon-pink border border-neon-pink font-bold px-5 py-2 uppercase tracking-widest text-xs transition glow-pink hover:bg-neon-pink/40 hover:text-white"
        >
          회원가입
        </button>
      </div>
    </div>
  </header>

  <!-- 로그인 모달 컴포넌트 -->
  <LoginModal :isOpen="isLoginModalOpen" @close="closeLoginModal" />
</template>

<style scoped>
</style>
