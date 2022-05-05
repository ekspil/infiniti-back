
const fetch = require("node-fetch")

class AtolService {
    constructor() {
        this.getBillSum = this.getBillSum.bind(this)
        this.getTime = this.getTime.bind(this)
        this.billAction = this.billAction.bind(this)
        this.token = null
    }
  getTime(){
      const date = new Date()
      return`${("0" + date.getUTCDate()).slice(-2)}.${("0" + (date.getUTCMonth()+1)).slice(-2)}.${date.getUTCFullYear()} ${("0" + date.getUTCHours()).slice(-2)}:${("0" + date.getUTCMinutes()).slice(-2)}:${("0" + date.getUTCSeconds()).slice(-2)}`

  }
  getBillSum(cart) {
      return cart.reduce(
          (acc, item) => {
              if (!item.count) item.count = 1;
              acc.sum = acc.sum + item.count * item.price;
              acc.count = acc.count + item.count;
              return acc;
          },
          { count: 0, sum: 0 }
      );
  };

  async getToken(){

      const data = {
          login: process.env.ATOL_LOGIN,
          pass: process.env.ATOL_PASSWORD,
      }

      const response = await fetch(`https://online.atol.ru/possystem/v4/getToken`, {
          method: 'post',
          body: JSON.stringify(data) ,
          headers: {
              'Content-Type': 'application/json; charset=utf-8'
          }
      })


      switch (response.status) {
          case 200: {

              const json = await response.json()
              if (json.error) {
                  throw new Error(`Failed to login: [${json.error.code}] ${json.error.text}`)
              }

              return json.token
          }
          default:
              throw new Error("Cannot login, unknown status code: " + response.status)
      }
  }


  async billAction(data, action) {
      if(!this.token){
          this.token = await this.getToken()
      }
      const {order, pay, bill} = data
      const check = {
          timestamp: this.getTime(),
          external_id: `rb_kiosk_${order.id}`,
          service: {
              callback_url: "https://api.rb24.ru/api/kiosk/billCallBack"
          },
          receipt: {
              client: {
                  email: "client@infiniti-group.ru",
                  phone: "+70002410085",
              },
              company: {
                  email: "it@infiniti-group.ru",
                  sno: "envd",
                  inn: "2540129820",
                  payment_address: "rb24.ru"
              },
              items: [
              ],
              payments: [{
                  type: 1,
                  sum: this.getBillSum(bill.items).sum
              }
              ],
              vats: [{
                  type: "none"
              }
              ],
              total: this.getBillSum(bill.items).sum
          }
      }
      check.receipt.items = bill.items.map(item => {
          return {
              name: item.name,
              price: item.price,
              quantity: item.count,
              measure: 0,
              sum: item.price * item.count,
              payment_method: "full_payment",
              payment_object: "commodity",
              measurement_unit: "Штука",
              vat: {
                  type: "none"
              },
          }
      })





      const result = await fetch(`https://online.atol.ru/possystem/v4/${process.env.ATOL_GROUP}/${action}`, {
          method: 'post',
          body: JSON.stringify(check),
          headers: {
              'Content-Type': 'application/json; charset=utf-8',
              "Token": this.token,
          }
      })

      const resultJson = await result.json()

      return resultJson
  }

}

module.exports = AtolService