const Sequelize = require("sequelize")

const OrderItem = {
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
    priority: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: Sequelize.DataTypes.FLOAT,
    },
    items: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    exclude: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
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
module.exports = OrderItem
