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
    type: {
        type: Sequelize.DataTypes.STRING
    },
    atolLogin: {
        type: Sequelize.DataTypes.STRING,
        field: "atol_login"
    },
    kioskImg: {
        type: Sequelize.DataTypes.STRING,
        field: "kiosk_img"
    },
    atolPassword: {
        type: Sequelize.DataTypes.STRING,
        field: "atol_password"
    },
    iikoTerminalGroupId: {
        type: Sequelize.DataTypes.STRING,
        field: "iiko_terminal_group_id"
    },
    iikoOrganizationId: {
        type: Sequelize.DataTypes.STRING,
        field: "iiko_organization_id"
    },
    atolGroup: {
        type: Sequelize.DataTypes.STRING,
        field: "atol_group"
    },
    atolInn: {
        type: Sequelize.DataTypes.STRING,
        field: "atol_inn"
    },
    stops: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    lock: {
        type: Sequelize.DataTypes.BOOLEAN
    },
    vip: {
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
