

class Corner {

    constructor({id, name, uid, gate, lock, key, command, token, kioskId, stops, billSum, billCount, atolGroup, atolPassword, atolLogin, vip, iikoOrganizationId, iikoTerminalGroupId, type, atolInn}) {
        this.id = id
        this.name = name
        this.uid = uid
        this.gate = gate
        this.stops = stops || []
        this.lock = lock
        this.key = key
        this.vip = vip
        this.billSum = billSum
        this.billCount = billCount
        this.kioskId = kioskId
        this.command = command || null
        this.token = token || null
        this.atolGroup = atolGroup || null
        this.atolPassword = atolPassword || null
        this.atolLogin = atolLogin || null
        this.type = type || null
        this.iikoTerminalGroupId = iikoTerminalGroupId || null
        this.iikoOrganizationId = iikoOrganizationId || null
        this.atolInn = atolInn
    }
}

module.exports = Corner
