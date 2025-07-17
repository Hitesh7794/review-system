module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 } // 5-star rating system
    },
    title: DataTypes.STRING(255),
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING','APPROVED','REJECTED'),
      defaultValue: 'PENDING'
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    institute_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    response_text: DataTypes.TEXT,
    response_by: DataTypes.BIGINT,
    response_at: DataTypes.DATE
  });
  
  Review.associate = models => {
    Review.belongsTo(models.User, { as: 'Student', foreignKey: 'student_id' });
    Review.belongsTo(models.Institute, { foreignKey: 'institute_id' });
    Review.belongsTo(models.User, { as: 'Responder', foreignKey: 'response_by' });
  };
  
  return Review;
};