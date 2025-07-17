const { User, Institute, Review } = require('../models');
const emailService = require('../services/email.services');

exports.getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.findAll({
      where: { status: 'PENDING' },
      include: ['Creator']
    });
    
    res.json(institutes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending institutes. Our inbox is full!" });
  }
};

exports.moderateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    // Find institute
    const institute = await Institute.findByPk(id, {
      include: ['Creator']
    });
    
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }
    
    // Update status
    await institute.update({
      status,
      rejection_reason: status === 'REJECTED' ? rejection_reason : null
    });
    
    // Send notification email
    if (institute.Creator) {
      await emailService.sendInstituteApproval(
        institute.Creator.email, 
        status === 'APPROVED'
      );
    }
    
    res.json({
      message: `Institute ${status.toLowerCase()} successfully!`,
      institute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Institute moderation failed. Our gavel broke!" });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { status: 'PENDING' },
      include: ['Student', 'Institute']
    });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending reviews. Our reading glasses broke!" });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    // Find review
    const review = await Review.findByPk(id, {
      include: ['Student']
    });
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Update status
    await review.update({
      status,
      rejection_reason: status === 'REJECTED' ? rejection_reason : null
    });
    
    res.json({
      message: `Review ${status.toLowerCase()} successfully!`,
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Review moderation failed. Our editor quit!" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users. Our directory burned down!" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['student', 'institute', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    
    // Find user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent self-demotion
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(403).json({ 
        message: "You can't remove your own admin privileges! Sneaky!" 
      });
    }
    
    // Update role
    await user.update({ role });
    
    res.json({
      message: "User role updated successfully!",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user role. Our crown slipped!" });
  }
};