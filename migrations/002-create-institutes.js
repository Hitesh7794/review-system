'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Institutes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      category: {
        type: Sequelize.ENUM('engineering','medical','arts','commerce','science','law','management','other'),
        defaultValue: 'other'
      },
      contact_email: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING(20)
      },
      website: {
        type: Sequelize.STRING
      },
      address_street: {
        type: Sequelize.STRING
      },
      address_city: {
        type: Sequelize.STRING(100)
      },
      address_state: {
        type: Sequelize.STRING(100)
      },
      address_country: {
        type: Sequelize.STRING(100)
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8)
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8)
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING','APPROVED','REJECTED'),
        defaultValue: 'PENDING'
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Institutes', ['status']);
    await queryInterface.addIndex('Institutes', ['address_city']);
    await queryInterface.addIndex('Institutes', ['latitude', 'longitude']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Institutes');
  }
}; 