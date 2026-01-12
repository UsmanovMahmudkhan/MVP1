'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'googleId', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('Users', 'githubId', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('Users', 'provider', {
            type: Sequelize.STRING,
            defaultValue: 'local'
        });

        await queryInterface.changeColumn('Users', 'password', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'googleId');
        await queryInterface.removeColumn('Users', 'githubId');
        await queryInterface.removeColumn('Users', 'provider');

        // Revert password to not null (might fail if there are null passwords)
        // For safety in dev, we might skip reverting this strict constraint or handle it carefully.
        // But for now, let's just try to revert it.
        await queryInterface.changeColumn('Users', 'password', {
            type: Sequelize.STRING,
            allowNull: false
        });
    }
};
