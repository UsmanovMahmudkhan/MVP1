'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Submission extends Model {
        static associate(models) {
            Submission.belongsTo(models.User, { foreignKey: 'userId' });
            Submission.belongsTo(models.Challenge, { foreignKey: 'challengeId' });
        }
    }
    Submission.init({
        userId: DataTypes.INTEGER,
        challengeId: DataTypes.INTEGER,
        code: DataTypes.TEXT,
        language: DataTypes.STRING,
        status: DataTypes.STRING, // 'pending', 'passed', 'failed', 'error'
        output: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'Submission',
    });
    return Submission;
};
