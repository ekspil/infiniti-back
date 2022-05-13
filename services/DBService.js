class DB {
    constructor({UserModel, ProductModel, ItemModel, ProductGroupModel, SmenaModel, ProductModModel, CornerModel, KioskModel, HelperModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ProductGroupModel = ProductGroupModel
        this.ItemModel = ItemModel
        this.SmenaModel = SmenaModel
        this.ProductModModel = ProductModModel
        this.CornerModel = CornerModel
        this.KioskModel = KioskModel
        this.HelperModel = HelperModel
        this.io = io

        this.token = this.token.bind(this)
        this.auth = this.auth.bind(this)
    }

    async getAllUsers(){
        const users = await this.UserModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllItems(){
        const users = await this.ItemModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllGroups(){
        const users = await this.ProductGroupModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllProducts(query){
        const {archive} = query
        const where = {}
        const { Op } = require("sequelize");
        if(!archive){
            where.archive = {
                [Op.not]: true,
            }
        }
        const users = await this.ProductModel.findAll({
            where,
            order: [['id', 'DESC']]
        })

        return users.map(item => {
            if(!item.mods) item.mods = []
            return item
        })
    }

    async getAllMods(){
        const mods = await this.ProductModModel.findAll({
            order: [['id', 'DESC']]
        })
        return mods
    }


    async getAllHelpers(){
        const helpers = await this.HelperModel.findAll({
            order: [['id', 'DESC']]
        })
        return helpers
    }

    async getAllCorners(){
        const corners = await this.CornerModel.findAll({
            order: [['id', 'DESC']]
        })
        return corners
    }

    async getAllKiosks(){
        const kiosks = await this.KioskModel.findAll({
            order: [['id', 'DESC']],

        })
        return kiosks
    }

    async getKiosk(name){
        const kiosk = await this.KioskModel.findOne({
            where: {
                name
            }

        })
        return kiosk
    }

    async saveProduct(data){
        if(!data.id){
            const product = await this.ProductModel.create(data)
            return product
        }
        else {
            const product = await this.ProductModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                if(!product.archive){
                    product.archive = true
                    return await product.save()
                }
                return await product.destroy()
            }
            product.name = data.name
            product.station = data.station
            product.items = data.items
            product.code = data.code
            product.price = data.price
            product.corner = data.corner
            product.mods = data.mods
            product.img = data.img
            product.archive = data.archive
            product.group_id = data.group_id
            product.coupon = data.coupon
            product.couponPrice = data.couponPrice
            product.hidden = data.hidden
            product.priority = data.priority
            return await product.save()
        }
    }
    async saveGroup(data){
        if(!data.id){
            const group = await this.ProductGroupModel.create(data)
            return group
        }
        else {
            const group = await this.ProductGroupModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                return await group.destroy()
            }
            group.name = data.name
            group.img = data.img
            return await group.save()
        }
    }
    async saveCorner(data){
        if(!data.id){
            const corner = await this.CornerModel.create(data)
            return corner
        }
        else {
            const corner = await this.CornerModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                return await corner.destroy()
            }
            corner.name = data.name
            corner.uid = data.uid
            corner.gate = data.gate
            return await corner.save()
        }
    }
    async saveKiosk(data){
        if(!data.id){
            const kiosk = await this.KioskModel.create(data)
            return kiosk
        }
        else {
            const kiosk = await this.KioskModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                return await kiosk.destroy()
            }
            kiosk.name = data.name
            kiosk.uid = data.uid
            kiosk.gate = data.gate
            kiosk.lock = data.lock
            kiosk.key = data.key
            return await kiosk.save()
        }
    }

    async saveItem(data){
        if(!data.id){
            const item = await this.ItemModel.create(data)
            global.Items.push(items)
            return item
        }
        else {
            const item = await this.ItemModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                global.Items = global.Items.filter(item => item.id !== data.id)
                return await item.destroy()
            }

            item.name = data.name
            item.station = data.station
            item.minCount = data.minCount
            item.liveTime = data.liveTime
            global.Items = global.Items.map(it => {
                if (it.id !== data.id) return it
                it.name = data.name
                it.station = data.station
                it.minCount = data.minCount
                it.liveTime = data.liveTime

                return it
            })
            return await item.save()
        }
    }

    async saveUser(data){
        if(!data.id){
            const user = await this.UserModel.create(data)
            return user
        }
        else {
            const user = await this.UserModel.findOne({
                where: {
                    id: data.id
                }
            })

            if(data.action === "DELETE"){
                return await user.destroy()
            }
            user.name = data.name
            user.password = data.password
            user.login = data.login
            user.role = data.role
            return await user.save()
        }
    }
    async saveMod(data){
        if(!data.id){
            const mod = await this.ProductModModel.create(data)
            return mod
        }
        else {
            const mod = await this.ProductModModel.findOne({
                where: {
                    id: data.id
                }
            })

            if(data.action === "DELETE"){
                return await mod.destroy()
            }
            mod.name = data.name
            mod.items = data.items
            mod.price = data.price
            mod.img = data.img
            return await mod.save()
        }
    }
    async saveHelper(data){
        if(!data.id){
            const helper = await this.HelperModel.create(data)
            return helper
        }
        else {
            const helper = await this.HelperModel.findOne({
                where: {
                    id: data.id
                }
            })

            if(data.action === "DELETE"){
                return await helper.destroy()
            }
            helper.name = data.name
            helper.items = data.items
            helper.price = data.price
            helper.img = data.img
            helper.exclude = data.exclude
            helper.priority = data.priority
            return await helper.save()
        }
    }

    async saveSmena(data){
        const newSmena = {
            plan: Number(data.plan),
            amount: 0,
            count: 0,
            pin: data.pin,
            manager: Number(data.manager)
        }
        await this.SmenaModel.create(newSmena)
        return true
    }

    async getLastSmena(){
        const smena = await this.SmenaModel.findOne({
            order: [
                ["id", "DESC"],
            ]
        })
        return smena
    }

    token() {

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    async auth(data){
        const {login, password} = data
        const user = await this.UserModel.findOne({
            where: {
                login,
                password
            }
        })

        if(!user) {
            throw new Error("Auth error")
        }
        if(global.Users.has(user.login)){
            return global.Users.get(user.login)
        }else {
            delete user.password
            user.token = this.token()
            global.Users.set(user.login, user)
        }

        return user
    }

    async authKiosk(data){
        const {name, key} = data
        const kiosk = await this.KioskModel.findOne({
            where: {
                name,
                key
            }
        })

        if(!kiosk) {
            throw new Error("Auth error")
        }
        if(global.Kiosks.has(kiosk.name)){
            return global.Kiosks.get(kiosk.name)
        }else {
            delete kiosk.key
            kiosk.token = this.token()
            global.Kiosks.set(kiosk.name, kiosk)
        }

        return kiosk
    }
}
module.exports = DB