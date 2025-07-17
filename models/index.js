const { Sequelize } = require('sequelize');
const config = require('../config/config.js');
const db = require('../config/db.js');

// Import models
const User = require('./user.model.js')(db, Sequelize.DataTypes);
const Institute = require('./institue.model.js')(db, Sequelize.DataTypes);
const Review = require('./review.model.js')(db, Sequelize.DataTypes);
const Favorite = require('./favorite.model.js')(db, Sequelize.DataTypes);

// Set up associations
Object.values({ User, Institute, Review, Favorite }).forEach(model => {
  if (model.associate) {
    model.associate({ User, Institute, Review, Favorite });
  }
});

module.exports = {
  User,
  Institute,
  Review,
  Favorite,
  sequelize: db
}; 