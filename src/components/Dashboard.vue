<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const user = ref(null)
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return router.push('/login')
  try {
    const res = await axios.get('http://localhost:3366/api/student/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    user.value = res.data
  } catch {
    localStorage.removeItem('token')
    router.push('/login')
  }
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <div class="page-center">
    <div class="form-container" style="max-width:500px;">
      <h2>Dashboard</h2>
      <div v-if="user">
        <p style="margin-bottom:1rem;">Welcome, <span style="font-weight:600;">{{ user.first_name }}</span>!</p>
        <p style="margin-bottom:2rem;color:#555;">Email: {{ user.email }}</p>
        <button @click="logout" class="button" style="background:#dc2626;">Logout</button>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template> 