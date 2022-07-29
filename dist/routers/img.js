import express from 'express';
import { inspect } from 'util';
let db;
const routerImg = express.Router();
routerImg.get('/api/imgs', (req, res) => {
    console.log(db);
    res.send(inspect(db));
});
routerImg.get('/api/imgs/:id', (req, res) => {
});
export default function (conn) {
    db = conn;
    return routerImg;
}
