import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('./components/Home.vue')
const Login = () => import('./components/Login.vue')
const Register = () => import('./components/Register.vue')
const Dashboard = () => import('./components/Dashboard.vue')
const StudentSearch = () => import('./components/StudentSearch.vue')
const StudentReviews = () => import('./components/StudentReviews.vue')
const InstituteProfile = () => import('./components/InstituteProfile.vue')
const InstituteReviews = () => import('./components/InstituteReviews.vue')
const AdminInstitutes = () => import('./components/AdminInstitutes.vue')
const AdminReviews = () => import('./components/AdminReviews.vue')
const NotFound = { template: '<div class="p-8 text-center text-2xl">404 Not Found</div>' }

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/student/search', name: 'StudentSearch', component: StudentSearch },
  { path: '/student/reviews', name: 'StudentReviews', component: StudentReviews },
  { path: '/institute/profile', name: 'InstituteProfile', component: InstituteProfile },
  { path: '/institute/reviews', name: 'InstituteReviews', component: InstituteReviews },
  { path: '/admin/institutes', name: 'AdminInstitutes', component: AdminInstitutes },
  { path: '/admin/reviews', name: 'AdminReviews', component: AdminReviews },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 