

class Mod {

    constructor({id, name, price, items, exclude, priority}) {
        this.id = id
        this.name = name
        this.items = items
        this.priority = priority
        this.exclude = exclude
        this.price = price
    }
}

module.exports = Mod
