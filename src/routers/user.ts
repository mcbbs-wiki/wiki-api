import express, { Router } from 'express'
import isNumber from 'is-number'
import { Pool } from 'mysql2/promise'
// import { Database } from 'sqlite'
import { getUser } from '../crawler.js'
const routerUser = express.Router()
let db:Pool
const USAGE_SQL = 'INSERT INTO usages VALUES (NULL,"user",?,?,?,?,?,?)'
function usage (uid:number, status:number, ip:string, ua:string) {
  db.execute(USAGE_SQL, [uid, 200, ip, ua, new Date(), null])
}
routerUser.get('/users/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const uid = parseInt(req.params.id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : ''
  // console.log(req.ip, ua, req.params.id.toString())
  if (isNumber(uid)) {
    res.header('Cache-Control', 'max-age=300')
    // res.header('Access-Control-Allow-Origin','*')
    const user = await getUser(uid)
    if (user) {
      // console.log(uid, req.ip, ua)
      usage(uid, 200, req.ip, ua)
      res.send(user)
    } else {
      usage(uid, 404, req.ip, ua)
      res.status(404).sendFile('/www/wwwroot/mcbbs.wiki/404.html')
    }
  } else {
    usage(uid, 400, req.ip, ua)
    res.status(400).sendFile('/www/wwwroot/mcbbs.wiki/400.html')
  }
})
export default function (conn:Pool):Router {
  db = conn
  return routerUser
}
