import express, { Router } from 'express'
import isNumber from 'is-number'
import randomInteger from 'random-int'
// import consola from 'consola'
import { Pool, RowDataPacket } from 'mysql2/promise'

let db:Pool
const routerImg = express.Router()
const SQL = 'select * from imgs;'
const SQL_SMALL = 'select * from imgs where small=1;'
const SQL_NORMAL = 'select * from imgs where small=0;'
const SQL_ID = 'select * from imgs where id=?'
const USAGE_SQL = 'INSERT INTO usages VALUES (NULL,"img",?,?,?,?,?,?);'
// let imgnum:number

function usage (pid:number, status:number, ip:string, ua:string, extra:string | null) {
  db.execute(USAGE_SQL, [pid, status, ip, ua, new Date(), extra])
}
routerImg.get('/imgs', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  // const pid = parseInt(req.params.id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : ''
  const typeJson = req.query.type === 'json'
  let query:unknown
  if (req.query.size && req.query.size === 'small') {
    [query] = await db.query(SQL_SMALL)
  } else if (req.query.size && req.query.size === 'normal') {
    [query] = await db.query(SQL_NORMAL)
  } else {
    [query] = await db.query(SQL)
  }
  const img = query as RowDataPacket[]
  if (typeJson) {
    usage(0, 200, req.ip, ua, 'json')
    res.send(img[randomInteger(1, img.length) - 1])
  } else {
    usage(0, 200, req.ip, ua, null)
    res.redirect(img[randomInteger(1, img.length) - 1].path)
  }
})
routerImg.get('/imgs/:id', async (req, res) => {
  // queryImg(req.params.id, req, res, false)
  res.header('Access-Control-Allow-Origin', '*')
  const pid = parseInt(req.params.id)
  const preua = req.header('User-Agent')
  const ua = preua !== undefined ? preua : ''
  const typeJson = req.query.type === 'json'
  if (isNumber(pid)) {
    const [query] = await db.query(SQL_ID, [pid])
    const img = query as RowDataPacket[]
    if (img[0] !== undefined) {
      if (typeJson) {
        usage(pid, 200, req.ip, ua, 'json')
        res.send(img[0])
      } else {
        usage(pid, 200, req.ip, ua, null)
        res.redirect(img[0].path)
      }
    } else {
      usage(pid, 404, req.ip, ua, null)
      res.status(404).sendFile('/www/wwwroot/mcbbs.wiki/404.html')
    }
  } else {
    usage(pid, 400, req.ip, ua, null)
    res.status(400).sendFile('/www/wwwroot/mcbbs.wiki/400.html')
  }
})
export default async function (conn:Pool):Promise<Router> {
  db = conn
  // const [res] = await db.query('select count(*) as count from imgs;')
  // imgnum = (await db.query('select count(*) as count from imgs;')).count
  // imgnum = (res as RowDataPacket[])[0].count
  // consola.info(`Reading ${imgnum} images.`)
  return routerImg
}
