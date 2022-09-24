import express, { Router } from 'express'
import isNumber from 'is-number'
import randomInteger from 'random-int'
// import consola from 'consola'
import { Pool, RowDataPacket } from 'mysql2/promise'
import createError from 'http-errors'

let db:Pool
const routerImg = express.Router()
const SQL = 'select * from imgs;'
const SQL_SMALL = 'select * from imgs where small=1;'
const SQL_NORMAL = 'select * from imgs where small=0;'
const SQL_ID = 'select * from imgs where id=?'
// let imgnum:number
routerImg.get('/imgs', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  // const pid = parseInt(req.params.id)
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
    res.send(img[randomInteger(1, img.length) - 1])
  } else {
    res.redirect(img[randomInteger(1, img.length) - 1].path)
  }
})
routerImg.get('/imgs/:id', async (req, res) => {
  // queryImg(req.params.id, req, res, false)
  res.header('Access-Control-Allow-Origin', '*')
  const pid = parseInt(req.params.id)
  const typeJson = req.query.type === 'json'
  if (isNumber(pid)) {
    const [query] = await db.query(SQL_ID, [pid])
    const img = query as RowDataPacket[]
    if (img[0] !== undefined) {
      if (typeJson) {
        res.send(img[0])
      } else {
        res.redirect(img[0].path)
      }
    } else {
      res.status(404).send(new createError.NotFound('Image Not Found.'))
    }
  } else {
    res.status(400).send(new createError.BadRequest('Request params error.See https://mcbbs.wiki/wiki/MCBBS_Wiki:API for help.'))
  }
})
routerImg.post('/imgs/upload', (req, res) => {

})
routerImg.get('/imgs/list', (req, res) => {

})
export default function (conn:Pool):Router {
  db = conn
  // const [res] = await db.query('select count(*) as count from imgs;')
  // imgnum = (await db.query('select count(*) as count from imgs;')).count
  // imgnum = (res as RowDataPacket[])[0].count
  // consola.info(`Reading ${imgnum} images.`)
  return routerImg
}
