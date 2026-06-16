import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export default createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/memory/:id',
      name: 'detail',
      component: () => import('@/views/MemoryDetailView.vue'),
    },
  ],
})
