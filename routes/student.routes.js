const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { jwtAuth } = require('../middleware/auth.jwt');
const allowedRoles = require('../middleware/role.check');

// Apply JWT auth to all student routes
router.use(jwtAuth, allowedRoles(['student']));

// Profile routes
router.get('/profile', studentController.getStudentProfile);
router.put('/profile', studentController.updateStudentProfile);

// Institute search
router.get('/institutes/search', studentController.searchInstitutes);
router.get('/institutes/:id', studentController.getInstituteDetails);

// Review management
router.get('/reviews', studentController.getStudentReviews);
router.post('/reviews', studentController.createReview);
router.put('/reviews/:id', studentController.updateReview);

// Favorites
router.post('/favorites/:instituteId', studentController.toggleFavorite);
router.get('/favorites', studentController.getFavorites);

module.exports = router;