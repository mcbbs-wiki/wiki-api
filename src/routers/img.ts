import express, { Router, Request, Response } from 'express'
import isNumber from 'is-number'
import randomInteger from 'random-int'
import consola from 'consola'
import { Pool, RowDataPacket } from 'mysql2/promise'
// import { inspect } from 'util'

let db:Pool
const routerImg = express.Router()
const SQL = 'select * from imgs where id=?;'
const USAGE_SQL = 'INSERT INTO usages VALUES (NULL,"img",?,?,?,?,?,?);'
let imgnum:number

function usage (random:boolean, pid:number, status:number, ip:string, ua:string, extra:string | null) {
  db.execute(USAGE_SQL, [random ? 0 : pid, status, ip, ua, new Date(), extra])
}
routerImg.get('/imgs', async (req, res) => {
  // console.log(db.getMaxListeners())
  // ssb.getMaxListeners()
  queryImg(randomInteger(1, imgnum).toString(), req, res, true)
})
routerImg.get('/imgs/:id', async (req, res) => {
  queryImg(req.params.id, req, res, false)
})
async function queryImg (id:string, req:Request, res:Response, random:boolean) {
  res.header('Access-Control-Allow-Origin', '*')
  const pid = parseInt(id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : ''
  const typeJson = req.query.type === 'json'
  if (isNumber(id)) {
    // consola.log(id)
    if (typeJson) {
      const [query] = await db.query(SQL, [pid])
      const img = query as RowDataPacket[]
      if (img.length !== 0) {
        usage(random, pid, 200, req.ip, ua, 'json')
        res.header('Cache-Control', 'no-store')
        res.send(img[0])
      } else {
        usage(random, pid, 404, req.ip, ua, 'json')
        res.status(404).sendFile('/www/wwwroot/mcbbs.wiki/404.html')
      }
    } else {
      usage(random, pid, 200, req.ip, ua, null)
      res.redirect(`/images/memes/${pid}.webp`)
    }
  } else {
    usage(random, pid, 400, req.ip, ua, null)
    res.status(400).sendFile('/www/wwwroot/mcbbs.wiki/400.html')
  }
}
export default async function (conn:Pool):Promise<Router> {
  db = conn
  const [res] = await db.query('select count(*) as count from imgs;')
  // imgnum = (await db.query('select count(*) as count from imgs;')).count
  imgnum = (res as RowDataPacket[])[0].count
  consola.info(`Reading ${imgnum} images.`)
  return routerImg
}
