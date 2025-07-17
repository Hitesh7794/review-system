const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { jwtAuth } = require('../middleware/auth.jwt');
const allowedRoles = require('../middleware/role.check');

// Apply JWT auth and admin role check to all routes
router.use(jwtAuth, allowedRoles(['admin']));

// Institute moderation
router.get('/institutes/pending', adminController.getPendingInstitutes);
router.patch('/institutes/:id/moderate', adminController.moderateInstitute);
router.put('/institutes/:id/moderate', adminController.moderateInstitute); // Add PUT support

// Review moderation
router.get('/reviews/pending', adminController.getPendingReviews);
router.patch('/reviews/:id/moderate', adminController.moderateReview);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;