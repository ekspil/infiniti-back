const Sequelize = require("sequelize")

const BankSettings = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    kioskId: {
        type: Sequelize.DataTypes.STRING,
        field: "kiosk_id"
    },
    token: {
        type: Sequelize.DataTypes.STRING
    },
    entity: {
        type: Sequelize.DataTypes.STRING
    },
    account: {
        type: Sequelize.DataTypes.STRING
    },
    merchant: {
        type: Sequelize.DataTypes.STRING
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
module.exports = BankSettings
