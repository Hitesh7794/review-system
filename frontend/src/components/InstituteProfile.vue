<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const profile = ref({
  name: '',
  description: '',
  category: 'other',
  contact_email: '',
  contact_phone: '',
  website: '',
  address_street: '',
  address_city: '',
  address_state: '',
  address_country: '',
  latitude: '',
  longitude: ''
})

const loading = ref(false)
const error = ref('')
const message = ref('')
const isEditing = ref(false)
const originalProfile = ref(null)
const imageFile = ref(null)
const imagePreview = ref('')

onMounted(async () => {
  await checkExistingProfile()
})

const checkExistingProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/institute/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data) {
      profile.value = response.data
      originalProfile.value = { ...response.data }
      isEditing.value = false
    }
  } catch (err) {
    // No existing profile, that's fine
  }
}

const startEdit = () => {
  originalProfile.value = { ...profile.value }
  isEditing.value = true
}

const cancelEdit = () => {
  profile.value = { ...originalProfile.value }
  isEditing.value = false
}

const saveProfile = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    const url = `/api/institute/profile/${profile.value.id}`
    const response = await axios.put(url, profile.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = response.data.message
    profile.value = response.data.institute || profile.value
    originalProfile.value = { ...profile.value }
    isEditing.value = false
  } catch (err) {
    error.value = err.response?.data?.message || 'Profile update failed'
  } finally {
    loading.value = false
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  // Upload to backend
  const formData = new FormData()
  formData.append('image', file)
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('/api/institute/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    profile.value.image_url = response.data.url
    message.value = 'Image uploaded successfully!'
  } catch (err) {
    error.value = 'Image upload failed.'
  }
}
</script>

<template>
  <div class="card">
    <h2 style="text-align: center;">Institute Profile</h2>
    <div v-if="profile.image_url || imagePreview" style="text-align: center; margin-bottom: 2rem;">
      <img :src="imagePreview || profile.image_url" alt="Institute Logo" style="max-width: 180px; max-height: 180px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: #f3f4f6;" />
    </div>
    <div v-if="profile.Creator" class="profile-creator">
      <span><strong>Created by:</strong> {{ profile.Creator.first_name }} {{ profile.Creator.last_name }} ({{ profile.Creator.email }})</span>
    </div>
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    <div v-if="!isEditing">
      <div class="profile-grid">
        <div><strong>Institute Name:</strong> {{ profile.name }}</div>
        <div><strong>Category:</strong> {{ profile.category }}</div>
        <div><strong>Description:</strong> {{ profile.description }}</div>
        <div><strong>Contact Email:</strong> {{ profile.contact_email }}</div>
        <div><strong>Contact Phone:</strong> {{ profile.contact_phone }}</div>
        <div><strong>Website:</strong> <a :href="profile.website" target="_blank">{{ profile.website }}</a></div>
        <div><strong>Street Address:</strong> {{ profile.address_street }}</div>
        <div><strong>City:</strong> {{ profile.address_city }}</div>
        <div><strong>State/Province:</strong> {{ profile.address_state }}</div>
        <div><strong>Country:</strong> {{ profile.address_country }}</div>
        <div><strong>Latitude:</strong> {{ profile.latitude }}</div>
        <div><strong>Longitude:</strong> {{ profile.longitude }}</div>
      </div>
      <div style="text-align: center; margin-top: 2rem;">
        <button class="button" @click="startEdit">{{ profile.id ? 'Edit' : 'Create Profile' }}</button>
      </div>
    </div>
    <div v-else>
      <div class="form-group" style="text-align: center; margin-bottom: 1rem;">
        <label for="image">Institute Logo/Image</label>
        <input id="image" type="file" accept="image/*" @change="handleImageUpload" />
        <div v-if="imagePreview || profile.image_url" style="margin-top: 1rem;">
          <img :src="imagePreview || profile.image_url" alt="Preview" style="max-width: 180px; max-height: 180px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: #f3f4f6;" />
        </div>
      </div>
      <div class="profile-grid">
        <div>
          <label>Institute Name *</label>
          <input v-model="profile.name" type="text" required />
        </div>
        <div>
          <label>Category *</label>
          <select v-model="profile.category" required>
            <option value="engineering">Engineering</option>
            <option value="medical">Medical</option>
            <option value="arts">Arts</option>
            <option value="commerce">Commerce</option>
            <option value="science">Science</option>
            <option value="law">Law</option>
            <option value="management">Management</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Description</label>
          <textarea v-model="profile.description" rows="3" placeholder="Describe your institute..."></textarea>
        </div>
        <div>
          <label>Contact Email</label>
          <input v-model="profile.contact_email" type="email" />
        </div>
        <div>
          <label>Contact Phone</label>
          <input v-model="profile.contact_phone" type="tel" />
        </div>
        <div>
          <label>Website</label>
          <input v-model="profile.website" type="url" placeholder="https://..." />
        </div>
        <div>
          <label>Street Address</label>
          <input v-model="profile.address_street" type="text" />
        </div>
        <div>
          <label>City</label>
          <input v-model="profile.address_city" type="text" />
        </div>
        <div>
          <label>State/Province</label>
          <input v-model="profile.address_state" type="text" />
        </div>
        <div>
          <label>Country</label>
          <input v-model="profile.address_country" type="text" />
        </div>
        <div>
          <label>Latitude</label>
          <input v-model="profile.latitude" type="number" step="any" />
        </div>
        <div>
          <label>Longitude</label>
          <input v-model="profile.longitude" type="number" step="any" />
        </div>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
        <button class="button" @click="saveProfile" :disabled="loading">{{ loading ? 'Saving...' : (profile.id ? 'Save' : 'Create Profile') }}</button>
        <button class="button secondary" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 2rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 700px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
.profile-creator {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #64748b;
}
</style> 