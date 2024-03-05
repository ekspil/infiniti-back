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
    description: {
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
    helpers: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    des_k: {
        type: Sequelize.DataTypes.FLOAT,
        field: "des_k"
    },
    des_p: {
        type: Sequelize.DataTypes.FLOAT,
        field: "des_p"
    },
    des_l: {
        type: Sequelize.DataTypes.FLOAT,
        field: "des_l"
    },
    des_c: {
        type: Sequelize.DataTypes.FLOAT,
        field: "des_c"
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
