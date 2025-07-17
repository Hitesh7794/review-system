<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const reviews = ref([])
const institutes = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const showReviewForm = ref(false)
const selectedInstitute = ref(null)

const newReview = ref({
  institute_id: '',
  rating: 5,
  title: '',
  body: ''
})

onMounted(async () => {
  await loadReviews()
  await loadInstitutes()
})

const loadReviews = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/student/reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })
    reviews.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load reviews'
  } finally {
    loading.value = false
  }
}

const loadInstitutes = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/student/institutes/search?mode=area&area=', {
      headers: { Authorization: `Bearer ${token}` }
    })
    institutes.value = response.data
  } catch (err) {
    console.error('Failed to load institutes for review form')
  }
}

const submitReview = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('http://localhost:3366/api/student/reviews', newReview.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    message.value = response.data.message
    showReviewForm.value = false
    newReview.value = { institute_id: '', rating: 5, title: '', body: '' }
    await loadReviews()
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED': return '#059669'
    case 'PENDING': return '#d97706'
    case 'REJECTED': return '#dc2626'
    default: return '#64748b'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'APPROVED': return '✅ Approved'
    case 'PENDING': return '⏳ Pending'
    case 'REJECTED': return '❌ Rejected'
    default: return status
  }
}
</script>

<template>
  <div class="card" style="max-width: 900px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">My Reviews</h2>
    
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h3 style="color: #1e293b;">Your Reviews ({{ reviews.length }})</h3>
      <button @click="showReviewForm = true" class="button">Write New Review</button>
    </div>
    
    <!-- Write Review Form -->
    <div v-if="showReviewForm" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; background: #f8fafc;">
      <h4 style="margin-bottom: 1rem; color: #1e293b;">Write a New Review</h4>
      <form @submit.prevent="submitReview">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label>Institute</label>
            <select v-model="newReview.institute_id" required>
              <option value="">Select an institute...</option>
              <option v-for="institute in institutes" :key="institute.id" :value="institute.id">
                {{ institute.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Rating</label>
            <select v-model="newReview.rating" required>
              <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 stars)</option>
              <option value="3">⭐⭐⭐ (3 stars)</option>
              <option value="2">⭐⭐ (2 stars)</option>
              <option value="1">⭐ (1 star)</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label>Title (optional)</label>
          <input v-model="newReview.title" type="text" placeholder="Review title..." />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label>Review</label>
          <textarea v-model="newReview.body" rows="4" placeholder="Share your experience..." required></textarea>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
          <button type="submit" class="button" :disabled="loading">
            {{ loading ? 'Submitting...' : 'Submit Review' }}
          </button>
          <button type="button" @click="showReviewForm = false" class="button secondary">Cancel</button>
        </div>
      </form>
    </div>
    
    <!-- Reviews List -->
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      <p>Loading your reviews...</p>
    </div>
    
    <div v-else-if="reviews.length === 0" style="text-align: center; padding: 2rem;">
      <p style="color: #64748b;">You haven't written any reviews yet.</p>
    </div>
    
    <div v-else style="display: grid; gap: 1rem;">
      <div v-for="review in reviews" :key="review.id" 
           style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <h4 style="margin-bottom: 0.5rem; color: #1e293b;">{{ review.Institute?.name }}</h4>
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.2rem;">{{ '⭐'.repeat(review.rating) }}</span>
              <span style="color: #64748b; font-size: 0.9rem;">{{ review.rating }}/5 stars</span>
            </div>
            <p v-if="review.title" style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">{{ review.title }}</p>
            <p style="color: #64748b; line-height: 1.6;">{{ review.body }}</p>
          </div>
          <div style="text-align: right;">
            <span :style="{ color: getStatusColor(review.status), fontWeight: '600' }">
              {{ getStatusText(review.status) }}
            </span>
            <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">
              {{ new Date(review.created_at).toLocaleDateString() }}
            </p>
          </div>
        </div>
        
        <div v-if="review.response_text" style="background: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
          <p style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">Institute Response:</p>
          <p style="color: #64748b;">{{ review.response_text }}</p>
        </div>
      </div>
    </div>
  </div>
</template> 