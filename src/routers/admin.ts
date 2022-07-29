import express from 'express'
const routerAdmin = express.Router()
routerAdmin.get('/admin', (req, res) => {
  res.redirect(301, '/admin/imgs')
  res.end()
})
routerAdmin.get('/admin/imgs', (req, res) => {
  if (req.get('Authorization') === undefined) {
    res.status(401)
    res.header('WWW-Authenticate', 'Basic')
    res.end()
  } else {
    res.status(200)
    res.send(Buffer.from((req.get('Authorization')as string).split(/\s/)[1], 'base64').toString())
  }
})
export default routerAdmin
