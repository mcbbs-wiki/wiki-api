import { statSync, writeFileSync, readFileSync } from 'fs'

export class Config {
  dbhost:string = 'localhost'
  dbuser:string = 'root'
  dbpass:string = '123456'
  db:string = 'KafuChino'
  port:number = 8080
  constructor (path:string) {
    console.info(`Reading config ${path}`)
    try {
      statSync(path)
      const obj = JSON.parse(readFileSync(path).toString())
      this.dbhost = obj.dbhost
      this.port = obj.port
      this.db = obj.db
      this.dbuser = obj.dbuser
      this.dbpass = obj.dbpass
    } catch {
      writeFileSync(path, JSON.stringify(this))
      console.info(`Creating new config ${path}`)
    }
  }
}
