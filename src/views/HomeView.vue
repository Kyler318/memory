<template>
  <div>
    <!-- Mobile header -->
    <header class="md:hidden sticky top-0 z-20 bg-warm-50/90 glass border-b border-warm-300 px-4 py-3 flex items-center justify-between">
      <h1 class="grad-text text-xl font-bold">回憶</h1>
      <div class="flex bg-warm-200 rounded-lg p-0.5 gap-0.5">
        <button
          v-for="m in modes"
          :key="m.id"
          class="px-3 py-1.5 rounded-md text-xs transition-all"
          :class="store.viewMode === m.id ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-400'"
          @click="store.viewMode = m.id"
        >{{ m.label }}</button>
      </div>
    </header>

    <!-- Desktop title bar -->
    <div class="hidden md:flex items-center justify-between mb-10">
      <div>
        <h2 class="text-stone-700 text-2xl font-semibold">
          {{ store.activeYear ? store.activeYear + ' 年的回憶'
             : store.activeTag ? '📍 ' + store.activeTag
             : '所有回憶' }}
        </h2>
        <p class="text-stone-400 text-sm mt-0.5">共 {{ store.filtered.length }} 段故事</p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl grad-border text-white text-sm font-medium shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity"
        @click="$emit('upload')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        上傳回憶
      </button>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-if="store.viewMode === 'masonry'" class="masonry-grid">
        <div v-for="(h, i) in skeletonHeights" :key="i" class="masonry-item">
          <SkeletonCard :height="h" />
        </div>
      </div>
      <div v-else class="space-y-6">
        <SkeletonCard v-for="i in 4" :key="i" :height="140" />
      </div>
    </template>

    <Transition v-else name="view-switch" mode="out-in" @after-enter="onViewEnter">
      <!-- Masonry Grid -->
      <div v-if="store.viewMode === 'masonry'" key="masonry">
        <div v-if="store.filtered.length" class="masonry-grid py-4">
          <div
            v-for="(memory, i) in store.filtered"
            :key="memory.id"
            class="masonry-item"
            :style="{ animationDelay: `${Math.min(i, 7) * 80}ms` }"
          >
            <MemoryCard
              :memory="memory"
              @theater="openTheater"
              @celebrate="celebrate"
            />
          </div>
        </div>
        <EmptyState v-else />
      </div>

      <!-- Timeline -->
      <div v-else key="timeline">
        <div v-if="store.filtered.length" class="relative pt-2">
          <!-- Vertical line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/60 via-amber-400/20 to-transparent" />

          <div class="space-y-10">
            <div
              v-for="(memory, i) in store.filtered"
              :key="memory.id"
              class="timeline-item relative flex items-start gap-6"
              :class="i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
            >
              <!-- Dot -->
              <div class="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-amber-400 -translate-x-1.5 md:-translate-x-1.5 mt-8 ring-4 ring-warm-50 z-10" />

              <div class="hidden md:block w-1/2" />

              <div class="pl-12 md:pl-0 md:w-1/2" :class="i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'">
                <MemoryCard
                  :memory="memory"
                  @theater="openTheater"
                  @celebrate="celebrate"
                />
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else />
      </div>
    </Transition>

    <!-- Mobile spacer -->
    <div class="md:hidden h-24" />

    <!-- Theater Modal -->
    <TheaterModal :memory="theaterMemory" @close="theaterMemory = null" />

    <!-- Confetti canvas -->
    <canvas ref="confettiCanvas" class="pointer-events-none fixed inset-0 z-[200] w-full h-full" :class="{ hidden: !showConfetti }" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import MemoryCard from '@/components/MemoryCard.vue'
import TheaterModal from '@/components/TheaterModal.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

defineEmits(['upload'])

const store = useMemoryStore()
const loading = ref(true)
const modes = [{ id: 'masonry', label: '⊞' }, { id: 'timeline', label: '⊟' }]
const skeletonHeights = [280, 200, 340, 220, 300, 180, 260, 310]

// Theater
const theaterMemory = ref(null)
function openTheater(memory) {
  theaterMemory.value = memory
}

// Confetti
const confettiCanvas = ref(null)
const showConfetti = ref(false)

async function celebrate(memory) {
  showConfetti.value = true
  const { default: confetti } = await import('canvas-confetti')
  const fire = confetti.create(confettiCanvas.value, { resize: true, useWorker: true })
  fire({ particleCount: 160, spread: 90, origin: { y: 0.55 }, colors: ['#f59e0b', '#d97706', '#fbbf24', '#f472b6', '#34d399', '#60a5fa'] })
  setTimeout(() => { showConfetti.value = false }, 3500)
}

// Intersection Observer for timeline
let observer = null

function setupObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el))
}

function onViewEnter() {
  if (store.viewMode === 'timeline') setupObserver()
}

watch(() => store.viewMode, (val) => {
  if (val === 'timeline') nextTick(setupObserver)
})

watch(() => store.filtered, () => {
  if (store.viewMode === 'timeline') nextTick(setupObserver)
})

onMounted(() => {
  setTimeout(() => {
    loading.value = false
    if (store.viewMode === 'timeline') nextTick(setupObserver)
  }, 700)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.view-switch-enter-active,
.view-switch-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.view-switch-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-switch-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<script>
const EmptyState = {
  template: `
    <div class="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div class="text-5xl opacity-20">🎞️</div>
      <p class="text-stone-400 text-sm">還沒有符合條件的回憶</p>
    </div>
  `
}
</script>
