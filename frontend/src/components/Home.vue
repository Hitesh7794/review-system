<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
</script>

<template>
  <div class="card" style="max-width: 700px; text-align: center;">
    <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #1e293b;">🎓 Welcome to EduReview</h1>
    <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #64748b; line-height: 1.6;">
      The premier platform for students to discover, review, and connect with educational institutes worldwide.
    </p>
    
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
      <div style="flex: 1; min-width: 200px;">
        <h3 style="color: #2563eb; margin-bottom: 0.5rem;">👨‍🎓 Students</h3>
        <p style="color: #64748b; font-size: 0.9rem;">Search institutes, read reviews, and share your experiences</p>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <h3 style="color: #059669; margin-bottom: 0.5rem;">🏢 Institutes</h3>
        <p style="color: #64748b; font-size: 0.9rem;">Create profiles, manage reviews, and connect with students</p>
      </div>
    </div>
    
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button @click="goToLogin" class="button">Login</button>
      <button @click="goToRegister" class="button secondary">Register</button>
    </div>
  </div>
</template> 