'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      student_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      institute_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Institutes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add unique constraint to prevent duplicate favorites
    await queryInterface.addConstraint('Favorites', {
      fields: ['student_id', 'institute_id'],
      type: 'unique',
      name: 'unique_student_institute_favorite'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Favorites', ['student_id']);
    await queryInterface.addIndex('Favorites', ['institute_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Favorites');
  }
}; 