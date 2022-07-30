import { statSync, writeFileSync, readFileSync } from 'fs'
import consola from 'consola'

export class Config {
  dbpath:string = './db.db'
  port:number = 8080
  constructor (path:string) {
    consola.info(`Reading config ${path}`)
    try {
      statSync(path)
      const obj = JSON.parse(readFileSync(path).toString())
      this.dbpath = obj.dbpath
      this.port = obj.port
    } catch {
      writeFileSync(path, JSON.stringify(this))
      consola.info(`Creating new config ${path}`)
    }
  }
}
