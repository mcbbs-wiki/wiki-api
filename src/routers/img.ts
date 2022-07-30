import express, { Router, Request, Response } from 'express'
import isNumber from 'is-number'
import { Database } from 'sqlite'
import randomInteger from 'random-int'
import consola from 'consola'
// import { inspect } from 'util'

let db:Database
const routerImg = express.Router()
const SQL = 'select * from imgs where id=?'
const USAGE_SQL = 'INSERT INTO usage VALUES (NULL,"img",?,?,?,?,?,?)'
let imgnum:number

routerImg.get('/imgs', async (req, res) => {
  // console.log(db.getMaxListeners())
  // ssb.getMaxListeners()
  queryImg(randomInteger(1, imgnum).toString(), req, res, true)
})
routerImg.get('/imgs/:id', async (req, res) => {
  queryImg(req.params.id, req, res, false)
})
async function queryImg (id:string, req:Request, res:Response, random:boolean) {
  const pid = parseInt(id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : null
  const typeJson = req.query.type === 'json'
  if (isNumber(id)) {
    // consola.log(id)
    if (typeJson) {
      const img = await db.get(SQL, [pid])
      if (img !== undefined) {
        db.run(USAGE_SQL,
          random ? 0 : pid,
          200,
          req.ip,
          ua,
          Math.floor(new Date().getTime() / 1000),
          typeJson ? 'json' : null
        )
        res.header('Cache-Control', 'no-store')
        res.send(await db.get(SQL, [pid]))
      } else {
        db.run(USAGE_SQL,
          random ? 0 : pid,
          404,
          req.ip,
          ua,
          Math.floor(new Date().getTime() / 1000),
          typeJson ? 'json' : null
        )
        res.status(404)
        res.send('')
      }
    } else {
      db.run(USAGE_SQL,
        random ? 0 : pid,
        200,
        req.ip,
        ua,
        Math.floor(new Date().getTime() / 1000),
        typeJson ? 'json' : null
      )
      res.redirect(`/images/memes/${pid}.webp`)
    }
  } else {
    db.run(USAGE_SQL,
      random ? 0 : pid,
      400,
      req.ip,
      ua,
      Math.floor(new Date().getTime() / 1000),
      typeJson ? 'json' : null
    )
    res.status(400)
    res.send('')
  }
}
export default async function (conn:Database):Promise<Router> {
  db = conn
  imgnum = (await db.get('select count(*) as count from imgs;')).count
  consola.info(`Reading ${imgnum} images.`)
  return routerImg
}
