

class Corner {

    constructor({id, name, uid, gate, lock, key, command, token, kioskId, stops, billSum, billCount}) {
        this.id = id
        this.name = name
        this.uid = uid
        this.gate = gate
        this.stops = stops || []
        this.lock = lock
        this.key = key
        this.billSum = billSum
        this.billCount = billCount
        this.kioskId = kioskId
        this.command = command || null
        this.token = token || null
    }
}

module.exports = Corner
