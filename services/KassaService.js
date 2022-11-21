const ItemDTO = require("../models/dto/item")
const fetch = require("node-fetch")

class Order {
    constructor({UserModel, ProductModel, ItemModel, OrderModel, OrderItemsModel, KioskModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.OrderModel = OrderModel
        this.OrderItemsModel = OrderItemsModel
        this.Kiosk = KioskModel
        this.io = io
        this.guid = this.guid.bind(this)
        this.sendToIiko = this.sendToIiko.bind(this)
        this.authIiko = this.authIiko.bind(this)
        this.ExecuteCommand = this.ExecuteCommand.bind(this)
        this.waitASec = this.waitASec.bind(this)

        this.interval = setInterval(()=>{
            global.iikoToken = null
        }, 300000)
    }

    async ExecuteCommand(Data, otherServer){
        let server = process.env.KKM_SERVER
        if(otherServer) server = otherServer
        return await fetch(`http://${server}/Execute`, {
            method: 'post',
            body: JSON.stringify(Data) ,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic " + Buffer.from(process.env.KKM_USER + ":" + process.env.KKM_PASSWORD).toString('base64')  },
        })
    }

    async waitASec(time) {
        return new Promise((resolve => {
            setTimeout(() => {
                resolve()
            }, time || 1000)
        }))
    }


    async sendToIiko(data, pay, kiosk, order){
        let token
        if(!global.iikoToken){
            token = await this.authIiko()
        }
        else {
            token = global.iikoToken
        }

        let server = "https://api-ru.iiko.services"


        const orderTablesBody = {
            terminalGroupIds: [kiosk.iikoTerminalGroupId]

        }
        const orderTables = await fetch(`${server}/api/1/reserve/available_restaurant_sections`, {
            method: 'post',
            body: JSON.stringify(orderTablesBody) ,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token  },
        })

        const orderTablesJson = await orderTables.json()
        const section = orderTablesJson.restaurantSections.find(item=>item.name = "Киоск")
        const table = section.tables.find(item=>item.number = 99)




        const Data = {
            organizationId: kiosk.iikoOrganizationId,
            terminalGroupId: kiosk.iikoTerminalGroupId,
            order: {
                tableIds: [table.id],
                externalNumber: "KSK-" + String(order.id).slice(-4),
                phone: null,
                guestCount: 1,
                items: [
                ],
                combos: [],
                payments: []
            }
        }
        let sumOrder = 0
        for (let i of data.items){

            if(i.setProducts && i.setProducts.length > 0){
                const itemsSum = i.setProducts.reduce((acc, p)=>{
                    return acc + (p.price * p.count)
                }, 0)

                const k = i.price / itemsSum
                for (let ii of i.setProducts){
                    Data.order.items.push({
                        productId: ii.codeIiko,
                        type: "Product",
                        price: Number((k * ii.price).toFixed(2)),
                        amount: ii.count * i.count,
                        //comment: ii.name
                    })
                    sumOrder += (Number((k * ii.price).toFixed(2)) * (ii.count * i.count))
                }

            }
            else{
                Data.order.items.push({
                    productId: i.codeIiko,
                    type: "Product",
                    price: i.price,
                    amount: i.count,
                    //comment: i.name
                })
                sumOrder += (i.price * i.count)
            }
        }
        Data.order.payments.push({
            paymentTypeKind: "Card",
            sum: Number(sumOrder.toFixed(2)),
            paymentTypeId: "08db70af-3a27-4273-b3d7-333e10624db6",
            isProcessedExternally: true,
            //isFiscalizedExternally: true
        })

        let orderTypeId
        if(data.type === "OUT") {
            orderTypeId = "4f126f74-3bc3-448e-852e-9439736e74e2"
        }
        else if(data.type === "IN") {
            orderTypeId = "5e480c63-45d7-41f6-a7bf-67264f4e13e2"
        }
        else {
            orderTypeId = "5e480c63-45d7-41f6-a7bf-67264f4e13e2"
        }
        Data.order.orderTypeId = orderTypeId

        const orderSend = await fetch(`${server}/api/1/order/create`, {
            method: 'post',
            body: JSON.stringify(Data),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token },
        })

        const orderSendJson = await orderSend.json()

        console.log(`IIKO1 ${JSON.stringify(orderSendJson)}`)
        //await this.waitASec(3000)

        const checkBody = {
            organizationIds: [kiosk.iikoOrganizationId],
            orderIds: [orderSendJson.orderInfo.id]

        }

        let int = 0
        let orderCheckJson
        do {
            await this.waitASec(1000)
            int++
            const orderCheck = await fetch(`${server}/api/1/order/by_id`, {
                method: 'post',
                body: JSON.stringify(checkBody) ,
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token  },
            })


