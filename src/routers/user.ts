import express, { Router } from 'express'
import isNumber from 'is-number'
// import { Database } from 'sqlite'
import { getUser } from '../crawler.js'
import createError from 'http-errors'
const routerUser = express.Router()
routerUser.get('/users/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const uid = parseInt(req.params.id)
  // console.log(req.ip, ua, req.params.id.toString())
  if (isNumber(uid)) {
    res.header('Cache-Control', 'max-age=300')
    // res.header('Access-Control-Allow-Origin','*')
    const user = await getUser(uid)
    if (user) {
      // console.log(uid, req.ip, ua)
      res.send(user)
    } else {
      res.status(404).send(new createError.NotFound('User Not Found.'))
    }
  } else {
    res.status(400).send(new createError.BadRequest('Request params error. See https://mcbbs.wiki/wiki/MCBBS_Wiki:API for help.'))
  }
})
export default function ():Router {
  return routerUser
}
