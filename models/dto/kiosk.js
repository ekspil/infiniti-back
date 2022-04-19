

class Corner {

    constructor({id, name, uid, gate, lock, key, command, token}) {
        this.id = id
        this.name = name
        this.uid = uid
        this.gate = gate
        this.lock = lock
        this.key = key
        this.command = command || null
        this.token = token || null
    }
}

module.exports = Corner
