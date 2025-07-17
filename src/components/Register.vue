<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const first_name = ref('')
const last_name = ref('')
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
      role: 'student'
    })
    message.value = res.data.message
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.'
  }
}
</script>

<template>
  <div class="page-center">
    <form @submit.prevent="register" class="form-container">
      <h2>Register</h2>
      <div v-if="error" class="text-error">{{ error }}</div>
      <div v-if="message" class="text-success">{{ message }}</div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="first_name" type="text" required />
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="last_name" type="text" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" class="button" style="background:#16a34a;">Register</button>
      <div class="text-center" style="margin-top:1rem;">
        <router-link to="/login" class="link">Already have an account? Login</router-link>
      </div>
    </form>
  </div>
</template> 