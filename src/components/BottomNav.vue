<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 bg-white/90 glass border-t border-warm-300 pb-safe">
    <div class="flex items-center justify-around h-16">
      <NavBtn icon="🏠" label="首頁" :active="route.name === 'home'" @click="$router.push('/')" />

      <!-- Upload FAB -->
      <button
        class="relative -top-5 w-14 h-14 rounded-full grad-border flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
        @click="$emit('upload')"
      >
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
      </button>

      <NavBtn icon="🔍" label="搜尋" :active="false" @click="$emit('search')" />
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
defineEmits(['upload', 'search'])
const route = useRoute()
</script>

<script>
const NavBtn = {
  props: ['icon', 'label', 'active'],
  emits: ['click'],
  template: `
    <button class="flex flex-col items-center gap-0.5 px-4 transition-all" @click="$emit('click')">
      <span class="text-xl" :class="active ? 'opacity-100' : 'opacity-35'">{{ icon }}</span>
      <span class="text-[10px]" :class="active ? 'text-amber-600 font-medium' : 'text-stone-400'">{{ label }}</span>
    </button>
  `
}
</script>
