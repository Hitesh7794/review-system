const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/institute.controller');
const { jwtAuth } = require('../middleware/auth.jwt');
const allowedRoles = require('../middleware/role.check');
const multer = require('multer');
const path = require('path');

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Apply JWT auth to all institute routes
router.use(jwtAuth, allowedRoles(['institute']));

// Profile management
router.get('/profile', instituteController.getInstituteProfile);
router.post('/profile', instituteController.createInstituteProfile);
router.put('/profile/:id', instituteController.updateInstituteProfile);

// Review management
router.get('/reviews', instituteController.getInstituteReviews);
router.post('/reviews/:reviewId/respond', instituteController.respondToReview);

// Image upload endpoint
router.post('/upload-image', jwtAuth, allowedRoles(['institute']), upload.single('image'), instituteController.uploadInstituteImage);

module.exports = router;