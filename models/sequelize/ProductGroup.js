const Sequelize = require("sequelize")

const Product = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },

    corner: {
        type: Sequelize.DataTypes.STRING,
    },
    priority: {
        type: Sequelize.DataTypes.INTEGER,
    },
    img: {
        type: Sequelize.DataTypes.STRING,
    },
    createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        unique: false,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        unique: false,
        field: "updated_at"
    }
}
module.exports = Product
