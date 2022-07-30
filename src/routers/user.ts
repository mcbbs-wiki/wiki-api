import express from 'express'
import isNumber from 'is-number'
import { getUser } from '../crawler.js'
const routerUser = express.Router()
routerUser.get('/users/:id', async (req, res) => {
  const uid = parseInt(req.params.id)
  if (isNumber(uid)) {
    res.header('Cache-Control', 'max-age=300')
    const user = await getUser(uid)
    if (!user.locked) {
      res.send(user)
    } else {
      res.status(404).send('')
    }
  } else {
    res.status(400)
    res.send('')
  }
})
export default routerUser
