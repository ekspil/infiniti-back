
class Auth {
    constructor() {
        this.auth = this.auth.bind(this)
    }
    async auth(req, res, next) {
        const authorizationHeader = req.headers.authorization

        if (authorizationHeader) {

           console.log
        }
        else{
            next()
        }
    }


}



module.exports = Auth
