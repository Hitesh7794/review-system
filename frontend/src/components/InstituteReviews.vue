<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const reviews = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const respondingTo = ref(null)
const responseText = ref('')

onMounted(async () => {
  await loadReviews()
})

const loadReviews = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/institute/reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })
    reviews.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load reviews'
  } finally {
    loading.value = false
  }
}

const respondToReview = async (reviewId) => {
  if (!responseText.value.trim()) {
    error.value = 'Please enter a response'
    return
  }
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(`http://localhost:3366/api/institute/reviews/${reviewId}/respond`, {
      response_text: responseText.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    message.value = response.data.message
    responseText.value = ''
    respondingTo.value = null
    await loadReviews()
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to respond to review'
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

const canRespond = (review) => {
  return review.status === 'APPROVED' && !review.response_text
}
</script>

<template>
  <div class="card" style="max-width: 900px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Institute Reviews</h2>
    
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h3 style="color: #1e293b;">Reviews ({{ reviews.length }})</h3>
      <div style="display: flex; gap: 0.5rem; font-size: 0.9rem; color: #64748b;">
        <span>✅ {{ reviews.filter(r => r.status === 'APPROVED').length }} Approved</span>
        <span>⏳ {{ reviews.filter(r => r.status === 'PENDING').length }} Pending</span>
        <span>❌ {{ reviews.filter(r => r.status === 'REJECTED').length }} Rejected</span>
      </div>
    </div>
    
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      <p>Loading reviews...</p>
    </div>
    
    <div v-else-if="reviews.length === 0" style="text-align: center; padding: 2rem;">
      <p style="color: #64748b;">No reviews yet for your institute.</p>
    </div>
    
    <div v-else style="display: grid; gap: 1rem;">
      <div v-for="review in reviews" :key="review.id" 
           style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 1.2rem;">{{ '⭐'.repeat(review.rating) }}</span>
              <span style="color: #64748b; font-size: 0.9rem;">{{ review.rating }}/5 stars</span>
              <span :style="{ color: getStatusColor(review.status), fontWeight: '600' }">
                {{ getStatusText(review.status) }}
              </span>
            </div>
            <p v-if="review.title" style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">{{ review.title }}</p>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 0.5rem;">{{ review.body }}</p>
            <p style="font-size: 0.8rem; color: #64748b;">
              By {{ review.Student?.first_name }} {{ review.Student?.last_name }} on {{ new Date(review.created_at).toLocaleDateString() }}
            </p>
          </div>
        </div>
        
        <!-- Institute Response -->
        <div v-if="review.response_text" style="background: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
          <p style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">Your Response:</p>
          <p style="color: #64748b;">{{ review.response_text }}</p>
          <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">
            Responded on {{ new Date(review.response_at).toLocaleDateString() }}
          </p>
        </div>
        
        <!-- Response Form -->
        <div v-if="canRespond(review)" style="margin-top: 1rem;">
          <div v-if="respondingTo === review.id" style="background: #f1f5f9; padding: 1rem; border-radius: 6px;">
            <h4 style="margin-bottom: 1rem; color: #1e293b;">Respond to Review</h4>
            <textarea v-model="responseText" rows="3" placeholder="Write your response..." style="width: 100%; margin-bottom: 1rem;"></textarea>
            <div style="display: flex; gap: 0.5rem;">
              <button @click="respondToReview(review.id)" class="button" :disabled="loading">
                {{ loading ? 'Sending...' : 'Send Response' }}
              </button>
              <button @click="respondingTo = null; responseText = ''" class="button secondary">Cancel</button>
            </div>
          </div>
          <button v-else @click="respondingTo = review.id" class="button" style="background: #059669;">
            💬 Respond to Review
          </button>
        </div>
        
        <div v-else-if="review.status === 'PENDING'" style="margin-top: 1rem;">
          <p style="color: #d97706; font-size: 0.9rem;">⏳ This review is pending admin approval</p>
        </div>
        
        <div v-else-if="review.status === 'REJECTED'" style="margin-top: 1rem;">
          <p style="color: #dc2626; font-size: 0.9rem;">❌ This review was rejected by admin</p>
        </div>
      </div>
    </div>
  </div>
</template> 