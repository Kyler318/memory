import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { db, storage } from '@/firebase'
import {
  collection, getDocs, addDoc, updateDoc, doc, query, orderBy,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, uploadBytes, getDownloadURL } from 'firebase/storage'

export const useMemoryStore = defineStore('memories', () => {
  const memories = ref([])
  const activeYear = ref(null)
  const activeTag = ref(null)
  const viewMode = ref('masonry')
  const likedSet = ref(new Set(JSON.parse(localStorage.getItem('liked_ids') || '[]')))

  async function loadMemories() {
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    memories.value = snap.docs.map(d => ({
      id: d.id,
      likes: 0,
      comments: [],
      ...d.data(),
      liked: likedSet.value.has(d.id),
    }))
  }

  async function uploadFile(file, onProgress) {
    const ext = file.name.split('.').pop()
    const path = `memories/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const ref = storageRef(storage, path)
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(ref, file)
      task.on(
        'state_changed',
        snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
      )
    })
  }

  async function addMemory(data, file, thumbnailBlob, onProgress) {
    const mediaUrl = file ? await uploadFile(file, onProgress) : data.mediaUrl

    let thumbnailUrl = mediaUrl
    if (thumbnailBlob) {
      const thumbRef = storageRef(storage, `thumbnails/${Date.now()}_thumb.jpg`)
      await uploadBytes(thumbRef, thumbnailBlob)
      thumbnailUrl = await getDownloadURL(thumbRef)
    }

    const payload = {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      tags: data.location ? [data.location] : [],
      mediaType: data.mediaType,
      mediaUrl,
      thumbnailUrl,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'memories'), payload)
    const newMemory = { id: docRef.id, ...payload, liked: false }
    memories.value.unshift(newMemory)
    return newMemory
  }

  function toggleLike(id) {
    const m = memories.value.find(m => m.id === id)
    if (!m) return
    m.liked = !m.liked
    m.likes += m.liked ? 1 : -1
    if (m.liked) likedSet.value.add(id)
    else likedSet.value.delete(id)
    localStorage.setItem('liked_ids', JSON.stringify([...likedSet.value]))
    updateDoc(doc(db, 'memories', id), { likes: m.likes })
  }

  function addComment(id, text, author = '我') {
    const m = memories.value.find(m => m.id === id)
    if (!m) return
    const comment = { id: `c${Date.now()}`, author, text, date: dayjs().format('YYYY-MM-DD') }
    m.comments.push(comment)
    updateDoc(doc(db, 'memories', id), { comments: m.comments })
  }

  const filtered = computed(() => {
    let list = [...memories.value].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (activeYear.value) list = list.filter(m => dayjs(m.date).year() === activeYear.value)
    if (activeTag.value) list = list.filter(m => m.tags?.includes(activeTag.value))
    return list
  })

  const allYears = computed(() =>
    [...new Set(memories.value.map(m => dayjs(m.date).year()))].sort((a, b) => b - a)
  )

  const allTags = computed(() =>
    [...new Set(memories.value.flatMap(m => m.tags || []))].sort()
  )

  function getById(id) {
    return memories.value.find(m => m.id === id)
  }

  function setFilter(year, tag) {
    activeYear.value = year
    activeTag.value = tag
  }

  return {
    memories, filtered, allYears, allTags,
    activeYear, activeTag, viewMode,
    loadMemories, getById, toggleLike, addComment, addMemory, setFilter,
  }
})
