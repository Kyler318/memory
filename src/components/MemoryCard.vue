<template>
  <article
    class="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 ease-spring hover:-translate-y-1 card-glow bg-white shadow-sm shadow-warm-400/30 border border-warm-200"
    @click="$router.push({ name: 'detail', params: { id: memory.id } })"
    @mouseenter="onHover(true)"
    @mouseleave="onHover(false)"
  >
    <!-- Media -->
    <div class="relative w-full overflow-hidden" :style="{ aspectRatio: aspectRatio }">
      <img
        v-if="memory.mediaType === 'image'"
        :src="memory.thumbnailUrl"
        :alt="memory.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Video card -->
      <template v-else-if="memory.mediaType === 'video'">
        <img
          :src="memory.thumbnailUrl"
          :alt="memory.title"
          class="w-full h-full object-cover transition-transform duration-500"
          :class="{ 'opacity-0': isPlaying }"
          loading="lazy"
        />
        <video
          v-show="isPlaying"
          ref="videoEl"
          :src="memory.mediaUrl"
          muted
          loop
          playsinline
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute top-3 right-3 bg-stone-900/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <svg class="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span class="text-white text-xs font-medium">影片</span>
        </div>
      </template>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 media-overlay opacity-80 group-hover:opacity-100 transition-opacity" />

      <!-- Bottom content -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
          {{ memory.title }}
        </h3>
        <div class="flex items-center justify-between">
          <time class="text-white/70 text-xs">{{ formatDate(memory.date) }}</time>
          <button class="flex items-center gap-1 group/like" @click.stop="onLike">
            <svg
              class="w-4 h-4 transition-all duration-200"
              :class="memory.liked
                ? 'fill-pink-500 text-pink-500 animate-heart-pop'
                : 'fill-transparent text-white/70 group-hover/like:text-pink-400'"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-white/70 text-xs group-hover/like:text-pink-400 transition-colors">
              {{ memory.likes }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Location strip -->
    <div v-if="memory.location" class="px-3 py-2 flex items-center gap-1">
      <span class="text-[10px] text-stone-400">📍</span>
      <span class="text-[11px] text-stone-500 font-medium">{{ memory.location }}</span>
    </div>
    <div v-else-if="memory.tags?.length" class="px-3 py-2 flex flex-wrap gap-1.5">
      <span
        v-for="tag in memory.tags.slice(0, 3)"
        :key="tag"
        class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200"
      >
        📍 {{ tag }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import dayjs from 'dayjs'

const props = defineProps({
  memory: { type: Object, required: true },
})

const store = useMemoryStore()
const videoEl = ref(null)
const isPlaying = ref(false)

const aspectRatio = computed(() => {
  if (props.memory.mediaType === 'image') {
    const ratios = ['4/3', '3/4', '1/1', '16/9', '3/5']
    return ratios[Number(props.memory.id?.slice(-1) || 0) % ratios.length]
  }
  return '16/9'
})

function formatDate(d) {
  return dayjs(d).format('YYYY年M月D日')
}

function onHover(enter) {
  if (props.memory.mediaType !== 'video') return
  if (enter) {
    isPlaying.value = true
    videoEl.value?.play()
  } else {
    isPlaying.value = false
    videoEl.value?.pause()
  }
}

function onLike() {
  store.toggleLike(props.memory.id)
}
</script>
