<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const first_name = ref('')
const last_name = ref('')
const role = ref('student')
const error = ref('')
const message = ref('')
const router = useRouter()

const register = async () => {
  error.value = ''
  message.value = ''
  try {
    const res = await axios.post('http://localhost:3366/api/auth/register', {
      email: email.value,
      password: password.value,
      first_name: first_name.value,
      last_name: last_name.value,
      role: role.value
    })
    message.value = res.data.message
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.'
  }
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Register</h2>
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    <form @submit.prevent="register">
      <label>First Name</label>
      <input v-model="first_name" type="text" required />
      <label>Last Name</label>
      <input v-model="last_name" type="text" />
      <label>Email</label>
      <input v-model="email" type="email" required />
      <label>Password</label>
      <input v-model="password" type="password" required />
      <label>Role</label>
      <select v-model="role">
        <option value="student">Student</option>
        <option value="institute">Institute</option>
      </select>
      <button type="submit" class="button">Register</button>
    </form>
    <div style="text-align: center; margin-top: 1rem;">
      <router-link to="/login" style="color: #2563eb; text-decoration: none;">Already have an account? Login</router-link>
    </div>
  </div>
</template> 