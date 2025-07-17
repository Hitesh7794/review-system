const { Institute, Review } = require('../models');
const { geocodeAddress, validateCoordinates } = require('../services/geolocation.service');

exports.getInstituteProfile = async (req, res) => {
  try {
    const institute = await Institute.findOne({
      where: { created_by: req.user.id },
      include: [{ association: 'Creator', attributes: ['id', 'first_name', 'last_name', 'email'] }]
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute profile not found" });
    }
    
    res.json(institute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get institute profile" });
  }
};

exports.createInstituteProfile = async (req, res) => {
  try {
    // Only institute users can create profiles
    if (req.user.role !== 'institute') {
      return res.status(403).json({ 
        message: "Only institute accounts can create profiles. Nice try!" 
      });
    }
    
    // Check if user already has a profile
    const existingProfile = await Institute.findOne({ 
      where: { created_by: req.user.id } 
    });
    
    if (existingProfile) {
      return res.status(400).json({ 
        message: "You already have a profile. Try editing it instead!" 
      });
    }
    
    // Prepare institute data
    const instituteData = { ...req.body, created_by: req.user.id };
    
    // Require latitude and longitude
    if (!instituteData.latitude || !instituteData.longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required. Please use the 'Use My Location' button or enter coordinates manually."
      });
    }
    
    // If coordinates are not provided, geocode the address
    let geocodingWarning = null;
    if (!instituteData.latitude || !instituteData.longitude) {
      const address = `${instituteData.address_street}, ${instituteData.address_city}, ${instituteData.address_state}, ${instituteData.address_country}`;
      try {
        const coordinates = await geocodeAddress(address);
        if (coordinates && validateCoordinates(coordinates.latitude, coordinates.longitude)) {
          instituteData.latitude = coordinates.latitude;
          instituteData.longitude = coordinates.longitude;
        } else {
          // Set default coordinates if geocoding fails
          instituteData.latitude = null;
          instituteData.longitude = null;
          geocodingWarning = `Geocoding failed for address: ${address}`;
          console.warn(geocodingWarning);
        }
      } catch (error) {
        geocodingWarning = `Geocoding exception for address: ${address} - ${error.message}`;
        console.error(geocodingWarning);
        instituteData.latitude = null;
        instituteData.longitude = null;
      }
    } else {
      // Validate provided coordinates
      if (!validateCoordinates(instituteData.latitude, instituteData.longitude)) {
        return res.status(400).json({ 
          message: "Invalid coordinates provided. Please check latitude (-90 to 90) and longitude (-180 to 180)."
        });
      }
    }
    
    // Create profile (status defaults to PENDING)
    const institute = await Institute.create(instituteData);
    
    res.status(201).json({
      message: "Profile submitted for approval! Our admins will review it soon.",
      institute,
      geocodingWarning: geocodingWarning || undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile creation failed. Our paperwork got messy!" });
  }
};

exports.updateInstituteProfile = async (req, res) => {
  try {
    const instituteId = req.params.id;
    
    // Find institute
    const institute = await Institute.findOne({
      where: { 
        id: instituteId,
        created_by: req.user.id 
      }
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute profile not found" });
    }
    
    // Only allow updates if not rejected
    if (institute.status === 'REJECTED') {
      return res.status(403).json({ 
        message: "Cannot update rejected profile. Please contact support." 
      });
    }
    
    // Prepare update data
    const updatedData = { ...req.body };
    
    // If coordinates are not provided but address changed, geocode the new address
    let geocodingWarning = null;
    if ((!updatedData.latitude || !updatedData.longitude) && 
        (updatedData.address_street || updatedData.address_city || updatedData.address_state || updatedData.address_country)) {
      const address = `${updatedData.address_street || institute.address_street}, ${updatedData.address_city || institute.address_city}, ${updatedData.address_state || institute.address_state}, ${updatedData.address_country || institute.address_country}`;
      try {
        const coordinates = await geocodeAddress(address);
        if (coordinates && validateCoordinates(coordinates.latitude, coordinates.longitude)) {
          updatedData.latitude = coordinates.latitude;
          updatedData.longitude = coordinates.longitude;
        } else {
          geocodingWarning = `Geocoding failed for address: ${address}`;
          console.warn(geocodingWarning);
        }
      } catch (error) {
        geocodingWarning = `Geocoding exception for address: ${address} - ${error.message}`;
        console.error(geocodingWarning);
        // Keep existing coordinates if geocoding fails
      }
    } else if (updatedData.latitude && updatedData.longitude) {
      // Validate provided coordinates
      if (!validateCoordinates(updatedData.latitude, updatedData.longitude)) {
        return res.status(400).json({ 
          message: "Invalid coordinates provided. Please check latitude (-90 to 90) and longitude (-180 to 180)."
        });
      }
    }
    
    // Status reverts to PENDING if approved
    if (institute.status === 'APPROVED') {
      updatedData.status = 'PENDING';
    }
    
    await institute.update(updatedData);
    
    res.json({
      message: "Profile updated successfully!",
      institute,
      geocodingWarning: geocodingWarning || undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile update failed. Our architects are confused!" });
  }
};

exports.getInstituteReviews = async (req, res) => {
  try {
    // Find institute owned by user
    const institute = await Institute.findOne({
      where: { created_by: req.user.id }
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute profile not found" });
    }
    
    // Get all reviews (including pending)
    const reviews = await Review.findAll({
      where: { institute_id: institute.id },
      include: ['Student']
    });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get reviews. Our critics are on break!" });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response_text } = req.body;
    
    // Find review
    const review = await Review.findByPk(reviewId, {
      include: [{
        model: Institute,
        where: { created_by: req.user.id }
      }]
    });
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Only approved reviews can be responded to
    if (review.status !== 'APPROVED') {
      return res.status(403).json({ 
        message: "Can only respond to approved reviews. Patience!" 
      });
    }
    
    // Update response
    await review.update({
      response_text,
      response_by: req.user.id,
      response_at: new Date()
    });
    
    res.json({
      message: "Response added successfully!",
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to respond to review. Our typewriter jammed!" });
  }
};

exports.uploadInstituteImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // Return the public URL for the uploaded image
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
};