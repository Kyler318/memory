<template>
  <div class="font-sans min-h-screen bg-warm-50">

    <!-- Desktop sidebar -->
    <AppSidebar
      v-if="isDesktop"
      @upload="showUpload = true"
    />

    <!-- Main -->
    <main
      class="min-h-screen"
      :class="isDesktop ? 'ml-64 px-8 py-10' : 'px-4 pt-2 pb-4'"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component
            :is="Component"
            @upload="showUpload = true"
          />
        </Transition>
      </RouterView>
    </main>

    <!-- Mobile bottom nav -->
    <BottomNav
      v-if="!isDesktop"
      @upload="showUpload = true"
    />

    <!-- Upload modal -->
    <UploadModal
      :show="showUpload"
      @close="showUpload = false"
      @saved="onSaved"
    />

    <!-- Success Toast -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-stone-800 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
      >
        <span class="text-green-400 text-base">✓</span>
        上傳成功！回憶已儲存
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import BottomNav from '@/components/BottomNav.vue'
import UploadModal from '@/components/UploadModal.vue'
import { useMemoryStore } from '@/stores/memoryStore'

const showUpload = ref(false)
const isDesktop = ref(false)
const showToast = ref(false)

const store = useMemoryStore()

function checkDesktop() {
  isDesktop.value = window.innerWidth >= 768
}

function onSaved() {
  showUpload.value = false
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

onMounted(async () => {
  checkDesktop()
  window.addEventListener('resize', checkDesktop)
  await store.loadMemories()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDesktop)
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
