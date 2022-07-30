import express, { Router } from 'express'
import isNumber from 'is-number'
import { Database } from 'sqlite'
import { getUser } from '../crawler.js'
const routerUser = express.Router()
let db:Database
const USAGE_SQL = 'INSERT INTO usage VALUES (NULL,"user",?,?,?,?,?,?)'
routerUser.get('/users/:id', async (req, res) => {
  const uid = parseInt(req.params.id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : null
  // console.log(req.ip, ua, req.params.id.toString())
  if (isNumber(uid)) {
    res.header('Cache-Control', 'max-age=300')
    const user = await getUser(uid)
    if (user) {
      // console.log(uid, req.ip, ua)
      db.run(USAGE_SQL,
        uid,
        200,
        req.ip,
        ua,
        Math.floor(new Date().getTime() / 1000),
        null
      )
      res.send(user)
    } else {
      db.run(USAGE_SQL, [
        req.params.id.toString(),
        404,
        req.ip,
        ua,
        Math.floor(new Date().getTime() / 1000),
        null
      ])
      res.status(404).send('')
    }
  } else {
    db.run(USAGE_SQL, [
      req.params.id.toString(),
      400,
      req.ip,
      ua,
      Math.floor(new Date().getTime() / 1000),
      null
    ])
    res.status(400)
    res.send('')
  }
})
export default function (conn:Database):Router {
  db = conn
  return routerUser
}
