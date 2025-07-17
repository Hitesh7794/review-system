<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const reviews = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  await loadPendingReviews()
})

const loadPendingReviews = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/admin/reviews/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
    reviews.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load pending reviews'
  } finally {
    loading.value = false
  }
}

const moderateReview = async (reviewId, status, rejectionReason = '') => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`http://localhost:3366/api/admin/reviews/${reviewId}/moderate`, {
      status,
      rejection_reason: rejectionReason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    message.value = response.data.message
    await loadPendingReviews() // Reload the list
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Moderation failed'
  }
}

const approveReview = (reviewId) => {
  moderateReview(reviewId, 'APPROVED')
}

const rejectReview = (reviewId) => {
  const reason = prompt('Please provide a reason for rejection:')
  if (reason !== null) {
    moderateReview(reviewId, 'REJECTED', reason)
  }
}
</script>

<template>
  <div class="card" style="max-width: 1000px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Moderate Reviews</h2>
    
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      <p>Loading pending reviews...</p>
    </div>
    
    <div v-else-if="reviews.length === 0" style="text-align: center; padding: 2rem;">
      <p style="color: #64748b;">No pending reviews to moderate.</p>
    </div>
    
    <div v-else>
      <h3 style="margin-bottom: 1rem; color: #1e293b;">Pending Reviews ({{ reviews.length }})</h3>
      <div style="display: grid; gap: 1rem;">
        <div v-for="review in reviews" :key="review.id" 
             style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="flex: 1;">
              <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 1.2rem;">{{ '⭐'.repeat(review.rating) }}</span>
                <span style="color: #64748b; font-size: 0.9rem;">{{ review.rating }}/5 stars</span>
                <span style="color: #d97706; font-weight: 600;">⏳ Pending Approval</span>
              </div>
              
              <h4 style="margin-bottom: 0.5rem; color: #1e293b;">{{ review.Institute?.name }}</h4>
              <p v-if="review.title" style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">{{ review.title }}</p>
              <p style="color: #64748b; line-height: 1.6; margin-bottom: 0.5rem;">{{ review.body }}</p>
              
              <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b;">
                <span>👤 By {{ review.Student?.first_name }} {{ review.Student?.last_name }}</span>
                <span>📅 {{ new Date(review.created_at).toLocaleDateString() }}</span>
                <span>📧 {{ review.Student?.email }}</span>
              </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <button @click="approveReview(review.id)" class="button" style="background: #059669;">
                ✅ Approve
              </button>
              <button @click="rejectReview(review.id)" class="button" style="background: #dc2626;">
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 