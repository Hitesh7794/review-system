<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const institutes = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  await loadPendingInstitutes()
})

const loadPendingInstitutes = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3366/api/admin/institutes/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
    institutes.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load pending institutes'
  } finally {
    loading.value = false
  }
}

const moderateInstitute = async (instituteId, status, rejectionReason = '') => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`http://localhost:3366/api/admin/institutes/${instituteId}/moderate`, {
      status,
      rejection_reason: rejectionReason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    message.value = response.data.message
    await loadPendingInstitutes() // Reload the list
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Moderation failed'
  }
}

const approveInstitute = (instituteId) => {
  moderateInstitute(instituteId, 'APPROVED')
}

const rejectInstitute = (instituteId) => {
  const reason = prompt('Please provide a reason for rejection:')
  if (reason !== null) {
    moderateInstitute(instituteId, 'REJECTED', reason)
  }
}
</script>

<template>
  <div class="card" style="max-width: 1000px;">
    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem; color: #1e293b;">Approve Institutes</h2>
    
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>
    
    <div v-if="loading" style="text-align: center; padding: 2rem;">
      <p>Loading pending institutes...</p>
    </div>
    
    <div v-else-if="institutes.length === 0" style="text-align: center; padding: 2rem;">
      <p style="color: #64748b;">No pending institutes to approve.</p>
    </div>
    
    <div v-else>
      <h3 style="margin-bottom: 1rem; color: #1e293b;">Pending Institutes ({{ institutes.length }})</h3>
      <div style="display: grid; gap: 1rem;">
        <div v-for="institute in institutes" :key="institute.id" 
             style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <h4 style="margin-bottom: 0.5rem; color: #1e293b;">{{ institute.name }}</h4>
              <p style="margin-bottom: 0.5rem; color: #64748b; font-size: 0.9rem;">{{ institute.description }}</p>
              <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b; flex-wrap: wrap;">
                <span>📧 {{ institute.contact_email }}</span>
                <span>📞 {{ institute.contact_phone }}</span>
                <span>🌐 {{ institute.website }}</span>
                <span>📍 {{ institute.address_city }}, {{ institute.address_state }}</span>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button @click="approveInstitute(institute.id)" class="button" style="background: #059669;">
                ✅ Approve
              </button>
              <button @click="rejectInstitute(institute.id)" class="button" style="background: #dc2626;">
                ❌ Reject
              </button>
            </div>
          </div>
          
          <div style="background: #f1f5f9; padding: 0.8rem; border-radius: 6px; font-size: 0.9rem;">
            <strong>Submitted by:</strong> {{ institute.Creator?.first_name }} {{ institute.Creator?.last_name }} 
            ({{ institute.Creator?.email }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 