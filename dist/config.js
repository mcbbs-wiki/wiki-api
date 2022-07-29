import fs from 'fs';
export class Config {
    dbpath = './db.db';
    users = [{ username: 'user', password: '123456' }];
    port = 8080;
    constructor(path) {
        try {
            fs.statSync(path);
        }
        catch {
            fs.writeFileSync(path, JSON.stringify(this));
        }
    }
}
