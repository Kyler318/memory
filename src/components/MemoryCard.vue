<template>
  <!-- Outer wrapper holds rotation so stack cards align correctly -->
  <div :style="wrapperStyle">
    <!-- Stack cards behind (album only) -->
    <template v-if="isAlbum">
      <div
        v-if="photoCount >= 3"
        class="absolute inset-0 bg-white rounded-sm"
        style="transform: rotate(3deg) translate(5px, -4px); box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
      />
      <div
        class="absolute inset-0 bg-stone-50 rounded-sm"
        style="transform: rotate(-2deg) translate(-4px, -3px); box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
      />
    </template>

    <!-- Main card -->
    <article
      class="relative cursor-pointer"
      :style="cardStyle"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      @click="$emit('theater', memory)"
    >
      <!-- Film strip holes (top) — videos only -->
      <div v-if="memory.mediaType === 'video'" class="flex justify-around items-center bg-stone-900 py-1.5 px-3">
        <div v-for="i in 9" :key="i" class="w-2.5 h-[7px] rounded-[2px] bg-stone-600/70" />
      </div>

      <!-- Media -->
      <div class="relative overflow-hidden bg-stone-100" :style="{ aspectRatio }">
        <img
          :src="memory.thumbnailUrl"
          :alt="memory.title"
          class="w-full h-full object-cover"
          :style="{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s ease' }"
          loading="lazy"
        />

        <!-- Video play overlay -->
        <div v-if="memory.mediaType === 'video'" class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500"
            :class="hovered ? 'bg-amber-500/90 scale-110' : 'bg-black/55'"
          >
            <svg class="w-6 h-6 text-white fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <!-- Album: mini preview strip (bottom) -->
        <div v-if="isAlbum && memory.mediaFiles.length > 1" class="absolute bottom-0 inset-x-0 flex gap-0.5 p-1 bg-gradient-to-t from-black/60 to-transparent">
          <div
            v-for="(f, i) in memory.mediaFiles.slice(0, 5)"
            :key="i"
            class="h-8 flex-1 rounded overflow-hidden bg-stone-300 transition-all duration-300"
            :class="i === 0 ? 'ring-1 ring-white' : 'opacity-60'"
          >
            <img :src="f.thumbnailUrl || f.url" class="w-full h-full object-cover" />
          </div>
          <div v-if="photoCount > 5" class="h-8 w-8 rounded bg-black/60 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            +{{ photoCount - 5 }}
          </div>
        </div>

        <!-- Count badge (album) -->
        <div v-if="isAlbum" class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ photoCount }}
        </div>

        <!-- Anniversary badge -->
        <button
          v-if="isAnniversary"
          class="absolute top-2 left-2 bg-amber-400 hover:bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg z-10 transition-colors"
          @click.stop="$emit('celebrate', memory)"
        >
          🎉 {{ anniversaryYears }}週年！
        </button>

        <!-- Delete on hover -->
        <button
          class="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 z-10 transition-all duration-300"
          :style="{ opacity: hovered && !isAlbum ? 1 : (hovered && isAlbum ? 0 : 0) }"
          @click.stop="onDelete"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>

      <!-- Film strip holes (bottom) — videos only -->
      <div v-if="memory.mediaType === 'video'" class="flex justify-around items-center bg-stone-900 py-1.5 px-3">
        <div v-for="i in 9" :key="i" class="w-2.5 h-[7px] rounded-[2px] bg-stone-600/70" />
      </div>

      <!-- Polaroid caption -->
      <div class="bg-white px-3 pt-2.5 pb-5">
        <h3 class="text-stone-800 font-semibold text-sm leading-snug truncate">{{ memory.title }}</h3>
        <div class="flex items-center justify-between mt-1">
          <time class="text-stone-400 text-xs">{{ formatDate(memory.date) }}</time>
          <span v-if="memory.location" class="text-stone-400 text-[10px]">📍 {{ memory.location }}</span>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import dayjs from 'dayjs'

const props = defineProps({ memory: { type: Object, required: true } })
defineEmits(['theater', 'celebrate'])

const store = useMemoryStore()
const hovered = ref(false)

const ROTATIONS = [1.5, -1, 2, -1.5, 0.8, -2, 1.2, -0.7, 1.8, -1.2]

const rotation = computed(() => {
  const n = props.memory.id ? props.memory.id.charCodeAt(props.memory.id.length - 1) : 0
  return ROTATIONS[n % ROTATIONS.length]
})

const isAlbum = computed(() => props.memory.mediaType === 'album' || (props.memory.mediaFiles?.length ?? 0) > 1)
const photoCount = computed(() => props.memory.mediaFiles?.length ?? 1)

const aspectRatio = computed(() => {
  if (props.memory.mediaType === 'video') return '16/9'
  const ratios = ['4/3', '3/4', '1/1', '4/3', '3/5']
  const n = props.memory.id ? props.memory.id.charCodeAt(props.memory.id.length - 1) : 0
  return ratios[n % ratios.length]
})

// Wrapper holds rotation (so stack cards rotate with the main card)
const wrapperStyle = computed(() => ({
  position: 'relative',
  transform: hovered.value ? 'rotate(0deg)' : `rotate(${rotation.value}deg)`,
  transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
  zIndex: hovered.value ? 10 : 1,
}))

// Article holds scale + filter
const cardStyle = computed(() => ({
  transform: hovered.value ? 'scale(1.04)' : 'scale(1)',
  filter: hovered.value ? 'grayscale(0) sepia(0)' : 'grayscale(0.65) sepia(0.2)',
  transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), filter 0.5s ease, box-shadow 0.3s ease',
  boxShadow: hovered.value
    ? '0 20px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(217,119,6,0.15)'
    : '0 3px 10px rgba(0,0,0,0.10)',
  borderRadius: '2px',
  overflow: 'hidden',
  position: 'relative',
}))

const isAnniversary = computed(() => {
  const today = dayjs()
  const mem = dayjs(props.memory.date)
  return today.year() > mem.year()
    && today.month() === mem.month()
    && today.date() === mem.date()
})
const anniversaryYears = computed(() => dayjs().year() - dayjs(props.memory.date).year())

function formatDate(d) { return dayjs(d).format('YYYY年M月D日') }

async function onDelete() {
  if (!confirm(`確定要刪除「${props.memory.title}」嗎？此操作無法復原。`)) return
  await store.deleteMemory(props.memory.id)
}
</script>
