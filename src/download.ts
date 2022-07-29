import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const db = await open({
  filename: './db.db',
  driver: sqlite3.Database
})
const SQL = 'INSERT INTO imgs VALUES (?,?,?)'

for (let i = 1; i < 24; i++) {
  console.log(i)
  await db.run(SQL, [i, `/static/imgs/${i}.webp`, '混乱'])
}
