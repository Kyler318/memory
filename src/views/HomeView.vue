<template>
  <div>
    <!-- Mobile header -->
    <header class="md:hidden sticky top-0 z-20 bg-warm-50/90 glass border-b border-warm-300 px-4 py-3 flex items-center justify-between">
      <h1 class="grad-text text-xl font-bold">回憶</h1>
      <div class="flex items-center gap-2">
        <div class="flex bg-warm-200 rounded-lg p-0.5 gap-0.5">
          <button
            v-for="m in modes"
            :key="m.id"
            class="px-3 py-1.5 rounded-md text-xs transition-all"
            :class="store.viewMode === m.id ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-400'"
            @click="store.viewMode = m.id"
          >{{ m.label }}</button>
        </div>
      </div>
    </header>

    <!-- Desktop page title -->
    <div class="hidden md:flex items-center justify-between mb-8">
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

    <!-- Loading skeletons -->
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

    <!-- Masonry Grid -->
    <template v-else-if="store.viewMode === 'masonry'">
      <div v-if="store.filtered.length" class="masonry-grid">
        <div
          v-for="(memory, i) in store.filtered"
          :key="memory.id"
          class="masonry-item animate-fade-up"
          :class="`delay-${Math.min(i, 7) * 75}`"
        >
          <MemoryCard :memory="memory" />
        </div>
      </div>
      <EmptyState v-else />
    </template>

    <!-- Timeline -->
    <template v-else>
      <div v-if="store.filtered.length" class="relative">
        <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/20 to-transparent" />

        <div class="space-y-8">
          <div
            v-for="(memory, i) in store.filtered"
            :key="memory.id"
            class="relative flex items-start gap-6 animate-fade-up"
            :class="[`delay-${Math.min(i, 7) * 75}`, i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse']"
          >
            <div class="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-amber-400 -translate-x-1.5 md:-translate-x-1.5 mt-6 ring-4 ring-warm-50" />

            <div class="hidden md:block w-1/2" />

            <div class="pl-12 md:pl-0 md:w-1/2">
              <div
                class="cursor-pointer rounded-2xl overflow-hidden bg-white border border-warm-200 shadow-sm card-glow transition-transform hover:-translate-y-0.5"
                @click="$router.push({ name: 'detail', params: { id: memory.id } })"
              >
                <img
                  :src="memory.thumbnailUrl"
                  :alt="memory.title"
                  class="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div class="p-4">
                  <time class="text-amber-600/80 text-xs">{{ formatDate(memory.date) }}</time>
                  <h3 class="text-stone-800 font-semibold mt-1 mb-1.5">{{ memory.title }}</h3>
                  <p class="text-stone-500 text-sm line-clamp-2">{{ memory.description }}</p>
                  <div v-if="memory.location" class="flex items-center gap-1 mt-3">
                    <span class="text-[10px] text-stone-400">📍</span>
                    <span class="text-[11px] text-stone-500">{{ memory.location }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else />
    </template>

    <!-- Mobile spacer for bottom nav -->
    <div class="md:hidden h-24" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import MemoryCard from '@/components/MemoryCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import dayjs from 'dayjs'

defineEmits(['upload'])

const store = useMemoryStore()
const loading = ref(true)
const modes = [{ id: 'masonry', label: '⊞' }, { id: 'timeline', label: '⊟' }]
const skeletonHeights = [280, 200, 340, 220, 300, 180, 260, 310]

onMounted(() => {
  setTimeout(() => { loading.value = false }, 800)
})

function formatDate(d) { return dayjs(d).format('YYYY年M月D日') }
</script>

<script>
const EmptyState = {
  template: `
    <div class="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div class="text-5xl opacity-25">🌿</div>
      <p class="text-stone-400 text-sm">還沒有符合條件的回憶</p>
    </div>
  `
}
</script>
