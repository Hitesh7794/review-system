module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'institute_id']
      }
    ]
  });

  Favorite.associate = models => {
    Favorite.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'Student'
    });
    Favorite.belongsTo(models.Institute, {
      foreignKey: 'institute_id'
    });
  };

  return Favorite;
};