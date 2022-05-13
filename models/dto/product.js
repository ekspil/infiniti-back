

class Product {

    constructor({id, code, name, corner, items, station, price, group_id, mods, archive, img, coupon, hidden, couponPrice, blocked}) {
        this.id = id
        this.code = code
        this.corner = corner
        this.name = name
        this.station = station
        this.price = price
        this.items = items
        this.mods = mods
        this.archive = archive
        this.coupon = coupon
        this.couponPrice = couponPrice
        this.hidden = hidden
        this.blocked = blocked
        this.img = img
        this.group_id = group_id
    }
}

module.exports = Product
