import express, { Router, Request, Response } from 'express'
import isNumber from 'is-number'
import { Database } from 'sqlite'
import randomInteger from 'random-int'
import consola from 'consola'
// import { inspect } from 'util'

let db:Database
const routerImg = express.Router()
const SQL = 'select * from imgs where id=?'
let imgnum:number

routerImg.get('/imgs', async (req, res) => {
  // console.log(db.getMaxListeners())
  // ssb.getMaxListeners()
  queryImg(randomInteger(1, imgnum), req, res)
})
routerImg.get('/imgs/:id', async (req, res) => {
  queryImg(parseInt(req.params.id), req, res)
})
async function queryImg (id:number, req:Request, res:Response) {
  if (isNumber(id)) {
    // consola.log(id)
    if (req.query.type === 'json') {
      const img = await db.get(SQL, [id])
      if (img !== undefined) {
        res.header('Cache-Control', 'no-store')
        res.send(await db.get(SQL, [id]))
      } else {
        res.status(404)
        res.send('')
      }
    } else {
      res.redirect(`/static/imgs/${id}.webp`)
    }
  } else {
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
