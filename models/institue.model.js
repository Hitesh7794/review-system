module.exports = (sequelize, DataTypes) => {
  const Institute = sequelize.define('Institute', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    category: {
      type: DataTypes.ENUM(
        'engineering','medical','arts','commerce',
        'science','law','management','other'
      ),
      defaultValue: 'other'
    },
    contact_email: DataTypes.STRING,
    contact_phone: DataTypes.STRING(20),
    website: DataTypes.STRING,
    address_street: DataTypes.STRING,
    address_city: DataTypes.STRING(100),
    address_state: DataTypes.STRING(100),
    address_country: DataTypes.STRING(100),
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING','APPROVED','REJECTED'),
      defaultValue: 'PENDING'
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    rejection_reason: DataTypes.TEXT
  }, {
    indexes: [
      // For geosearch performance
      { 
        name: 'geo_index',
        fields: [sequelize.literal('(latitude, longitude)')] 
      },
      // For area-based search
      {
        name: 'city_index',
        fields: ['address_city']
      },
      // For status filtering
      {
        name: 'status_index',
        fields: ['status']
      }
    ]
  });
  
  Institute.associate = models => {
    Institute.belongsTo(models.User, { as: 'Creator', foreignKey: 'created_by' });
    Institute.hasMany(models.Review, { foreignKey: 'institute_id' });
    Institute.hasMany(models.Favorite, { foreignKey: 'institute_id' });
  };
  
  return Institute;
};