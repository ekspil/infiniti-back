'use strict'
require("dotenv").config()
const path = require('path')
const AutoLoad = require('fastify-autoload')
const Sequelize = require("sequelize")
const fetch = require("node-fetch")
const cron = require("node-cron")
var log4js = require("log4js");

log4js.configure({
  appenders: {
    yandexCloudLogging: {
      type: 'log4js-node-yandex-cloud-logging',
      serviceAccountID: "ajebmltab4uj5cavgh7k",
      keyID: "ajes52h9hhba5fps387m",
      keyData: `-----BEGIN PRIVATE KEY-----
${process.env.LOGER_PK_1}
KObzTBkM6x/IKPtr2JB4X9KyLek7uQCnVFJSia7PuHXBQGsBc3GvNzqX7931BXwE
CuQGGzE3uJn9uaOvbczPVLUCRj77xYtYSTeOb8Xx6C2rK/RXLUVn+aocHHGtF2GG
6RLiWVVuyZBZ6HKAoKTRXHBaLkSZmaE6fpKRo+t/MRq/oWsgrqJsukQvnX6PJr0Y
PHHIoyT0e3+5odk3F7I/MJjYiAw7a6vn2swKCTkN7H4bJWzA7r17PddykHYcXVcP
w8r5H/ObSrs+lb9dnKG6BTGtcOrnPgZm7BXvc25WzilVAm4Hk1zDaVr6TtKHQipC
5IJoW311AgMBAAECggEAAQa2pu5vLXWPB7mrkku4z27OsAKyvDib2lGP5vBWhRPq
wimDYi0QbwgJvXHPfITRq6o1ieJauIoAAbmz7jn50lLrbbNGOWaKjUvqyhfdpdOG
BgkJBaYnH5s7avO07WLIjmZiX0udqM1UZKNXdM/HEwr6tmwsiy9JdJhLQ0/U/rBU
GiNd7Pgg6QTm3OFuVTvb3ILQNmCws6YWt8+KeADS3KL0+aqL1qanLG/sj4WS8ur5
gA0SqLE5HgJxe2g2GhnkrwTvAacmqn9KM/LYnNr+TOpsMuP9XrTBFh1lk7XTAh3E
Qkb/4k+O0VHnLWfoICnrxbZcca19wOxgjvYYzw4aSQKBgQDZyUlQ7J5LSzFrELqV
/k9CJ2wODi+14gGOui6PBFBjvlf1r9hVUmQnBlVgUGr5+Jdd+6kwiPQn9a5gOWWs
Dp2KX9ktlh/EyagJXUAppPqv3Zb8WefOcNoGmRPuHBQC6Gv+kJKFqJVIHf/IK+ve
U/+Ku37HgIcvLqztk+Lg56+VfQKBgQDcU7D+/bVI5o9IykbNpkG3EHxXcwbJlwe2
0YMO5mw1tkmZNlMCAvueq1Xr/WOnqLL8QIQUSvt4vKzRRLpDdJVFeJ4aFXdzzjb0
u4d8uI0h3rv8LrC/qEPKEeriYiqtJXwMCkdtBLRxw9/CqSX4pWAzycv009KbKdXr
PVbWCvWpWQKBgHgllp/hWdaZ7fJt8TGscZdCXldGtkV2IHvX9LWLoLnWGXp9/y/a
20u4L8OJueqbnQ4JNyaCd4fP/tow8AlCquDazdpbVr1erqgz3KDc1jvNWG1xP/Pg
yDcZnigfL18HUATJRzwba/e0LRcGPAKUfobPtzpiirGZ42bRzjlbN7+VAoGBAKGn
0kS1N87eQ6EfsOVwp+S+dsze+8rrQmCzxlonXJvoPIXqourl72JSyf8VconwMCr+
1yngfjPvE0mUCKo3ntJTFoWC3JseYZodAeLTsdF5ECqOw2ZL+jkH/nPNnQxfZW2c
GR33BsI1+jZkTxTpmfVFiZz/0hXAk1E/Nzhi4C45AoGBAL6BY9ZyhG9qmLMTwzfV
1bTGjBQAeXeFhLwcKipt7TM6rNTzcCrx82RQb7VWesZAh367qMMd3a1A1IQYUo5W
LDtOfmnqPvXKaRp3kKQDtVBPv5vh13XTtcFMkPKMOgjT9wXB253Viv2VnNsP3nx3
vAwvjzydLj6XIiB/Oqjp5GQv
-----END PRIVATE KEY-----`,
      destination: "e23jpinfkns8ss35irto"
    }
  },
  categories: {
    default: { appenders: ['yandexCloudLogging'], level: 'info' }
  }
});

