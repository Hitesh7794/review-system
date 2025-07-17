<script setup>
import { ref } from 'vue'
import axios from 'axios'

const searchMode = ref('area')
const searchQuery = ref('')
const institutes = ref([])
const loading = ref(false)
const error = ref('')
const showReviewForm = ref(false)
const selectedInstitute = ref(null)
const reviewLoading = ref(false)
const reviewError = ref('')
const reviewMessage = ref('')
const newReview = ref({
  institute_id: '',
  rating: 5,
  title: '',
  body: ''
})

const searchInstitutes = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const params = {
      mode: searchMode.value,
      area: searchQuery.value
    }
    
    if (searchMode.value === 'nearby') {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          params.lat = position.coords.latitude
          params.lon = position.coords.longitude
          params.radius = 5
          
          const response = await axios.get('http://localhost:3366/api/student/institutes/search', {
            headers: { Authorization: `Bearer ${token}` },
            params
          })
          institutes.value = response.data
          loading.value = false
        }, () => {
          error.value = 'Unable to get your location. Please use area search instead.'
          loading.value = false
        })
        return
      } else {
        error.value = 'Geolocation not supported. Please use area search.'
        loading.value = false
        return
      }
    }
    
    const response = await axios.get('http://localhost:3366/api/student/institutes/search', {
      headers: { Authorization: `Bearer ${token}` },
      params
    })
    institutes.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

const openReviewForm = (institute) => {
  selectedInstitute.value = institute
  newReview.value = {
    institute_id: institute.id,
    rating: 5,
    title: '',
    body: ''
  }
  reviewError.value = ''
  reviewMessage.value = ''
  showReviewForm.value = true
}

const closeReviewForm = () => {
  showReviewForm.value = false
  selectedInstitute.value = null
}

const submitReview = async () => {
  reviewLoading.value = true
  reviewError.value = ''
  reviewMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('http://localhost:3366/api/student/reviews', newReview.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    reviewMessage.value = response.data.message || 'Review submitted!'
    setTimeout(() => {
      reviewMessage.value = ''
      closeReviewForm()
    }, 1500)
  } catch (err) {
    reviewError.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    reviewLoading.value = false
  }
}
</script>

<template>
  <div class="card" style="max-width: 800px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Search Institutes</h2>
    
    <div v-if="error" class="alert error">{{ error }}</div>
    
    <form @submit.prevent="searchInstitutes" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label>Search Mode</label>
          <select v-model="searchMode">
            <option value="area">By Area/City</option>
            <option value="nearby">Nearby (GPS)</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label>{{ searchMode === 'area' ? 'City/Area' : 'Search Radius (km)' }}</label>
          <input v-model="searchQuery" :placeholder="searchMode === 'area' ? 'Enter city name...' : '5'" />
        </div>
      </div>
      <button type="submit" class="button" :disabled="loading">
        {{ loading ? 'Searching...' : 'Search Institutes' }}
      </button>
    </form>
    
    <div v-if="institutes.length > 0">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">Found {{ institutes.length }} Institutes</h3>
      <div style="display: grid; gap: 1rem;">
        <div v-for="institute in institutes" :key="institute.id" 
             style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: #f8fafc; cursor: pointer;"
             @click="openReviewForm(institute)">
          <h4 style="margin-bottom: 0.5rem; color: #1e293b;">{{ institute.name }}</h4>
          <p style="margin-bottom: 0.5rem; color: #64748b; font-size: 0.9rem;">{{ institute.description }}</p>
          <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b;">
            <span>📍 {{ institute.address_city }}, {{ institute.address_state }}</span>
            <span>📞 {{ institute.contact_phone }}</span>
            <span>🌐 {{ institute.website }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="!loading && institutes.length === 0 && searchQuery">
      <p style="text-align: center; color: #64748b;">No institutes found. Try a different search.</p>
    </div>
  </div>

<!-- Review Modal -->
<div v-if="showReviewForm" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(30,41,59,0.25); z-index: 1000; display: flex; align-items: center; justify-content: center;">
  <div style="background: #fff; border-radius: 12px; max-width: 420px; width: 100%; padding: 2rem; box-shadow: 0 4px 32px rgba(0,0,0,0.12); position: relative;">
    <button @click="closeReviewForm" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
    <h3 style="margin-bottom: 1rem; color: #1e293b;">Review {{ selectedInstitute?.name }}</h3>
    <form @submit.prevent="submitReview">
      <div style="margin-bottom: 1rem;">
        <label>Rating</label>
        <select v-model="newReview.rating" required style="width: 100%;">
          <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
          <option value="4">⭐⭐⭐⭐ (4 stars)</option>
          <option value="3">⭐⭐⭐ (3 stars)</option>
          <option value="2">⭐⭐ (2 stars)</option>
          <option value="1">⭐ (1 star)</option>
        </select>
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Title (optional)</label>
        <input v-model="newReview.title" type="text" placeholder="Review title..." style="width: 100%;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Review</label>
        <textarea v-model="newReview.body" rows="4" placeholder="Share your experience..." required style="width: 100%;"></textarea>
      </div>
      <div v-if="reviewError" class="alert error" style="margin-bottom: 1rem;">{{ reviewError }}</div>
      <div v-if="reviewMessage" class="alert success" style="margin-bottom: 1rem;">{{ reviewMessage }}</div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="submit" class="button" :disabled="reviewLoading">
          {{ reviewLoading ? 'Submitting...' : 'Submit Review' }}
        </button>
        <button type="button" @click="closeReviewForm" class="button secondary">Cancel</button>
      </div>
    </form>
  </div>
</div>
</template> 