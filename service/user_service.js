'use strict'

const bent = require('bent');
const config = require('config');


const ORANGE_AUTH_TOKEN_VERIFICATION_URL = config.get('auth.url');
const CLIENT_ID = config.get('auth.clientid');
const API_KEY_ADMIN = config.get('auth.adminkey');
const API_KEY = config.get('auth.key');


module.exports = {
  verifyToken: async function(token, isAdmin) {
    const getJSON = bent('json')
    try {
      console.log(ORANGE_AUTH_TOKEN_VERIFICATION_URL)
      const user = await getJSON(ORANGE_AUTH_TOKEN_VERIFICATION_URL + token, 
        "GET", {
          "client-id": CLIENT_ID,
          "api-key": isAdmin? API_KEY_ADMIN: API_KEY }
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