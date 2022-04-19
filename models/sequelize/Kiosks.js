const Sequelize = require("sequelize")

const Kiosks = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.DataTypes.STRING
    },
    name: {
        type: Sequelize.DataTypes.STRING
    },
    gate: {
        type: Sequelize.DataTypes.STRING
    },
    key: {
        type: Sequelize.DataTypes.STRING
    },
    lock: {
        type: Sequelize.DataTypes.BOOLEAN
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
module.exports = Kiosks
