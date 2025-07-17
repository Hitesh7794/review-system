module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: { 
            type: DataTypes.STRING, 
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: DataTypes.STRING(100),
        role: {
            type: DataTypes.ENUM('student', 'institute', 'admin'),
            defaultValue: 'student'
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        home_latitude: DataTypes.DECIMAL(10, 8),
        home_longitude: DataTypes.DECIMAL(11, 8)
    }, {
        hooks: {
            beforeCreate: user => {
                user.email = user.email.toLowerCase();
            }
        }
    });

    User.associate = models => {
        User.hasMany(models.Institute, { as: 'CreatedInstitutes', foreignKey: 'created_by' });
        User.hasMany(models.Review, { as: 'StudentReviews', foreignKey: 'student_id' });
        User.hasMany(models.Review, { as: 'InstituteResponses', foreignKey: 'response_by' });
        User.hasMany(models.Favorite, { foreignKey: 'student_id' });
    };

    return User;
};


