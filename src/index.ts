import express from 'express'
import sqlite3 from 'sqlite3'
import consola from 'consola'
import { Config } from './config.js'
import img from './routers/img.js'
import user from './routers/user.js'
import admin from './routers/admin.js'
import { open } from 'sqlite'
import { Server } from 'http'

const config = new Config('./config.json')
consola.info(`Reading database ${config.dbpath}`)
const db = await open({
  filename: config.dbpath,
  driver: sqlite3.Database
})
const app = express()
app.set('view engine', 'ejs')
// app.use('/static', express.static('./public'))
app.use(await img(db))
app.use(user(db))
app.use(admin)
app.all('*', function (req, res) {
  res.status(404).send('')
})
app.use(function (err:any, req:any, res:any, next:any) {
  consola.error(err)
  res.status(500).send('')
})
const server = app.listen(config.port, () => { consola.info(`Server started at http://0.0.0.0:${config.port}`) })
function shutdown (server:Server) {
  server.close(async () => {
    consola.info('Shuting down')
    await db.close()
    consola.info('Closing database')
  })
}

process.on('SIGINT', () => shutdown(server))
process.on('SIGTERM', () => shutdown(server))
