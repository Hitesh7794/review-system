<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    const res = await axios.post('http://localhost:3366/api/auth/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', res.data.token)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed.'
  }
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Login</h2>
    <div v-if="error" class="alert error">{{ error }}</div>
    <form @submit.prevent="login">
      <label>Email</label>
      <input v-model="email" type="email" required />
      <label>Password</label>
      <input v-model="password" type="password" required />
      <button type="submit" class="button">Login</button>
    </form>
    <div style="text-align: center; margin-top: 1rem;">
      <router-link to="/register" style="color: #2563eb; text-decoration: none;">Don't have an account? Register</router-link>
    </div>
  </div>
</template> 