'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Challenge extends Model {
        static associate(models) {
            // define association here
        }
    }
    Challenge.init({
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        difficulty: DataTypes.STRING,
        language: DataTypes.STRING,
        template: DataTypes.TEXT,
        testCases: DataTypes.JSON,
        topic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdByAI: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Challenge',
    });
    return Challenge;
};
