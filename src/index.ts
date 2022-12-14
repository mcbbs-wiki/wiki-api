import express from 'express'
// import sqlite3 from 'sqlite3'
import { Config } from './config.js'
import img from './routers/img.js'
import user from './routers/user.js'
// import admin from './routers/admin.js'
// import { open } from 'sqlite'
import { createPool } from 'mysql2/promise'
import { Server } from 'http'
import createError from 'http-errors'

const config = new Config('./config.json')
console.info(`Connecting database ${config.dbhost}`)
const db = await createPool({
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpass,
  database: config.db
})
const app = express()
app.set('view engine', 'ejs')
// app.use('/static', express.static('./public'))
app.use(img(db))
app.use(user())
// app.use(admin)
app.get('/', (req, res) => {
  res.send({ status: 'OK', document: 'https://mcbbs.wiki/wiki/MCBBS_Wiki:API' })
})
app.get('/crash-test', (req, res) => {
  throw new Error('test')
})
app.all('*', (req, res) => {
  res.status(404).send(new createError.NotFound('Route Not Found.'))
})
app.use((err:any, req:any, res:any, next:any) => {
  console.error(err)
  res.status(500).send(new createError.InternalServerError())
})
const server = app.listen(config.port, () => { console.info(`Server started at http://0.0.0.0:${config.port}`) })
function shutdown (server:Server) {
  server.close(async () => {
    console.info('Shuting down')
    await db.end()
    console.info('Closing database')
  })
}

process.on('SIGINT', () => shutdown(server))
process.on('SIGTERM', () => shutdown(server))