const logger = log4js.getLogger();

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  const sequelizeOptions = {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    ssl: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false // <<<<<<< YOU NEED THIS
      }
    },
    port: process.env.POSTGRES_PORT,
    logging: !!Number(process.env.SQL_LOGS)
  }
  const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, sequelizeOptions)

  const User = require("./models/sequelize/User")
  const Smena = require("./models/sequelize/Smena")
  const Product = require("./models/sequelize/Product")
  const Item = require("./models/sequelize/Item")
  const ProductGroup = require("./models/sequelize/ProductGroup")
  const Stat = require("./models/sequelize/Statistic")
  const Orders = require("./models/sequelize/Orders")
  const Timers = require("./models/sequelize/Timers")
  const OrderItems = require("./models/sequelize/OrderItems")
  const ProductMods = require("./models/sequelize/ProductMods")
  const Corners = require("./models/sequelize/Corners")
  const Kiosks = require("./models/sequelize/Kiosks")
  const BankSettings = require("./models/sequelize/BankSettings")
  const Helpers = require("./models/sequelize/Helpers")
  global.Orders = []
  global.KassaOrders = []
  global.Products = []
  global.Items = []
  global.K = 1

  global.Commands = new Map()
  global.Users = new Map()
  global.Kiosks = new Map()

  global.iikoToken = ""



  const UserModel = sequelize.define("users", User)
  const SmenaModel = sequelize.define("smenas", Smena)
  const ProductModel = sequelize.define("products", Product)
  const ItemModel = sequelize.define("items", Item)
  const TimerModel = sequelize.define("timers", Timers)
  const ProductGroupModel = sequelize.define("product_groups", ProductGroup)
  const StatModel = sequelize.define("statistics", Stat)
  const OrderModel = sequelize.define("orders", Orders)
  const OrderItemsModel = sequelize.define("order_items", OrderItems)
  const ProductModModel = sequelize.define("product_mods", ProductMods)
  const CornerModel = sequelize.define("corners", Corners)
  const KioskModel = sequelize.define("kiosks", Kiosks)
  const BankSettingsModel = sequelize.define("bank_settings", BankSettings)
  const HelperModel = sequelize.define("helpers", Helpers)

  ProductModel.belongsTo(ProductGroupModel, {
    foreignKey: "group_id",
    as: "group"
  })
  ProductGroupModel.hasMany(ProductModel, {
    foreignKey: "group_id",
    as: "products"
  })
  OrderModel.hasMany(OrderItemsModel, {
    foreignKey: "order_id",
    as: "items"
  })
  //
  //await sequelize.sync({alter: true})
  // await sequelize.sync({force: true})
  // const us = [
  //   {name: "Ефремов Алексей", login: "admin@admin.ru", password: "admin", role: "ADMIN"},
  //   {name: "Шилова Екатерина", login: "user@user.ru", password: "user", role: "USER"},
  // ]
  //
  // const its = [
  //   {name: "Макароны", liveTime: 1, minCount: 1, station: 7},
  //   {name: "Бульон", liveTime: 2, minCount: 1, station: 7},
  //   {name: "Лапша", liveTime: 3, minCount: 2, station: 7},
  //   {name: "Бекон", liveTime: 4, minCount: 4, station: 7},
  //   {name: "Колбаски", liveTime: 5, minCount: 2, station: 7},
  //   {name: "Сыр", liveTime: 2, minCount: 2, station: 7},
  //   {name: "Зелень", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Ушки", liveTime: 2, minCount: 2, station: 7},
  //   {name: "Перец", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Соль", liveTime: 2, minCount: 3, station: 7},
  //   {name: "Огурчики", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Помидорчики", liveTime: 2, minCount: 3, station: 7},
  //   {name: "Клюква", liveTime: 3, minCount: 3, station: 7},
  //   {name: "Хлеб", liveTime: 3, minCount: 3, station: 7},
  //   {name: "Вода", liveTime: 4, minCount: 3, station: 7},
  // ]
  //
  // const gs = [
  //   {name: "Роял"},
  //   {name: "Компот"}
  // ]
  //
  // const ps = [
  //   {name: "Суп", items: [2], station: 1, code: "СВ-92232"},
  //   {name: "Бутерброд", items: [1, 2], station: 1, code: "СВ-92231"},
  //   {name: "Омлет", items: [1, 2, 3, 4, 5, 6, 7, 8], station: 2},
  //   ]
  // const ss = [
  //   {plan: 1500000, amount: 0, count: 0, manager: 1},
  //   {plan: 1600000, amount: 0, count: 0, manager: 2},
  // ]
  //
  //
  // await UserModel.bulkCreate(us)
  // await ItemModel.bulkCreate(its)
  // await ProductGroupModel.bulkCreate(gs)
  // await ProductModel.bulkCreate(ps)
  // await SmenaModel.bulkCreate(ss)
  //


  const Order = require("./services/OrderService")
  const Kassa = require("./services/KassaService")
  const DB = require("./services/DBService")
  const Schedule = require("./services/ScheduleService")
  const Darall = require("./services/MailService")
  const Atol = require("./services/AtolService")




  await fastify.register(require('@guivic/fastify-socket.io'), {path: '/io', origins: ['*:*']}, (error) => console.error(error));
  // Do not touch the following lines
  fastify.io.origins('*:*')

  fastify.register(require('fastify-cors'), {
    credentials: true,
    origin: true
  })



  opts.order = new Order({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    TimerModel,
    ProductModModel,
    CornerModel,
    HelperModel,
    BankSettingsModel,
    io: fastify.io,
    logger
  })
  opts.darall = new Darall()
  opts.kassa = new Kassa({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    OrderModel,
    OrderItemsModel,
    TimerModel,
    CornerModel,
    HelperModel,
    KioskModel,
    BankSettingsModel,
    io: fastify.io,
    logger
  })
  opts.atol = new Atol({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    OrderModel,
    OrderItemsModel,
    TimerModel,
    CornerModel,
    HelperModel,
    BankSettingsModel,
    io: fastify.io,
    logger
  })

  opts.db = new DB({
    KioskModel,
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    ProductModModel,
    TimerModel,
    CornerModel,
    HelperModel,
    OrderModel,
    BankSettingsModel,
    io: fastify.io,
    logger
  })

  opts.fetch = fetch

  opts.schedule = new Schedule({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    TimerModel,
    CornerModel,
    HelperModel,
    BankSettingsModel,
    io: fastify.io,
    logger
  })
  opts.logger = logger

  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  })


  // Start functions
  await opts.schedule.updateProducts()

  await opts.order.startItems()
  setInterval(()=> {
    opts.schedule.checkItemsDie()
  }, 20000)
  setInterval(()=> {
    opts.schedule.checkNeedItems()
  }, 5000)
  setInterval(()=> {
    opts.schedule.updateProducts()
  }, 300000)


  cron.schedule("*/30 * * * *", () => {
    opts.schedule.checkItemsK()
      .then(log => console.log(log))
      .catch((e) => {
        console.log("Failed to set K")
        console.log(e)
      })
  })


  //////////////////


  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