            orderCheckJson = await orderCheck.json()
            console.log(`IIKO2 ${JSON.stringify(orderCheckJson)}`)



        }
        while(int < 10 && orderCheckJson.orders[0].creationStatus !== "Success")

        const close = {
            chequeAdditionalInfo: null,
            organizationId: kiosk.iikoOrganizationId,
            orderId: orderSendJson.orderInfo.id
        }

        const orderClose = await fetch(`${server}/api/1/order/close`, {
            method: 'post',
            body: JSON.stringify(close) ,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token  },
        })

        const orderCloseJson = await orderClose.json()

        console.log(`IIKO3 ${JSON.stringify(orderCloseJson)}`)
        return orderCheckJson.orders[0]
    }

    async authIiko(){
        let server = "https://api-ru.iiko.services"


        const Data = {
            apiLogin: process.env.IIKO_KEY
        }
        try{

            const result = await fetch(`${server}/api/1/access_token`, {
                method: 'post',
                body: JSON.stringify(Data) ,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const json = await result.json()
            if(json.token){
                global.iikoToken = json.token
                return json.token
            }
            else{
                throw new Error("Iiko auth error, maybe key is invalid or not set in env")
            }

        }
        catch (e) {
            console.log(`IIKO_AUTH_ERROR ${e.message}`)
            global.iikoToken = ""
        }


    }

    async setStatus({orderId, status}, orderService){
        const route = (orderId.split("-"))[1]
        const order = await this.OrderModel.findOne({
            where: {
                route
            },
            order:[
                ["id", "DESC"]
            ]
        })
        if(!order) return {ok: false, error: "Order not found"}
        order.status = status
        await order.save()
        const orderGlobal = global.Orders.find(order => order.id === orderId);
        if(!orderGlobal) return false
        if(status === "PAYED"){
            orderGlobal.payed = 1
            orderGlobal.timeStart = new Date().getTime()
            await orderService.checkItems(orderGlobal)

        }
        return true
    }

    guid() {

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }


    async getOrder(route, kioskId){
        const order = await this.OrderModel.findOne({
            where: {
                route: route,
                kioskId,
                status: "PAYED"
            },
            order:[
                ["id", "DESC"]
            ]
        })
        if(!order) return {error: "Маршрут не найден!"}
        const items = await order.getItems()
        order.items = items || []

        for (let item of order.items){
            const prod = await this.ProductModel.findOne({
                where: {
                    id: item.item_id
                }
            })
            item.mods = prod.mods
        }
        return {
            id: order.id,
            route: order.route,
            status: order.status,
            sum: order.sum,
            type: order.type,
            items: items || [],
            createdAt: order.createdAt,
            payType: order.payType,
            AuthorizationCode: order.AuthorizationCode,
            RRNCode: order.RRNCode,
            kioskId: order.kioskId
        }

    }

    async createOrder(data, pay){
        return this.OrderModel.sequelize.transaction(async (transaction) => {
            const kiosk = await this.Kiosk.findOne({
                where: {
                    name: data.kiosk
                }
            })
            if(!kiosk){
                throw new Error("KIOSK_NOT_FOUND")
            }
            let sum = data.items.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

            const orderDTO = {
                type: data.type,
                status: "PAYED",
                RRNCode: pay.RRNCode,
                AuthorizationCode: pay.AuthorizationCode,
                payType: "CASHLESS",
                kioskId: kiosk.id,
                sum

            }

            const order = await this.OrderModel.create(orderDTO, {transaction})
            order.route = Number(String(order.id).slice(-4))
            const itemsDTO = data.items.map(item => {
                item.order_id = order.id
                item.item_id = item.id
                delete item.id
                return item
            })

            await this.OrderItemsModel.bulkCreate(itemsDTO, {transaction})
            await order.save({transaction})

            order.kiosk = kiosk

            if(kiosk.type === "IIKO"){

                const orderIiko = await this.sendToIiko(data, pay, kiosk, order)

                order.iiko = true
                order.dataValues.iiko = true
                order.dataValues.iikoId = orderIiko.order.number
            }


            return order

        })

    }

    async setCanceled(data){
            const order = await this.OrderModel.findOne({
                where: {
                    id: data.id
                },
                order: [
                    ["id", "DESC"]
                ]
            })
            if (!order) return {ok: false, error: "Order not found"}
            order.status = "CANCELED"

            const kiosk = await this.Kiosk.findOne({
                where: {
                    name: data.kiosk
                }
            })

            if(!kiosk){
                throw new Error("KIOSK_NOT_FOUND")
            }
            await order.save()

            order.kiosk = kiosk

            return order

    }



    async setPayed(data, orderService){
        return this.OrderModel.sequelize.transaction(async (transaction) => {
            const order = await this.OrderModel.findOne({
                where: {
                    route: data.route
                },
                order:[
                    ["id", "DESC"]
                ],
                transaction
            })
            if(!order) return {ok: false, error: "Order not found"}
            await this.OrderItemsModel.destroy({
                where: {
                    order_id: order.id
                },
                transaction
            })
            const itemsDTO = data.items.map(item => {
                item.order_id = order.id
                item.item_id = item.id
                delete item.id
                return item
            })

            await this.OrderItemsModel.bulkCreate(itemsDTO, {transaction})

            order.type = data.type
            order.status = "PAYED"
            order.payType = data.payType
            if(data.status === "CANCELED"){
                order.status = "CANCELED"
            }
            if(data.RRNCode){
                order.RRNCode = data.RRNCode
            }
            if(data.AuthorizationCode){
                order.AuthorizationCode = data.AuthorizationCode
            }
            const orderGlobal = {
                id: "T-"+order.route,
                die: 0,
                alarm: 0,
                action: "PAYED",
                payed: 1,
                ready: 0,
                takeOut: 0,
                type: data.type,
                source: "KASSA",
                flag: "",
                amount: 0,
                guestName: "",
                extId: "",
                text: "",
                pin: "",
                status: data.status,
                cornerReady: [],
                hidden: [],
                positions: []
            }


            orderGlobal.status = data.status

            /// bus
            let notShow = false

            ////



            orderGlobal.positions = data.items.map(p => {
                if(!p.code) return p
                const pos = global.Products.find(item => item.code === p.code)
                if(pos) {

                    /// bus
                    if(pos.corner === "bus") notShow = true

                    ////

                    p.name = pos.name
                    p.corner = pos.corner
                    const c = orderGlobal.cornerReady.find(i => i.corner === pos.corner)
                    if(!c) orderGlobal.cornerReady.push({ corner: pos.corner, status: "NOTREADY" })

                }
                return p
            })


            for (let it of orderGlobal.positions){
                if(!it.items || it.items.length === 0) continue
                let mods = []
                for (let prodId of it.items){
                    const prod = await this.ProductModel.findOne({
                        where: {
                            id: prodId
                        }
                    })
                    if(!prod) throw new Error('Не существует позиции из сэта')
                    mods.push({
                        name: prod.name,
                        station: prod.station,
                        id: prod.id
                    })

                }

                it.mods = mods
                it.station = -1
            }
            orderGlobal.timeStart = new Date().getTime()
            await orderService.checkItems(orderGlobal)

            ////// bus not show
            if(notShow){
                await order.save({transaction})
                return true
            }

            /// bus not show




            global.Orders.push(orderGlobal)
            await order.save({transaction})
            return true

        })

    }



    async printFiscal(data) {
        const kkmServer = data.kkmServer
        const isFiscal = true
        const slip = data.slip || ""
        const NumDevice = data.printer || 0
        const TypeCheck = data.typeCheck
        const IsBarCode = data.isBarCode

        const my_aray_letters = await this.returnArrayLetters("T"+String(data.route))


        let cart = data.items


        let cartSum = function(){

            return cart.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

        }
        // Подготовка данных команды
        let Data = {
            // Команда серверу
            Command: "RegisterCheck",

            //***********************************************************************************************************
            // ПОЛЯ ПОИСКА УСТРОЙСТВА
            //***********************************************************************************************************
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // ИНН ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            // Если NumDevice = 0 а InnKkm заполнено то ККМ ищется только по InnKkm
            InnKkm: "",
            //---------------------------------------------
            // Заводской номер ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            KktNumber: "",
            // **********************************************************************************************************

            // Время (сек) ожидания выполнения команды.
            //Если За это время команда не выполнилась в статусе вернется результат "NotRun" или "Run"
            //Проверить результат еще не выполненной команды можно командой "GetRezult"
            //Если не указано или 0 - то значение по умолчанию 60 сек.
            // Поле не обязательно. Это поле можно указывать во всех командах
            Timeout: 30,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid(),
            // Это фискальный или не фискальный чек
            IsFiscalCheck: isFiscal,
            // Тип чека;
            // 0 – продажа;                             10 – покупка;
            // 1 – возврат продажи;                     11 - возврат покупки;
            // 8 - продажа только по ЕГАИС (обычный чек ККМ не печатается)
            // 9 - возврат продажи только по ЕГАИС (обычный чек ККМ не печатается)
            TypeCheck: TypeCheck,
            // Не печатать чек на бумагу
            NotPrint: false, //true,
            // Количество копий документа
            NumberCopies: 0,
            // Продавец, тег ОФД 1021
            CashierName: "Киоск самообслуживния",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Телефон или е-Майл покупателя, тег ОФД 1008
            // Если чек не печатается (NotPrint = true) то указывать обязательно
            // Формат: Телефон +{Ц} Email {С}@{C}
            ClientAddress: "",
            // Aдрес электронной почты отправителя чека тег ОФД 1117 (если задан при регистрации можно не указывать)
            // Формат: Email {С}@{C}
            SenderEmail: "info@terminaleda.ru",
            // Система налогообложения (СНО) применяемая для чека
            // Если не указанно - система СНО настроенная в ККМ по умолчанию
            // 0: Общая ОСН
            // 1: Упрощенная УСН (Доход)
            // 2: Упрощенная УСН (Доход минус Расход)
            // 3: Единый налог на вмененный доход ЕНВД
            // 4: Единый сельскохозяйственный налог ЕСН
            // 5: Патентная система налогообложения
            // Комбинация разных СНО не возможна
            // Надо указывать если ККМ настроена на несколько систем СНО
            TaxVariant: "",

            // Строки чека
            CheckStrings: [
                // Строка с печатью простого текста
                // При вставке в текст в середину строки символов "<#10#>" Левая часть строки будет выравнена по левому краю, правая по правому, где 10 - это на сколько меньше станет строка ККТ
                // При вставке в текст в середину строки символов "<#10#>>" Левая часть строки будет выравнена по правому краю, правая по правому, где 10 - отступ от правого клая
                { PrintText: { Text: my_aray_letters[0] }, },
                { PrintText: { Text: my_aray_letters[1] }, },
                { PrintText: { Text: my_aray_letters[2] }, },
                { PrintText: { Text: my_aray_letters[3] }, },
                { PrintText: { Text: my_aray_letters[4] }, },
                { PrintText: { Text: "  " }, },
                { PrintText: { Text: "  " }, },
                // Строка с печатью текста определенным шрифтом
                // Строка с печатью фискальной строки

            ],

            // Наличная оплата (2 знака после запятой)
            Cash: 0.00,
            // Сумма электронной оплаты (2 знака после запятой)
            ElectronicPayment: 0.00,
            // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
            AdvancePayment: 0,
            // Сумма постоплатой(в кредит) (2 знака после запятой)
            Credit: 0,
            // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
            CashProvision: 0,

        };

        const summa = cartSum().toFixed(2)
        if(data.payType === "CASH"){
            Data.Cash = summa
        }
        if(data.payType === "CASHLESS"){
            Data.ElectronicPayment = summa
        }

        for(let n in slip)  {

            let slipString = { PrintText: { Text: slip[n] }, }
            Data.CheckStrings.push(slipString)
        }


        for(let i in cart){


            let fiscalString =             {
                Register: {
                    // Наименование товара 64 символа
                    Name: cart[i].name,
                    // Количество товара (3 знака после запятой)
                    Quantity: cart[i].count,
                    // Цена за шт. без скидки (2 знака после запятой)
                    Price: cart[i].price,
                    // Конечная сумма строки с учетом всех скидок/наценок; (2 знака после запятой)
                    Amount: cart[i].price*cart[i].count,
                    // Отдел, по которому ведется продажа
                    Department: 0,
                    // НДС в процентах или ТЕГ НДС: 0 (НДС 0%), 10 (НДС 10%), 20 (НДС 20%), -1 (НДС не облагается), 120 (НДС 20/120), 110 (НДС 10/110)
                    Tax: -1,
                    //Штрих-код EAN13 для передачи в ОФД (не печатется)
                    EAN13: "1254789547853",
                    // Признак способа расчета. тег ОФД 1214. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ПРЕДОПЛАТА 100% (Полная предварительная оплата до момента передачи предмета расчета)"
                    // 2: "ПРЕДОПЛАТА (Частичная предварительная оплата до момента передачи предмета расчета)"
                    // 3: "АВАНС"
                    // 4: "ПОЛНЫЙ РАСЧЕТ (Полная оплата, в том числе с учетом аванса в момент передачи предмета расчета)"
                    // 5: "ЧАСТИЧНЫЙ РАСЧЕТ И КРЕДИТ (Частичная оплата предмета расчета в момент его передачи с последующей оплатой в кредит )"
                    // 6: "ПЕРЕДАЧА В КРЕДИТ (Передача предмета расчета без его оплаты в момент его передачи с последующей оплатой в кредит)"
                    // 7: "ОПЛАТА КРЕДИТА (Оплата предмета расчета после его передачи с оплатой в кредит )"
                    SignMethodCalculation: 4,
                    // Признак предмета расчета. тег ОФД 1212. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 2: "ПОДАКЦИЗНЫЙ ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 3: "РАБОТА (наименование и иные сведения, описывающие работу)"
                    // 4: "УСЛУГА (наименование и иные сведения, описывающие услугу)"
                    // 5: "СТАВКА АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 6: "ВЫИГРЫШ АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 7: "ЛОТЕРЕЙНЫЙ БИЛЕТ (при осуществлении деятельности по проведению лотерей)"
                    // 8: "ВЫИГРЫШ ЛОТЕРЕИ (при осуществлении деятельности по проведению лотерей)"
                    // 9: "ПРЕДОСТАВЛЕНИЕ РИД (предоставлении прав на использование результатов интеллектуальной деятельности или средств индивидуализации)"
                    // 10: "ПЛАТЕЖ (аванс, задаток, предоплата, кредит, взнос в счет оплаты, пени, штраф, вознаграждение, бонус и иной аналогичный предмет расчета)"
                    // 11: "АГЕНТСКОЕ ВОЗНАГРАЖДЕНИЕ (вознаграждение (банковского)платежного агента/субагента, комиссионера, поверенного или иным агентом)"
                    // 12: "СОСТАВНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, состоящем из предметов, каждому из которых может быть присвоено вышестоящее значение"
                    // 13: "ИНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, не относящемуся к предметам расчета, которым может быть присвоено вышестоящее значение"
                    // 14: "ИМУЩЕСТВЕННОЕ ПРАВО" (передача имущественных прав)
                    // 15: "ВНЕРЕАЛИЗАЦИОННЫЙ ДОХОД"
                    // 16: "СТРАХОВЫЕ ВЗНОСЫ" (суммы расходов, уменьшающих сумму налога (авансовых платежей) в соответствии с пунктом 3.1 статьи 346.21 Налогового кодекса Российской Федерации)
                    // 17: "ТОРГОВЫЙ СБОР" (суммы уплаченного торгового сбора)
                    // 18: "КУРОРТНЫЙ СБОР"
                    // 19: "ЗАЛОГ"
                    SignCalculationObject: 1,
                    // Единица измерения предмета расчета. Можно не указывать
                    MeasurementUnit: "шт"

                }
            }

            Data.CheckStrings.push(fiscalString)

        }




        //Если чек без ШК то удаляем строку с ШК
        if (IsBarCode == false) {
            //Data.Cash = 100;
            for (var i = 0; i < Data.CheckStrings.length; i++) {
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].BarCode != undefined) {
                    Data.CheckStrings[i].BarCode = null;
                };
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].PrintImage != undefined) {
                    Data.CheckStrings[i].PrintImage = null;
                };
            };
        };

        //Скидываем данные об агенте - т.к.у Вас невярнека ККТ не зарегистрирована как Агент.
        Data.AgentSign = null;
        Data.AgentData = null;
        Data.PurveyorData = null;
        for (var i = 0; i < Data.CheckStrings.length; i++) {
            if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].Register != undefined) {
                Data.CheckStrings[i].Register.AgentSign = null;
                Data.CheckStrings[i].Register.AgentData = null;
                Data.CheckStrings[i].Register.PurveyorData = null;
            };
        };

        // Вызов команды
        return await this.ExecuteCommand(Data, kkmServer);


    }

    async ReturnCheck(NumDevice, cart, slip) {

        let cartSum = function(){

            return cart.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

        }
        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "RegisterCheck",

            //***********************************************************************************************************
            // ПОЛЯ ПОИСКА УСТРОЙСТВА
            //***********************************************************************************************************
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // ИНН ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            // Если NumDevice = 0 а InnKkm заполнено то ККМ ищется только по InnKkm
            InnKkm: "",
            //---------------------------------------------
            // Заводской номер ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            KktNumber: "",
            // **********************************************************************************************************

            // Время (сек) ожидания выполнения команды.
            //Если За это время команда не выполнилась в статусе вернется результат "NotRun" или "Run"
            //Проверить результат еще не выполненной команды можно командой "GetRezult"
            //Если не указано или 0 - то значение по умолчанию 60 сек.
            // Поле не обязательно. Это поле можно указывать во всех командах
            Timeout: 30,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid(),
            // Это фискальный или не фискальный чек
            IsFiscalCheck: true,
            // Тип чека;
            // 0 – продажа;                             10 – покупка;
            // 1 – возврат продажи;                     11 - возврат покупки;
            // 8 - продажа только по ЕГАИС (обычный чек ККМ не печатается)
            // 9 - возврат продажи только по ЕГАИС (обычный чек ККМ не печатается)
            TypeCheck: 1,
            // Не печатать чек на бумагу
            NotPrint: false, //true,
            // Количество копий документа
            NumberCopies: 0,
            // Продавец, тег ОФД 1021
            CashierName: "Киоск самообслуживния",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Телефон или е-Майл покупателя, тег ОФД 1008
            // Если чек не печатается (NotPrint = true) то указывать обязательно
            // Формат: Телефон +{Ц} Email {С}@{C}
            ClientAddress: "test@mail.com",
            // Aдрес электронной почты отправителя чека тег ОФД 1117 (если задан при регистрации можно не указывать)
            // Формат: Email {С}@{C}
            SenderEmail: "sochi@mama.com",
            // Система налогообложения (СНО) применяемая для чека
            // Если не указанно - система СНО настроенная в ККМ по умолчанию
            // 0: Общая ОСН
            // 1: Упрощенная УСН (Доход)
            // 2: Упрощенная УСН (Доход минус Расход)
            // 3: Единый налог на вмененный доход ЕНВД
            // 4: Единый сельскохозяйственный налог ЕСН
            // 5: Патентная система налогообложения
            // Комбинация разных СНО не возможна
            // Надо указывать если ККМ настроена на несколько систем СНО
            TaxVariant: "",

            // Строки чека
            CheckStrings: [
                // Строка с печатью простого текста
                // При вставке в текст в середину строки символов "<#10#>" Левая часть строки будет выравнена по левому краю, правая по правому, где 10 - это на сколько меньше станет строка ККТ
                // При вставке в текст в середину строки символов "<#10#>>" Левая часть строки будет выравнена по правому краю, правая по правому, где 10 - отступ от правого клая
                { PrintText: { Text: "  " }, },
                // Строка с печатью текста определенным шрифтом
                // Строка с печатью фискальной строки

            ],

            // Наличная оплата (2 знака после запятой)
            Cash: 0.00,
            // Сумма электронной оплаты (2 знака после запятой)
            ElectronicPayment: cartSum().toFixed(2),
            // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
            AdvancePayment: 0,
            // Сумма постоплатой(в кредит) (2 знака после запятой)
            Credit: 0,
            // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
            CashProvision: 0,

        };

        for(let n in slip)  {

            let slipString = { PrintText: { Text: slip[n] }, }
            Data.CheckStrings.push(slipString)
        }


        for(let i in cart){


            let fiscalString =             {
                Register: {
                    // Наименование товара 64 символа
                    Name: cart[i].name,
                    // Количество товара (3 знака после запятой)
                    Quantity: cart[i].count,
                    // Цена за шт. без скидки (2 знака после запятой)
                    Price: cart[i].price,
                    // Конечная сумма строки с учетом всех скидок/наценок; (2 знака после запятой)
                    Amount: cart[i].price*cart[i].count,
                    // Отдел, по которому ведется продажа
                    Department: 0,
                    // НДС в процентах или ТЕГ НДС: 0 (НДС 0%), 10 (НДС 10%), 20 (НДС 20%), -1 (НДС не облагается), 120 (НДС 20/120), 110 (НДС 10/110)
                    Tax: -1,
                    //Штрих-код EAN13 для передачи в ОФД (не печатется)
                    EAN13: "1254789547853",
                    // Признак способа расчета. тег ОФД 1214. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ПРЕДОПЛАТА 100% (Полная предварительная оплата до момента передачи предмета расчета)"
                    // 2: "ПРЕДОПЛАТА (Частичная предварительная оплата до момента передачи предмета расчета)"
                    // 3: "АВАНС"
                    // 4: "ПОЛНЫЙ РАСЧЕТ (Полная оплата, в том числе с учетом аванса в момент передачи предмета расчета)"
                    // 5: "ЧАСТИЧНЫЙ РАСЧЕТ И КРЕДИТ (Частичная оплата предмета расчета в момент его передачи с последующей оплатой в кредит )"
                    // 6: "ПЕРЕДАЧА В КРЕДИТ (Передача предмета расчета без его оплаты в момент его передачи с последующей оплатой в кредит)"
                    // 7: "ОПЛАТА КРЕДИТА (Оплата предмета расчета после его передачи с оплатой в кредит )"
                    SignMethodCalculation: 1,
                    // Признак предмета расчета. тег ОФД 1212. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 2: "ПОДАКЦИЗНЫЙ ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 3: "РАБОТА (наименование и иные сведения, описывающие работу)"
                    // 4: "УСЛУГА (наименование и иные сведения, описывающие услугу)"
                    // 5: "СТАВКА АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 6: "ВЫИГРЫШ АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 7: "ЛОТЕРЕЙНЫЙ БИЛЕТ (при осуществлении деятельности по проведению лотерей)"
                    // 8: "ВЫИГРЫШ ЛОТЕРЕИ (при осуществлении деятельности по проведению лотерей)"
                    // 9: "ПРЕДОСТАВЛЕНИЕ РИД (предоставлении прав на использование результатов интеллектуальной деятельности или средств индивидуализации)"
                    // 10: "ПЛАТЕЖ (аванс, задаток, предоплата, кредит, взнос в счет оплаты, пени, штраф, вознаграждение, бонус и иной аналогичный предмет расчета)"
                    // 11: "АГЕНТСКОЕ ВОЗНАГРАЖДЕНИЕ (вознаграждение (банковского)платежного агента/субагента, комиссионера, поверенного или иным агентом)"
                    // 12: "СОСТАВНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, состоящем из предметов, каждому из которых может быть присвоено вышестоящее значение"
                    // 13: "ИНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, не относящемуся к предметам расчета, которым может быть присвоено вышестоящее значение"
                    // 14: "ИМУЩЕСТВЕННОЕ ПРАВО" (передача имущественных прав)
                    // 15: "ВНЕРЕАЛИЗАЦИОННЫЙ ДОХОД"
                    // 16: "СТРАХОВЫЕ ВЗНОСЫ" (суммы расходов, уменьшающих сумму налога (авансовых платежей) в соответствии с пунктом 3.1 статьи 346.21 Налогового кодекса Российской Федерации)
                    // 17: "ТОРГОВЫЙ СБОР" (суммы уплаченного торгового сбора)
                    // 18: "КУРОРТНЫЙ СБОР"
                    // 19: "ЗАЛОГ"
                    SignCalculationObject: 1,
                    // Единица измерения предмета расчета. Можно не указывать
                    MeasurementUnit: "шт"

                }
            }

            Data.CheckStrings.push(fiscalString)

        }



        let IsBarCode = false
        //Если чек без ШК то удаляем строку с ШК
        if (IsBarCode == false) {
            //Data.Cash = 100;
            for (var i = 0; i < Data.CheckStrings.length; i++) {
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].BarCode != undefined) {
                    Data.CheckStrings[i].BarCode = null;
                };
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].PrintImage != undefined) {
                    Data.CheckStrings[i].PrintImage = null;
                };
            };
        };

        //Скидываем данные об агенте - т.к.у Вас невярнека ККТ не зарегистрирована как Агент.
        Data.AgentSign = null;
        Data.AgentData = null;
        Data.PurveyorData = null;
        for (var i = 0; i < Data.CheckStrings.length; i++) {
            if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].Register != undefined) {
                Data.CheckStrings[i].Register.AgentSign = null;
                Data.CheckStrings[i].Register.AgentData = null;
                Data.CheckStrings[i].Register.PurveyorData = null;
            };
        };

        // Вызов команды
        return await this.ExecuteCommand(Data);


    }

    async returnArrayLetters(my_string){
        let letterS = [
            '  $$$$ ',
            ' $$    ',
            '  $$$  ',
            '    $$ ',
            ' $$$$  ',
        ];
        let letterF = [
            ' $$$$$ ',
            ' $$    ',
            ' $$$$  ',
            ' $$    ',
            ' $$    ',
        ];
        let letterT = [
            ' $$$$$$',
            '   $$  ',
            '   $$  ',
            '   $$  ',
            '   $$  ',
        ];
        let letterK = [
            ' $$  $$',
            ' $$ $$ ',
            ' $$$   ',
            ' $$ $$ ',
            ' $$  $$',
        ];
        let letterG = [
            '  $$$$ ',
            ' $$    ',
            ' $$ $$$',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letterD = [
            ' $$$$$ ',
            ' $$  $$',
            ' $$  $$',
            ' $$  $$',
            ' $$$$$ ',
        ];
        let letter1 = [
            '    $$',
            '  $$$$',
            '    $$',
            '    $$',
            '    $$',
        ];

        let letter2 = [
            '  $$$$ ',
            ' $$  $$',
            '    $$ ',
            '  $$   ',
            ' $$$$$$',
        ];
        let letter3 = [
            '  $$$$ ',
            ' $   $$',
            '   $$$ ',
            ' $   $$',
            '  $$$$ ',
        ];
        let letter4 = [
            ' $$    ',
            ' $$  $$',
            ' $$$$$$',
            '     $$',
            '     $$',
        ];
        let letter5 = [
            ' $$$$$ ',
            ' $$    ',
            ' $$$$$ ',
            '     $$',
            ' $$$$$ ',
        ];
        let letter6 = [
            '  $$$$ ',
            ' $$    ',
            ' $$$$$ ',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letter7 = [
            ' $$$$$$',
            ' $$  $$',
            '    $$ ',
            '   $$  ',
            '  $$   ',
        ];
        let letter8 = [
            '  $$$$ ',
            ' $$  $$',
            '  $$$$ ',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letter9 = [
            '  $$$$ ',
            ' $$  $$',
            '  $$$$$',
            '     $$',
            '  $$$$ ',
        ];
        let letter0 = [
            '  $$$$ ',
            ' $$  $$',
            ' $$  $$',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letterTire = [
            '       ',
            '       ',
            '  $$$  ',
            '       ',
            '       ',
        ];


        my_string = my_string.toLowerCase();
        let my_aray_letters = [
            '      ',
            '      ',
            '      ',
            '      ',
            '      ',
        ];
        for (let index = 0; index < my_string.length; index++)
        {
            let this_array = ['', '', '', '', '',];
            let char = my_string[index];
            if (char == 'k') { this_array = letterK; }
            if (char == 'f') { this_array = letterF; }
            if (char == 'g') { this_array = letterG; }
            if (char == 's') { this_array = letterS; }
            if (char == 'd') { this_array = letterD; }
            if (char == 't') { this_array = letterT; }
            if (char == '1') { this_array = letter1; }
            if (char == '2') { this_array = letter2; }
            if (char == '3') { this_array = letter3; }
            if (char == '4') { this_array = letter4; }
            if (char == '5') { this_array = letter5; }
            if (char == '6') { this_array = letter6; }
            if (char == '7') { this_array = letter7; }
            if (char == '8') { this_array = letter8; }
            if (char == '9') { this_array = letter9; }
            if (char == '0') { this_array = letter0; }
            if (char == '-') { this_array = letterTire; }
            my_aray_letters[0] = my_aray_letters[0] +' '+this_array[0];
            my_aray_letters[1] = my_aray_letters[1] +' '+this_array[1];
            my_aray_letters[2] = my_aray_letters[2] +' '+this_array[2];
            my_aray_letters[3] = my_aray_letters[3] +' '+this_array[3];
            my_aray_letters[4] = my_aray_letters[4] +' '+this_array[4];

        }
        return my_aray_letters;
    }

// Печать закрытия смены
    async zReport(data) {
        let NumDevice = data.printer || 0
        let kkmServer = data.kkmServer

        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "CloseShift",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Продавец, тег ОФД 1021
            CashierName: "Иванов И.И.",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Не печатать чек на бумагу
            NotPrint: false,
            // Id устройства. Строка. Если = "" то первое не блокированное на сервере
            IdDevice: "",
            // Уникальный идентификатор команды. Любая строока из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            IdCommand: this.guid(),
        };

        // Вызов команды
        return await this.ExecuteCommand(Data, kkmServer);

        // Возвращается JSON:
        //{
        //    "CheckNumber": 1,    // Номер документа
        //    "SessionNumber": 23, // Номер смены
        //    "QRCode": "t=20170904T141100&fn=9999078900002287&i=108&fp=605445600",
        //    "Command": "CloseShift",
        //    "Error": "",  // Текст ошибки если была - обязательно показать пользователю - по содержанию ошибки можно в 90% случаях понять как ее устранять
        //    "Status": 0   // Ok = 0, Run(Запущено на выполнение) = 1, Error = 2, NotFound(устройство не найдено) = 3, NotRun = 4
        //}

    }

// Печать X отчета
    async xReport(data) {


        let NumDevice = data.printer || 0
        let kkmServer = data.kkmServer
        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "XReport",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Id устройства. Строка. Если = "" то первое не блокированное на сервере
            IdDevice: "",
            // Уникальный идентификатор команды. Любая строока из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            IdCommand: this.guid(),
        };

        // Вызов команды
        return await this.ExecuteCommand(Data, kkmServer);
    }


// Оплата безналом
    async payTerminal(data) {
        let kkmServer = data.kkmServer
        let NumDevice = 0
        let sum = data.items.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

        // Подготовка данных команды
        var Data = {
            Command: "PayByPaymentCard",
            NumDevice: NumDevice,
            CardNumber: "",
            Amount: sum,
            ReceiptNumber: data.id,
            IdCommand: this.guid(),
        }

        // Вызов команды
        return await this.ExecuteCommand(Data, kkmServer);
    }

    async returnChekPayment(data) {
        let kkmServer = data.kkmServer

        const sum = data.items.reduce((sum, current) => {
            return sum + current.count * current.price
        }, 0);


        let Data = {
            Command: "ReturnPaymentByPaymentCard",
            NumDevice: 0,
            CardNumber: "",

            Amount: sum,

            ReceiptNumber: data.id,
            RRNCode: data.RRNCode,
            AuthorizationCode: data.AuthorizationCode,
            IdCommand: this.guid()

        };


        return await this.ExecuteCommand(Data, kkmServer);

    }

    async Settlement(data) {

        let NumDevice = 0
        let kkmServer = data.kkmServer

        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "Settlement",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid()

        };

        // Вызов команды
        return await this.ExecuteCommand(Data, kkmServer);
    }

}
module.exports = Order