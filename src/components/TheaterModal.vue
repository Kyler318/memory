<template>
  <Teleport to="body">
    <Transition name="theater">
      <div v-if="memory" class="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 md:p-6">
        <div class="absolute inset-0 bg-stone-950/95 backdrop-blur-2xl" @click="$emit('close')" />

        <div
          class="relative z-10 w-full max-w-4xl flex flex-col gap-2"
          style="animation: theaterIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both"
        >
          <!-- Close -->
          <div class="flex justify-end mb-1">
            <button class="text-stone-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors" @click="$emit('close')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              關閉
            </button>
          </div>

          <!-- Media -->
          <div class="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/80 relative">
            <template v-if="currentFile.type === 'video'">
              <video :src="currentFile.url" controls autoplay playsinline class="w-full max-h-[52vh] object-contain block" />
            </template>
            <template v-else>
              <img :src="currentFile.url" :alt="memory.title" class="w-full max-h-[52vh] object-contain block" />
            </template>

            <!-- Gallery nav -->
            <template v-if="isAlbum">
              <button
                v-if="currentIndex > 0"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                @click="currentIndex--"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                v-if="currentIndex < allFiles.length - 1"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                @click="currentIndex++"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <!-- Counter -->
              <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {{ currentIndex + 1 }} / {{ allFiles.length }}
              </div>
            </template>
          </div>

          <!-- Thumbnail strip (album) -->
          <div v-if="isAlbum" class="flex gap-1.5 overflow-x-auto pb-1">
            <button
              v-for="(f, i) in allFiles"
              :key="i"
              class="shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200"
              :class="i === currentIndex ? 'ring-2 ring-amber-400 opacity-100' : 'opacity-50 hover:opacity-80'"
              @click="currentIndex = i"
            >
              <img :src="f.thumbnailUrl || f.url" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Info row -->
          <div class="bg-stone-800 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-white font-bold text-base truncate">{{ memory.title }}</h2>
                <span v-if="isAnniversary" class="shrink-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🎉 {{ anniversaryYears }}週年
                </span>
              </div>
              <div class="flex items-center gap-3 text-stone-400 text-xs mt-0.5">
                <time>{{ formatDate(memory.date) }}</time>
                <span v-if="memory.location">📍 {{ memory.location }}</span>
              </div>
              <p v-if="memory.description" class="text-stone-400 text-sm mt-1 line-clamp-1">{{ memory.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                :class="memory.liked ? 'bg-pink-500/20 text-pink-400' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
                @click="onLike"
              >
                <svg class="w-4 h-4" :class="memory.liked ? 'fill-pink-500 text-pink-500' : 'fill-transparent text-stone-300'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {{ memory.likes }}
              </button>
              <button class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors" @click="goDetail">
                詳情 →
              </button>
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-stone-800 rounded-xl px-5 py-3 max-h-40 overflow-y-auto">
            <h3 class="text-stone-500 text-[10px] uppercase tracking-widest mb-2">留言</h3>
            <div v-if="memory.comments?.length" class="space-y-2.5 mb-3">
              <div v-for="c in memory.comments" :key="c.id" class="flex gap-2.5">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{{ c.author[0] }}</div>
                <div>
                  <span class="text-stone-300 text-sm font-medium">{{ c.author }}</span>
                  <span class="text-stone-500 text-xs ml-2">{{ c.date }}</span>
                  <p class="text-stone-400 text-sm">{{ c.text }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-stone-500 text-sm py-1 mb-2">還沒有留言，說些什麼吧</p>
            <div class="flex gap-2">
              <input
                v-model="commentText"
                class="flex-1 bg-stone-700 rounded-lg px-3 py-2 text-white text-sm placeholder-stone-500 border border-stone-600 focus:border-amber-500/50 outline-none transition-colors"
                placeholder="說些什麼…"
                @keydown.enter="submitComment"
              />
              <button v-if="commentText.trim()" class="text-amber-400 text-sm font-semibold px-3 hover:text-amber-300 transition-colors shrink-0" @click="submitComment">送出</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoryStore } from '@/stores/memoryStore'
import dayjs from 'dayjs'

const props = defineProps({ memory: { type: Object, default: null } })
const emit = defineEmits(['close'])

const router = useRouter()
const store = useMemoryStore()
const commentText = ref('')
const currentIndex = ref(0)

// Reset index when memory changes
watch(() => props.memory, () => { currentIndex.value = 0 })

const allFiles = computed(() => {
  if (!props.memory) return []
  if (props.memory.mediaFiles?.length) return props.memory.mediaFiles
  return [{ url: props.memory.mediaUrl, thumbnailUrl: props.memory.thumbnailUrl, type: props.memory.mediaType }]
})

const currentFile = computed(() => allFiles.value[currentIndex.value] || { url: '', type: 'image' })
const isAlbum = computed(() => allFiles.value.length > 1)

const isAnniversary = computed(() => {
  if (!props.memory) return false
  const today = dayjs()
  const mem = dayjs(props.memory.date)
  return today.year() > mem.year() && today.month() === mem.month() && today.date() === mem.date()
})
const anniversaryYears = computed(() => props.memory ? dayjs().year() - dayjs(props.memory.date).year() : 0)

function formatDate(d) { return dayjs(d).format('YYYY年M月D日') }
function onLike() { if (props.memory) store.toggleLike(props.memory.id) }
function goDetail() {
  if (!props.memory) return
  router.push({ name: 'detail', params: { id: props.memory.id } })
  emit('close')
}
function submitComment() {
  const text = commentText.value.trim()
  if (!text || !props.memory) return
  store.addComment(props.memory.id, text)
  commentText.value = ''
}
</script>

<style scoped>
.theater-enter-active, .theater-leave-active { transition: opacity 0.25s ease; }
.theater-enter-from, .theater-leave-to { opacity: 0; }

@keyframes theaterIn {
  0%  { opacity: 0; transform: scale(0.9) translateY(16px); }
  100%{ opacity: 1; transform: scale(1) translateY(0); }
}
</style>
