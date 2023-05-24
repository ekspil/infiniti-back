'use strict'
const fs = require('fs');
const path = require('path');


const UserDTO = require("../models/dto/user")
const GroupDTO = require("../models/dto/group")
const ItemDTO = require("../models/dto/item")
const ProductDTO = require("../models/dto/product")


module.exports = async function (fastify, opts) {

  const {order, db, fetch, kassa, atol} = opts


  fastify.get('/api/kassa/create', async (request, reply) => {
    return kassa.newOrder()
  })


  fastify.post('/api/kiosk/create', async (request, reply) => {
    const {bill} = request.body
    try{

      const order = await kassa.createOrder(bill)
      if(!order){
        throw new Error("Ошибка записи заказа в БД")
      }
      if(order.error === "IIKO_ERROR"){
        console.log("IIKO_ERROR: " + JSON.stringify(order.text))
        throw new Error(JSON.stringify(order.text))
      }

      return {ok: true, order}

    }catch (e) {
      return {ok: false, message: e.message, moneyBack: true}
    }


  })
  fastify.post('/api/kiosk/close', async (request, reply) => {
    const {pay, bill, orderIikoId, orderId, userId} = request.body
    try{

      const order = await kassa.closeIikoOrder(bill, orderIikoId, orderId, pay, userId)
      if(!order){
        throw new Error("Ошибка записи заказа в БД")
      }
      if(order.error === "IIKO_ERROR"){
        console.log("IIKO_ERROR: " + JSON.stringify(order.text))
        throw new Error(JSON.stringify(order.text))
      }

      const check = await atol.billAction({order, pay, bill}, "sell", order.kiosk)
      return {ok: true, order, check}

    }catch (e) {
      return {ok: false, message: e.message, moneyBack: true}
    }


  })


  fastify.post('/api/kiosk/cancel', async (request, reply) => {
    const {bill, pay} = request.body
    try{

      const order = await kassa.setCanceled(bill)
      if(!order || order.ok === false){
        throw new Error("CANCEL_ERROR")
      }
      const check = await atol.billAction({order, pay, bill}, "sell_refund", order.kiosk)
      return {ok: true, order, check}

    }catch (e) {
      return {ok: false, message: e.message}
    }


  })

  fastify.post('/api/kiosk/billCallBack', async (request, reply) => {
    const json = JSON.stringify(request.body)
    console.log(json)

    //const data = {"uuid":"4d4a8842-86fd-48fd-a3f8-a76e6a92c70c","timestamp":"07.05.2022 10:51:43","callback_url":"https://api.rb24.ru/api/kiosk/billCallBack","status":"done","group_code":"delivery-rb24-ru_11624","daemon_code":"nextserver","device_code":"KKT005531","external_id":"rb_kiosk_28","error":null,"payload":{"fiscal_receipt_number":31,"shift_number":668,"receipt_datetime":"07.05.2022 10:50:00","total":1,"fn_number":"9287440300789820","ecr_registration_number":"0003039335044252","fiscal_document_number":19671,"fiscal_document_attribute":3414645016,"fns_site":"https://www.nalog.ru/rn77/","ofd_inn":"7605016030"}}

  })

  fastify.get('/api/kassa/getOrder/:orderId/:kioskId', async (request, reply) => {
    return kassa.getOrder(request.params.orderId, request.params.kioskId)
  })

  fastify.get('/api/eo/getImgs', async (request, reply) => {

    const files_ = [];
    let files = fs.readdirSync('public/slider');
    for (let i in files){
      let name = files[i];
        files_.push(name);

    }
    return files_;


  })

  fastify.get('/api/kassa/setStatus/:orderId/:status', async (request, reply) => {
     await kassa.setStatus(request.params, order)
    try {
      await fastify.io.emit("fullCheck", global.Orders)

      await fastify.io.emit("fullItems", global.Items)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }
  })

  fastify.post('/api/kassa/updateOrder/:orderId', async (request, reply) => {
    await kassa.update(request.body, request.params.orderId, request.query.printer)
    await fastify.io.emit("fullCheck", global.Orders)

    return {ok: true}
  })

  fastify.post('/api/kassa/printFiscal/', async (request, reply) => {

    const res = await kassa.printFiscal(request.body)
    const result = await res.json()
    return {ok: true, result}
  })

  fastify.post('/api/kassa/payTerminal/', async (request, reply) => {

    const res = await kassa.payTerminal(request.body)
    const result = await res.json()
    return {ok: true, result}
  })

  fastify.post('/api/kassa/setPayed/', async (request, reply) => {

    const res = await kassa.setPayed(request.body, order)
    await fastify.io.emit("fullCheck", global.Orders)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/setCanceled/', async (request, reply) => {

    const res = await kassa.setCanceled(request.body)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/xReport/', async (request, reply) => {

    const res = await kassa.xReport(request.body)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/zReport/', async (request, reply) => {

    const res = await kassa.zReport(request.body)
    await kassa.Settlement(request.body)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/returnChekPayment/', async (request, reply) => {

    const res = await kassa.returnChekPayment(request.body)
    const result = await res.json()
    return {ok: true, result}

  })
}

