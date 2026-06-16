<template>
  <aside class="fixed top-0 left-0 h-full w-64 bg-warm-100 border-r border-warm-300 flex flex-col z-30">
    <!-- Logo -->
    <div class="px-6 pt-8 pb-6 border-b border-warm-300">
      <h1 class="grad-text text-2xl font-bold tracking-tight">肥仔霖回鄉記</h1>
      <p class="text-stone-400 text-xs mt-0.5">夢開始的地方</p>
    </div>

    <!-- Nav -->
    <nav class="px-3 py-4 space-y-1">
      <SideNavItem icon="home" label="首頁" :active="activeRoute === '/'" @click="$router.push('/')" />
      <SideNavItem icon="upload" label="上傳回憶" @click="$emit('upload')" />
    </nav>

    <div class="px-3 mt-2">
      <p class="text-stone-400 text-[10px] uppercase tracking-widest px-3 mb-2">版面</p>
      <div class="flex gap-2 px-3">
        <button
          v-for="mode in [{ id: 'masonry', icon: '⊞', label: '瀑布' }, { id: 'timeline', icon: '⊟', label: '時間軸' }]"
          :key="mode.id"
          class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="store.viewMode === mode.id
            ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-400/40'
            : 'text-stone-400 hover:text-stone-600 hover:bg-warm-200'"
          @click="store.viewMode = mode.id"
        >
          {{ mode.icon }} {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Year filter -->
    <div v-if="store.allYears.length" class="px-3 mt-6">
      <p class="text-stone-400 text-[10px] uppercase tracking-widest px-3 mb-2">年份</p>
      <div class="space-y-0.5">
        <FilterChip
          label="全部"
          :active="store.activeYear === null && store.activeTag === null"
          @click="store.setFilter(null, null)"
        />
        <FilterChip
          v-for="year in store.allYears"
          :key="year"
          :label="String(year)"
          :active="store.activeYear === year"
          @click="store.setFilter(year, null)"
        />
      </div>
    </div>

    <!-- Tag filter (location) -->
    <div v-if="store.allTags.length" class="px-3 mt-6">
      <p class="text-stone-400 text-[10px] uppercase tracking-widest px-3 mb-2">地點</p>
      <div class="flex flex-wrap gap-1.5 px-3">
        <button
          v-for="tag in store.allTags"
          :key="tag"
          class="text-[10px] px-2.5 py-1 rounded-full transition-all font-medium"
          :class="store.activeTag === tag
            ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-400/40'
            : 'bg-warm-200 text-stone-500 hover:text-stone-700'"
          @click="store.setFilter(null, tag)"
        >
          📍 {{ tag }}
        </button>
      </div>
    </div>

    <!-- Bottom spacer -->
    <div class="mt-auto px-6 py-6 border-t border-warm-300">
      <p class="text-stone-300 text-xs text-center">回憶 · Memories</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMemoryStore } from '@/stores/memoryStore'

defineEmits(['upload'])

const store = useMemoryStore()
const route = useRoute()
const activeRoute = computed(() => route.path)
</script>

<script>
const SideNavItem = {
  props: ['icon', 'label', 'active'],
  emits: ['click'],
  template: `
    <button
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
      :class="active ? 'bg-amber-100 text-amber-700 font-medium' : 'text-stone-500 hover:text-stone-700 hover:bg-warm-200'"
      @click="$emit('click')"
    >
      <span class="text-base">{{ icon === 'home' ? '🏠' : '✦' }}</span>
      {{ label }}
    </button>
  `
}

const FilterChip = {
  props: ['label', 'active'],
  emits: ['click'],
  template: `
    <button
      class="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all"
      :class="active ? 'text-stone-800 bg-warm-200 font-medium' : 'text-stone-400 hover:text-stone-600'"
      @click="$emit('click')"
    >{{ label }}</button>
  `
}
</script>
