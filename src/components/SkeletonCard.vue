<template>
  <div class="rounded-2xl overflow-hidden bg-warm-200 animate-skeleton border border-warm-300" :style="{ height: height + 'px' }">
    <div class="w-full h-full relative">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-warm-100/50 to-transparent -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite]" />
    </div>
  </div>
</template>

<script setup>
defineProps({ height: { type: Number, default: 260 } })
</script>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(200%); }
}
</style>
