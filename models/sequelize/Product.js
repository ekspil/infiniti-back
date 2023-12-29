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
    code: {
        type: Sequelize.DataTypes.STRING,
    },
    codeIiko: {
        type: Sequelize.DataTypes.STRING,
        field: "code_iiko"
    },
    corner: {
        type: Sequelize.DataTypes.STRING,
    },
    img: {
        type: Sequelize.DataTypes.STRING,
    },
    price: {
        type: Sequelize.DataTypes.FLOAT,
    },
    priceVip: {
        type: Sequelize.DataTypes.FLOAT,
        field: "price_vip"
    },
    items: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    mods: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    groups: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    station: {
        type: Sequelize.DataTypes.INTEGER,
    },
    priority: {
        type: Sequelize.DataTypes.INTEGER,
    },
    archive: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    hidden: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    blocked: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    coupon: {
        type: Sequelize.DataTypes.STRING,
    },
    couponPrice: {
        type: Sequelize.DataTypes.FLOAT,
        field: "coupon_price"
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
