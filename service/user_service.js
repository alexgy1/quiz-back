'use strict'

const bent = require('bent');

const ORANGE_AUTH_TOKEN_VERIFICATION_URL = "https://authentication.orangelabschina.cn:1805/v2/codeauth/verify?token=";
const CLIENT_ID = "winterolympic2022";
const CLIENT_ID_ADMIN = "";
const API_KEY = "fqOOLBk8NmpdAYaTln5uLbBkhU6FPwNMQAvp8BwttRDUuTTSS6K_y-_f4N9XuUNh";
const TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmFuZ2UgSW5ub3ZhdGlvbiBDaGluYSIsInN1YiI6IjYxYzJlOWZlZTk1Y2I2ODA4NWUzNmVmMCIsImVtYWlsIjoiY2hlbmcuY2hlbkBvcmFuZ2UuY29tIiwiYXVkIjoid2ludGVyb2x5bXBpYzIwMjIiLCJyb2xlIjoidXNlciIsImlhdCI6MTY0MDE2Mzk2MywiZXhwIjoxNjQyNzU1OTYzfQ.R95I7lc_j3-ruBopmJVu7Fm1JXjc6GNTk79Nx9wY8-zv3X6RX8AIDcE9dd3GfuB477vBGyFX8lt7UtbQNLHSUpSNUvvL-0eHwyX1HYjC6zMFYu1RVcggU8udnL2SiHwbw8rvsZ7IR1VpKz4IX8ixqNOuKwVij0wA5NX9DvqyvhxhxKKFIIZmIrOE3Q_LH_GzdqJst3g-MxcUXRVU5zeOJBWCB4JKWuKxeRCbNtm2drDDUhB4wcQ0UWfIiagyNzvMmnlolqNczLeHXkblsPJDxSPqsK1zLEemr9T9Pcg4OjK4_c7WuoOWeAxPzYkGxLmFnwJNdtqEap1y9P1e1sFcJfx-d4w0079-OErFet3ShbM7Zh1T_MGEeO6-f0mKRAnzTp7D4khBTDC5ksUnl2Hh23etJdLFBZAvmEFC65GhoANECWLQAyXXAKrewPh5eA_PusLmQT6NDEsNFlFrwXDMT567zhw5Xo52JW2m1HuWRbH-XGdAi0HpdWyGCsi4vMrU3-zWIsYoxn1_m0Jhv5oxwwIyrw0VZzjC4VuA5i5eRAgNMYSE1hS2rG0ya0tgWFaPcXGZcfd35M7OW3r4KNbMDy7hbiZ3oR9476M4N6w40omG03s_gK4jNxEDpQ0fyK6h8rTIn7yLqM1Mjw7CfdTWlYwDl83VsiMli8k28Zg8Nr4";


module.exports = {
  verifyToken: async function(token, isAdmin) {
    const getJSON = bent('json')
    try {
      const user = await getJSON(ORANGE_AUTH_TOKEN_VERIFICATION_URL + token, 
        "GET", {
          "client-id": isAdmin? CLIENT_ID_ADMIN: CLIENT_ID,
          "api-key": API_KEY }
      )

      return {id: user.sub, email: user.email};
    } catch (e) {
      const error = await e.json();
      if(error.code != 403) {
        console.error("FATAL verification interface error, please check the code")
      }
      return false
    }
  }
  
}