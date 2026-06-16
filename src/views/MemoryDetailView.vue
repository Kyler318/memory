<template>
  <div v-if="memory" class="min-h-screen">
    <!-- Back button -->
    <button
      class="fixed top-4 left-4 md:left-72 z-30 flex items-center gap-2 bg-white/80 glass text-stone-600 hover:text-stone-800 rounded-full px-3 py-2 text-sm transition-all shadow-sm border border-warm-300"
      @click="$router.back()"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      <span class="hidden md:inline">返回</span>
    </button>

    <!-- Hero media -->
    <div class="relative w-full bg-warm-200 animate-scale-in" style="max-height: 65vh; min-height: 40vh;">
      <img
        v-if="memory.mediaType === 'image'"
        :src="memory.mediaUrl"
        :alt="memory.title"
        class="w-full object-cover"
        style="max-height: 65vh; min-height: 40vh;"
      />
      <video
        v-else
        :src="memory.mediaUrl"
        controls
        autoplay
        class="w-full"
        style="max-height: 65vh;"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-warm-50 via-transparent to-transparent pointer-events-none" />
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 md:px-6 -mt-8 relative z-10 pb-24 md:pb-16 animate-fade-up">

      <!-- Location tag -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-if="memory.location"
          class="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200"
        >📍 {{ memory.location }}</span>
        <span
          v-else
          v-for="tag in memory.tags" :key="tag"
          class="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200"
        >📍 {{ tag }}</span>
      </div>

      <h1 class="text-stone-800 text-2xl md:text-3xl font-bold leading-tight mb-2">
        {{ memory.title }}
      </h1>
      <time class="text-stone-400 text-sm">{{ formatDate(memory.date) }}</time>

      <!-- Actions -->
      <div class="flex items-center gap-4 mt-4 mb-6 pb-6 border-b border-warm-300">
        <button class="flex items-center gap-2 group" @click="onLike">
          <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
            :class="memory.liked ? 'bg-pink-50 border-pink-200' : 'bg-warm-100 border-warm-300 hover:bg-pink-50'"
          >
            <svg
              class="w-5 h-5 transition-all"
              :class="memory.liked ? 'fill-pink-500 text-pink-500' : 'fill-transparent text-stone-400 group-hover:text-pink-400'"
              :style="likeAnimating ? 'animation: heartPop 0.35s cubic-bezier(0.34,1.56,0.64,1)' : ''"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span class="text-stone-400 text-sm">{{ memory.likes }}</span>
        </button>

        <button class="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors" @click="focusComment">
          <div class="w-10 h-10 rounded-full bg-warm-100 border border-warm-300 hover:bg-warm-200 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span class="text-sm">{{ memory.comments.length }}</span>
        </button>
      </div>

      <!-- Description -->
      <p class="text-stone-600 text-base leading-relaxed whitespace-pre-line mb-8">
        {{ memory.description }}
      </p>

      <!-- Comments -->
      <section>
        <h2 class="text-stone-400 text-sm font-semibold uppercase tracking-wider mb-4">留言</h2>

        <div v-if="memory.comments.length" class="space-y-4 mb-6">
          <div
            v-for="c in memory.comments" :key="c.id"
            class="flex gap-3 animate-fade-up"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              {{ c.author[0] }}
            </div>
            <div>
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-stone-700 text-sm font-medium">{{ c.author }}</span>
                <time class="text-stone-400 text-xs">{{ c.date }}</time>
              </div>
              <p class="text-stone-500 text-sm">{{ c.text }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-stone-300 text-sm text-center py-4 mb-4">還沒有留言，第一個說些什麼吧</div>

        <!-- Comment input -->
        <div class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">我</div>
          <div class="flex-1 bg-warm-100 rounded-2xl px-4 py-3 ring-1 ring-warm-300 focus-within:ring-amber-400/50 transition-all border border-warm-300">
            <textarea
              ref="commentInput"
              v-model="commentText"
              rows="1"
              class="w-full text-stone-700 placeholder-stone-300 text-sm resize-none bg-transparent"
              placeholder="說些什麼…"
              @input="autoResize"
              @keydown.enter.prevent="submitComment"
            />
            <div v-show="commentText.length" class="flex justify-end mt-2">
              <button
                class="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                @click="submitComment"
              >送出</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="flex items-center justify-center min-h-screen flex-col gap-4">
    <p class="text-stone-300 text-5xl">🌿</p>
    <p class="text-stone-400">找不到這段回憶</p>
    <button class="text-amber-600 text-sm" @click="$router.push('/')">回到首頁</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMemoryStore } from '@/stores/memoryStore'
import dayjs from 'dayjs'

const route = useRoute()
const store = useMemoryStore()

const memory = computed(() => store.getById(route.params.id))
const commentText = ref('')
const commentInput = ref(null)
const likeAnimating = ref(false)

function formatDate(d) { return dayjs(d).format('YYYY年M月D日 dddd') }

function onLike() {
  likeAnimating.value = false
  requestAnimationFrame(() => { likeAnimating.value = true })
  store.toggleLike(route.params.id)
  setTimeout(() => { likeAnimating.value = false }, 400)
}

function focusComment() {
  commentInput.value?.focus()
}

function submitComment() {
  const text = commentText.value.trim()
  if (!text) return
  store.addComment(route.params.id, text)
  commentText.value = ''
}

function autoResize(e) {
  e.target.style.height = 'auto'
  e.target.style.height = e.target.scrollHeight + 'px'
}
</script>

<style scoped>
@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.45); }
  100% { transform: scale(1); }
}
</style>
