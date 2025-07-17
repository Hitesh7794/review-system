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
  <div class="page-center">
    <form @submit.prevent="login" class="form-container">
      <h2>Login</h2>
      <div v-if="error" class="text-error">{{ error }}</div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" class="button">Login</button>
      <div class="text-center" style="margin-top:1rem;">
        <router-link to="/register" class="link">Don't have an account? Register</router-link>
      </div>
    </form>
  </div>
</template> 