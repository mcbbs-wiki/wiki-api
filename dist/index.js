import express from 'express';
import sqlite3 from 'sqlite3';
import { Config } from './config.js';
import img from './routers/img.js';
const config = new Config('./config.json');
const db = new sqlite3.Database(config.dbpath);
const app = express();
app.use('/static', express.static('./public'));
app.use(img(db));
const server = app.listen(config.port);
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Shuting down');
    });
});
