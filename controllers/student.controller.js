const { User, Institute, Review, Favorite } = require('../models');
const { Op } = require('sequelize');
const { haversineDistance, findNearby } = require('../services/geolocation.service');

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: "Student profile not found. Are you lost?" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get profile. Our detectives are confused!" });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { first_name, last_name, home_latitude, home_longitude } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    await user.update({
      first_name,
      last_name,
      home_latitude,
      home_longitude
    });
    
    res.json({
      message: "Profile updated successfully! Looking good! 😎",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        home_latitude: user.home_latitude,
        home_longitude: user.home_longitude
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile update failed. Our stylists are on break!" });
  }
};

// Search institutes
exports.searchInstitutes = async (req, res) => {
  try {
    const { mode, area, lat, lon, radius = 5 } = req.query;
    console.log('[searchInstitutes] Query params:', req.query);

    if (!mode) {
      console.warn('[searchInstitutes] Missing search mode');
      return res.status(400).json({ message: "Missing search mode." });
    }

    let results = [];

    if (mode === 'area') {
      if (!area || area.trim() === '') {
        console.warn('[searchInstitutes] Area is required for area search');
        return res.status(400).json({ message: "Area is required for area search." });
      }
      const { sequelize } = require('../models');
      console.log('[searchInstitutes] Executing SQL for area:', area);
      const rows = await sequelize.query(`
        SELECT i.*, r.id as review_id, r.rating, r.title, r.body, r.status as review_status
        FROM Institutes i
        LEFT JOIN Reviews r ON i.id = r.institute_id AND r.status = 'APPROVED'
        WHERE i.status = 'APPROVED' AND i.address_city LIKE ?
      `, {
        replacements: [`%${area}%`],
        type: sequelize.QueryTypes.SELECT
      });
      console.log('[searchInstitutes] SQL rows:', Array.isArray(rows) ? rows.length : 'not array');

      // Group results by institute
      const institutes = {};
      if (Array.isArray(rows)) {
        rows.forEach(row => {
          if (!institutes[row.id]) {
            institutes[row.id] = {
              id: row.id,
              name: row.name,
              description: row.description,
              category: row.category,
              contact_email: row.contact_email,
              contact_phone: row.contact_phone,
              website: row.website,
              address_street: row.address_street,
              address_city: row.address_city,
              address_state: row.address_state,
              address_country: row.address_country,
              latitude: row.latitude,
              longitude: row.longitude,
              status: row.status,
              created_by: row.created_by,
              rejection_reason: row.rejection_reason,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              Reviews: []
            };
          }
          if (row.review_id) {
            institutes[row.id].Reviews.push({
              id: row.review_id,
              rating: row.rating,
              title: row.title,
              body: row.body,
              status: row.review_status
            });
          }
        });
      }
      results = Object.values(institutes);
      console.log('[searchInstitutes] Institutes found:', results.length);
    } else if (mode === 'nearby' && lat && lon) {
      console.log('[searchInstitutes] Running findNearby with:', lat, lon, radius);
      results = await findNearby(parseFloat(lat), parseFloat(lon), radius);
      console.log('[searchInstitutes] Nearby results:', results.length);
    } else {
      console.warn('[searchInstitutes] Invalid search mode or missing parameters');
      return res.status(400).json({ message: "Invalid search mode or missing parameters." });
    }

    // Sort by proximity if geolocation available
    if (lat && lon && results.length > 0) {
      results.sort((a, b) => {
        const distA = haversineDistance(lat, lon, a.latitude, a.longitude);
        const distB = haversineDistance(lat, lon, b.latitude, b.longitude);
        return distA - distB;
      });
      console.log('[searchInstitutes] Results sorted by proximity');
    }

    res.json(results);
  } catch (error) {
    console.error('[searchInstitutes] Institute search failed:', error);
    res.status(500).json({ message: "Institute search failed. Maybe they're hiding? 🕵️" });
  }
};

// Get institute details
exports.getInstituteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const institute = await Institute.findOne({
      where: { 
        id,
        status: 'APPROVED'
      },
      include: [{
        model: Review,
        where: { status: 'APPROVED' },
        required: false,
        include: [{
          model: User,
          as: 'Student',
          attributes: ['first_name', 'last_name']
        }]
      }]
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute not found or not approved yet!" });
    }
    
    res.json(institute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get institute details. Our tour guide got lost!" });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { institute_id, rating, title, body } = req.body;
    
    // Check if student already reviewed this institute
    const existingReview = await Review.findOne({
      where: { 
        student_id: req.user.id,
        institute_id
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ message: "You've already reviewed this institute! One review per institute, please! 😅" });
    }
    
    const review = await Review.create({
      institute_id,
      rating,
      title,
      body,
      student_id: req.user.id,
      status: 'PENDING' // Requires admin approval
    });
    
    res.status(201).json({
      message: "Review submitted successfully! Our moderators will review it soon.",
      review
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Review rejected by the grammar police! 📝" });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, body } = req.body;
    
    const review = await Review.findOne({
      where: { 
        id,
        student_id: req.user.id
      }
    });
    
    if (!review) {
      return res.status(404).json({ message: "Review not found or you don't own it!" });
    }
    
    // Only allow updates if review is pending
    if (review.status !== 'PENDING') {
      return res.status(403).json({ message: "Can only update pending reviews. Once approved, no changes allowed!" });
    }
    
    await review.update({
      rating,
      title,
      body,
      status: 'PENDING' // Reset to pending for admin review
    });
    
    res.json({
      message: "Review updated successfully! Back to moderation queue it goes! 🔄",
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update review. Our editors are confused!" });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { instituteId } = req.params;
    
    // Check if institute exists and is approved
    const institute = await Institute.findOne({
      where: { 
        id: instituteId,
        status: 'APPROVED'
      }
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute not found or not approved!" });
    }
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: {
        student_id: req.user.id,
        institute_id: instituteId
      }
    });
    
    if (existingFavorite) {
      // Remove from favorites
      await existingFavorite.destroy();
      res.json({ message: "Removed from favorites! 💔", favorited: false });
    } else {
      // Add to favorites
      await Favorite.create({
        student_id: req.user.id,
        institute_id: instituteId
      });
      res.json({ message: "Added to favorites! ❤️", favorited: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle favorite. Our heart is broken!" });
  }
};

// Get student reviews
exports.getStudentReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: Institute,
        attributes: ['name']
      }]
    });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get reviews. Our critics are on break!" });
  }
};

// Get favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: Institute,
        where: { status: 'APPROVED' },
        include: [{
          model: Review,
          where: { status: 'APPROVED' },
          required: false
        }]
      }]
    });
    
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get favorites. Our collection got lost!" });
  }
};