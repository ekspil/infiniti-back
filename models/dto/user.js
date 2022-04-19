

class User {

    constructor({id, name, login, role, password, token}) {
        this.id = id
        this.name = name
        this.role = role
        this.login = login
        this.password = password
        this.token = token
    }
}

module.exports = User
