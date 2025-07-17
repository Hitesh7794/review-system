<template>
  <header class="header">
    <div class="logo">🎓 EduReview</div>
    <nav>
      <router-link v-if="!isLoggedIn" to="/" exact>Home</router-link>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
      <router-link v-if="isLoggedIn && userRole === 'student'" to="/dashboard">Dashboard</router-link>
      <router-link v-if="isLoggedIn && userRole === 'institute'" to="/dashboard">Institute</router-link>
      <router-link v-if="isLoggedIn && userRole === 'admin'" to="/dashboard">Admin</router-link>
      <a v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const userRole = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return ''
  try {
    return JSON.parse(atob(token.split('.')[1])).role
  } catch {
    return ''
  }
})

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script> 