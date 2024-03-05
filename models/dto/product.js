

class Product {

    constructor({id, code, name, corner, items, station, price, group_id, groups, mods, archive, img, coupon, hidden, couponPrice, blocked, priority, priceVip, codeIiko, helpers, description, des_c, des_k, des_p, des_l}) {
        this.id = id
        this.code = code
        this.codeIiko = codeIiko
        this.corner = corner
        this.name = name
        this.station = station
        this.price = price
        this.priceVip = priceVip
        this.items = items
        this.mods = mods
        this.archive = archive
        this.coupon = coupon
        this.couponPrice = couponPrice
        this.hidden = hidden
        this.blocked = blocked
        this.img = img
        this.priority = priority
        this.group_id = group_id
        this.groups = groups
        this.helpers = helpers
        this.des_c = des_c
        this.des_k = des_k
        this.des_p = des_p
        this.des_l = des_l
        this.description = description
    }
}

module.exports = Product
