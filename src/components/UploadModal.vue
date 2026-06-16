<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <div class="absolute inset-0 bg-stone-900/40 glass" @click="$emit('close')" />

        <div class="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl shadow-stone-200 overflow-hidden animate-slide-up md:animate-scale-in">
          <div class="flex justify-center pt-3 pb-1 md:hidden">
            <div class="w-10 h-1 rounded-full bg-warm-300" />
          </div>

          <div class="px-6 pt-4 pb-2 flex items-center justify-between border-b border-warm-200">
            <h2 class="text-stone-800 font-semibold text-lg">上傳新回憶</h2>
            <button class="text-stone-400 hover:text-stone-600 transition-colors text-xl" @click="$emit('close')">✕</button>
          </div>

          <div class="px-6 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">

            <!-- Drop zone (no files selected) -->
            <div
              v-if="!selectedFiles.length"
              class="relative mt-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer h-40"
              :class="isDragging ? 'border-amber-400 bg-amber-50' : 'border-warm-300 hover:border-amber-400'"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onDrop"
              @click="fileInput.click()"
            >
              <div class="text-4xl opacity-30">📷</div>
              <p class="text-stone-400 text-sm text-center">
                拖曳或點擊上傳<br>
                <span class="text-xs opacity-70">圖片可多選，支援 JPG、PNG、MP4、MOV</span>
              </p>
              <input
                ref="fileInput"
                type="file"
                accept="image/*,video/*"
                multiple
                class="hidden"
                @change="onFileChange"
              />
            </div>

            <!-- Multi-photo preview grid -->
            <template v-else-if="isMultiPhoto">
              <div class="mt-4">
                <div class="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                  <div
                    v-for="(preview, i) in previews"
                    :key="i"
                    class="relative aspect-square bg-warm-100"
                  >
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button
                      class="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white flex items-center justify-center text-[10px] hover:bg-red-500/80 transition-colors"
                      @click="removeFile(i)"
                    >✕</button>
                  </div>
                  <!-- Add more -->
                  <button
                    class="aspect-square border-2 border-dashed border-warm-300 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-colors gap-1"
                    @click="fileInput.click()"
                  >
                    <span class="text-2xl leading-none">+</span>
                    <span class="text-[10px]">新增</span>
                  </button>
                </div>
                <p class="text-stone-400 text-xs mt-2 text-center">已選 {{ selectedFiles.length }} 張相片</p>
                <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
              </div>
            </template>

            <!-- Single file preview (video or single image) -->
            <template v-else>
              <div
                class="relative mt-4 rounded-xl border-2 border-transparent h-48 cursor-pointer"
                @click="fileInput.click()"
              >
                <img v-if="fileType === 'image'" :src="previews[0]" class="w-full h-full object-cover rounded-xl" />
                <video v-else :src="previews[0]" class="w-full h-full object-cover rounded-xl" muted />
                <button
                  class="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                  @click.stop="clearFiles"
                >✕</button>
              </div>
              <input ref="fileInput" type="file" accept="image/*,video/*" class="hidden" @change="onFileChange" />
            </template>

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
                rows="2"
                class="w-full bg-warm-100 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 text-sm border border-warm-300 focus:border-amber-400 transition-colors resize-none"
                placeholder="記錄當時的心情與故事..."
              />
            </div>

            <!-- Date & Location -->
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

            <!-- Progress -->
            <div v-if="uploading" class="space-y-1.5">
              <div class="flex justify-between text-xs text-stone-400">
                <span>{{ progressLabel }}</span>
                <span>{{ progress }}%</span>
              </div>
              <div class="w-full h-1.5 bg-warm-200 rounded-full overflow-hidden">
                <div class="h-full grad-border rounded-full transition-all duration-300" :style="{ width: progress + '%' }" />
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
              {{ uploading ? '上傳中…' : (isMultiPhoto ? `儲存 ${selectedFiles.length} 張相片` : '儲存這段回憶') }}
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
const selectedFiles = ref([])  // File[]
const thumbnailBlobs = ref([]) // Blob[] (for videos), null entry for images
const previews = ref([])       // dataURL[]
const fileType = ref('image')
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const progressLabel = ref('正在上傳...')

const form = ref({
  title: '',
  description: '',
  date: dayjs().format('YYYY-MM-DD'),
  location: '',
})

const isMultiPhoto = computed(() => selectedFiles.value.length > 1)
const canSubmit = computed(() => form.value.title.trim().length > 0 && selectedFiles.value.length > 0 && !uploading.value)

function onDrop(e) {
  isDragging.value = false
  const files = [...(e.dataTransfer?.files || [])]
  if (files.length) addFiles(files)
}

function onFileChange(e) {
  const files = [...(e.target.files || [])]
  if (files.length) addFiles(files)
  e.target.value = ''
}

function addFiles(files) {
  // If already have files and they're images, only add more images
  const existingType = selectedFiles.value[0]?.type
  const filteredFiles = existingType?.startsWith('image')
    ? files.filter(f => f.type.startsWith('image'))
    : files

  for (const file of filteredFiles) {
    if (selectedFiles.value.length >= 9) break // max 9 photos
    if (file.type.startsWith('video') && selectedFiles.value.length > 0) continue // single video only
    addSingleFile(file)
  }
}

function addSingleFile(file) {
  fileType.value = file.type.startsWith('video') ? 'video' : 'image'
  selectedFiles.value.push(file)
  thumbnailBlobs.value.push(null)

  const reader = new FileReader()
  reader.onload = (e) => previews.value.push(e.target.result)
  reader.readAsDataURL(file)

  if (fileType.value === 'video') captureVideoThumbnail(file, selectedFiles.value.length - 1)
}

function captureVideoThumbnail(file, index) {
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
    canvas.toBlob((blob) => { thumbnailBlobs.value[index] = blob }, 'image/jpeg', 0.85)
  }
  video.onerror = () => URL.revokeObjectURL(url)
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
  thumbnailBlobs.value.splice(index, 1)
  previews.value.splice(index, 1)
}

function clearFiles() {
  selectedFiles.value = []
  thumbnailBlobs.value = []
  previews.value = []
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
      selectedFiles.value,
      thumbnailBlobs.value,
      (p, label) => {
        progress.value = p
        progressLabel.value = label || '正在上傳...'
      },
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
  clearFiles()
  progress.value = 0
  progressLabel.value = '正在上傳...'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
