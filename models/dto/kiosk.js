

class Corner {

    constructor({id, name, uid, gate, lock, key, command, token, kioskId, stops}) {
        this.id = id
        this.name = name
        this.uid = uid
        this.gate = gate
        this.stops = stops || []
        this.lock = lock
        this.key = key
        this.kioskId = kioskId
        this.command = command || null
        this.token = token || null
    }
}

module.exports = Corner
