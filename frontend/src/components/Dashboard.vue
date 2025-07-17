<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const user = ref(null)
const userRole = ref('')
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return router.push('/login')
  
  try {
    // Get user info from token (we'll decode it)
    const tokenData = JSON.parse(atob(token.split('.')[1]))
    userRole.value = tokenData.role
    
    // Get user profile based on role
    if (tokenData.role === 'student') {
      const res = await axios.get('http://localhost:3366/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      user.value = res.data
    } else if (tokenData.role === 'institute') {
      // For institute, we'll show basic info from token
      user.value = {
        first_name: tokenData.first_name || 'Institute',
        email: tokenData.email,
        role: tokenData.role
      }
    } else if (tokenData.role === 'admin') {
      // For admin, we'll show basic info from token
      user.value = {
        first_name: tokenData.first_name || 'Admin',
        email: tokenData.email,
        role: tokenData.role
      }
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    localStorage.removeItem('token')
    router.push('/login')
  }
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="card" style="max-width: 600px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Dashboard</h2>
    <div v-if="user">
      <p style="margin-bottom: 1rem; font-size: 1.1rem;">Welcome, <span style="font-weight: 600; color: #2563eb;">{{ user.first_name }}</span>!</p>
      <p style="margin-bottom: 1rem; color: #64748b;">Email: {{ user.email }}</p>
      <p style="margin-bottom: 2rem; color: #64748b;">Role: <span style="text-transform: capitalize; font-weight: 600;">{{ user.role }}</span></p>
      
      <!-- Institute-specific actions -->
      <div v-if="userRole === 'institute'" style="margin-bottom: 2rem;">
        <h3 style="font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Institute Actions:</h3>
        <button @click="navigateTo('/institute/profile')" class="button secondary" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">View Profile</button>
        <button @click="navigateTo('/institute/reviews')" class="button secondary" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">View Reviews</button>
      </div>
      
      <!-- Student-specific actions -->
      <div v-if="userRole === 'student'" style="margin-bottom: 2rem;">
        <h3 style="font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Student Actions:</h3>
        <button @click="navigateTo('/student/search')" class="button" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">Search Institutes</button>
        <button @click="navigateTo('/student/reviews')" class="button secondary" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">My Reviews</button>
      </div>
      
      <!-- Admin-specific actions -->
      <div v-if="userRole === 'admin'" style="margin-bottom: 2rem;">
        <h3 style="font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Admin Actions:</h3>
        <button @click="navigateTo('/admin/institutes')" class="button" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">Approve Institutes</button>
        <button @click="navigateTo('/admin/reviews')" class="button secondary" style="margin-right: 0.5rem; margin-bottom: 0.5rem;">Moderate Reviews</button>
      </div>
      
      <button @click="logout" class="button" style="background: #dc2626;">Logout</button>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template> 