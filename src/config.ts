import { statSync, writeFileSync } from 'fs'
import consola from 'consola'

interface User{
    username:string,
    password:string
}
export class Config {
  dbpath:string = './db.db'
  users:User[] = [{ username: 'user', password: '123456' }]
  port:number = 8080
  constructor (path:string) {
    consola.info(`Reading config ${path}`)
    try {
      statSync(path)
    } catch {
      writeFileSync(path, JSON.stringify(this))
      consola.info(`Creating new config ${path}`)
    }
  }
}
