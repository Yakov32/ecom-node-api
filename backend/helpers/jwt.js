const {expressjwt} = require('express-jwt');


function authJwt() {
   const secret = process.env.JWT_SECRET;
   const apiUrl = process.env.API_URL;
   return expressjwt({
      secret,
      algorithms: ['HS256'],
      isRevoked: isRevoked
   }).unless({
      path: [
         {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
         {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
         `${apiUrl}/users/login`,
         `${apiUrl}/users/register`,
         {url: /\/public(.*)/, methods: ['GET', 'OPTIONS']},
      ]
   })
}

async function isRevoked(req, token) {
   
   if(!token.payload.isAdmin) {
      return true;
   }
   
}

module.exports = authJwt;