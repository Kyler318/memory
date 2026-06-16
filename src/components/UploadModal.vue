<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/40 glass" @click="$emit('close')" />

        <!-- Panel -->
        <div class="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl shadow-stone-200 overflow-hidden animate-slide-up md:animate-scale-in">
          <!-- Handle (mobile) -->
          <div class="flex justify-center pt-3 pb-1 md:hidden">
            <div class="w-10 h-1 rounded-full bg-warm-300" />
          </div>

          <div class="px-6 pt-4 pb-2 flex items-center justify-between border-b border-warm-200">
            <h2 class="text-stone-800 font-semibold text-lg">上傳新回憶</h2>
            <button class="text-stone-400 hover:text-stone-600 transition-colors text-xl" @click="$emit('close')">✕</button>
          </div>

          <div class="px-6 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <!-- Drop zone -->
            <div
              class="relative mt-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
              :class="isDragging
                ? 'border-amber-400 bg-amber-50 h-40'
                : previewUrl ? 'border-transparent h-48' : 'border-warm-300 hover:border-amber-400 h-40'"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onDrop"
              @click="fileInput.click()"
            >
              <template v-if="previewUrl">
                <img v-if="fileType === 'image'" :src="previewUrl" class="w-full h-full object-cover rounded-xl" />
                <video v-else :src="previewUrl" class="w-full h-full object-cover rounded-xl" muted />
                <button
                  class="absolute top-2 right-2 bg-stone-800/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                  @click.stop="clearFile"
                >✕</button>
              </template>
              <template v-else>
                <div class="text-4xl opacity-30">📷</div>
                <p class="text-stone-400 text-sm text-center">
                  拖曳或點擊上傳<br>
                  <span class="text-xs opacity-70">支援 JPG、PNG、MP4、MOV</span>
                </p>
              </template>
              <input ref="fileInput" type="file" accept="image/*,video/*" class="hidden" @change="onFileChange" />
            </div>

            <!-- Title -->
            <div>
              <label class="text-stone-500 text-xs mb-1.5 block font-medium">標題</label>
              <input
                v-model="form.title"
                class="w-full bg-warm-100 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 text-sm border border-warm-300 focus:border-amber-400 transition-colors"
                placeholder="這個回憶的名字..."
              />
            </div>

            <!-- Description -->
            <div>
              <label class="text-stone-500 text-xs mb-1.5 block font-medium">描述</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full bg-warm-100 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 text-sm border border-warm-300 focus:border-amber-400 transition-colors resize-none"
                placeholder="記錄當時的心情與故事..."
              />
            </div>

            <!-- Date & Location row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-stone-500 text-xs mb-1.5 block font-medium">日期</label>
                <input
                  v-model="form.date"
                  type="date"
                  class="w-full bg-warm-100 rounded-xl px-4 py-3 text-stone-800 text-sm border border-warm-300 focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <label class="text-stone-500 text-xs mb-1.5 block font-medium">地點</label>
                <input
                  v-model="form.location"
                  class="w-full bg-warm-100 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 text-sm border border-warm-300 focus:border-amber-400 transition-colors"
                  placeholder="例：台北、花蓮..."
                />
              </div>
            </div>

            <!-- Progress bar -->
            <div v-if="uploading" class="space-y-1.5">
              <div class="flex justify-between text-xs text-stone-400">
                <span>正在上傳...</span>
                <span>{{ progress }}%</span>
              </div>
              <div class="w-full h-1.5 bg-warm-200 rounded-full overflow-hidden">
                <div
                  class="h-full grad-border rounded-full transition-all duration-300"
                  :style="{ width: progress + '%' }"
                />
              </div>
            </div>

            <!-- Submit -->
            <button
              class="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
              :class="canSubmit
                ? 'grad-border text-white shadow-lg shadow-amber-500/20 hover:opacity-90 active:scale-[0.98]'
                : 'bg-warm-200 text-stone-300 cursor-not-allowed'"
              :disabled="!canSubmit || uploading"
              @click="submit"
            >
              {{ uploading ? '上傳中…' : '儲存這段回憶' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import dayjs from 'dayjs'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const store = useMemoryStore()

const fileInput = ref(null)
const selectedFile = ref(null)
const thumbnailBlob = ref(null)
const previewUrl = ref(null)
const fileType = ref('image')
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref(0)

const form = ref({
  title: '',
  description: '',
  date: dayjs().format('YYYY-MM-DD'),
  location: '',
})

const canSubmit = computed(() => form.value.title.trim().length > 0 && !uploading.value)

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) readFile(file)
}

function readFile(file) {
  selectedFile.value = file
  fileType.value = file.type.startsWith('video') ? 'video' : 'image'
  const reader = new FileReader()
  reader.onload = (e) => { previewUrl.value = e.target.result }
  reader.readAsDataURL(file)
  if (fileType.value === 'video') captureVideoThumbnail(file)
}

function captureVideoThumbnail(file) {
  thumbnailBlob.value = null
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  const url = URL.createObjectURL(file)
  video.src = url
  video.onloadeddata = () => { video.currentTime = 1 }
  video.onseeked = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => { thumbnailBlob.value = blob }, 'image/jpeg', 0.85)
  }
  video.onerror = () => URL.revokeObjectURL(url)
}

function clearFile() {
  selectedFile.value = null
  thumbnailBlob.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  if (!canSubmit.value) return
  uploading.value = true
  progress.value = 0

  try {
    await store.addMemory(
      {
        title: form.value.title,
        description: form.value.description,
        date: form.value.date,
        location: form.value.location,
        mediaType: fileType.value,
      },
      selectedFile.value,
      thumbnailBlob.value,
      (p) => { progress.value = p },
    )
    progress.value = 100
    emit('saved')
    resetForm()
  } finally {
    uploading.value = false
  }
}

function resetForm() {
  form.value = { title: '', description: '', date: dayjs().format('YYYY-MM-DD'), location: '' }
  selectedFile.value = null
  thumbnailBlob.value = null
  previewUrl.value = null
  progress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
