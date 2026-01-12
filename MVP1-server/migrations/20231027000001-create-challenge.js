'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Challenges', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            difficulty: {
                type: Sequelize.STRING,
                allowNull: false
            },
            language: {
                type: Sequelize.STRING,
                allowNull: false
            },
            template: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            testCases: {
                type: Sequelize.JSON,
                allowNull: false
            },
            createdByAI: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Challenges');
    }
};
