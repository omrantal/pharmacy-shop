const { expressjwt: jwt } = require("express-jwt");
const api = process.env.API_URL;
const secret = process.env.secret;

module.exports = jwt({
  secret,
  algorithms:  ['HS256'],
  isRevoked
}).unless({
  path: [
    { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
    { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
    { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
    { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
    `${api}/users/login`,
    `${api}/users/register`
  ]
})

async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return;
  }
}
//module.exports = authJwt;
