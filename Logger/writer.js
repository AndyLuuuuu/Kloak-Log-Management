var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var fss = require('fs');
var path = require('path');
var https = require('https');
var faker = require('faker');
var uuidv4 = require('uuid').v4;
var connections = [];
var users = [];
var errors = [];
var time = 1580000000000;
var randUsers = null;
var randConnections = null;
var dir = [__dirname, 'sharedFolder', 'Log_Management', 'timestamp'];
// type users = {
//   email: string
//   fingerprint: string
//   time: number
// }
// function createRandUser(
//   num: number,
//   max: number,
//   users: Array<users>,
//   file: string,
//   date: number
// ) {
//   if (!fss.existsSync(`${dir}/${date}`)) {
//     fss.mkdir(`${dir}/${date}`, (err) => {
//       if (err) {
//         return
//       }
//     })
//     users.push({
//       email: faker.internet.email(),
//       fingerprint: uuidv4(),
//       time: date,
//     })
//   }
// }
// setInterval(() => {
//   const date = new Date().getTime()
//   //   if (!fss.existsSync(`${dir}/${date}`)) {
//   //     fss.mkdir(`${dir}/${date}`, (err) => {
//   //       if (err) {
//   //         return
//   //       }
//   //     })
//   //   }
//   //   users.map((n) => {
//   //     fss.appendFile(
//   //       `${dir}/${date}/users.txt`,
//   //       `${JSON.stringify(n)}\n`,
//   //       (err) => {
//   //         if (err) throw err
//   //         console.log('New data')
//   //       }
//   //     )
//   //   })
//   fss.mkdir(`${dir}/${date}/error_log`, (err) => {
//     if (err) {
//       return
//     }
//   })
// }, 11000)
setInterval(function () {
    //   users = []
    //   const date = new Date().getTime()
    //   randUsers = Math.floor(Math.random() * 10)
    //   for (let i = 0; i < randUsers; i++) {
    //     users.push({
    //       email: faker.internet.email(),
    //       fingerprint: uuidv4(),
    //       time: date,
    //     })
    //   }
    var date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);
    fss.mkdir(path.join.apply(path, __spreadArrays(dir, [date.getTime().toString()])), function (err) {
        if (err) {
            throw err;
        }
        fss.mkdir(path.join.apply(path, __spreadArrays(dir, [date.getTime().toString(), 'error_log'])), function (err) {
            if (err) {
                throw err;
            }
            var uuid = uuidv4();
            fss.writeFile(path.join.apply(path, __spreadArrays(dir, [date.getTime().toString(), 'error_log', uuid])), JSON.stringify({
                serverName: uuid,
                level: Math.floor(Math.random() * 4),
                detail: 'Some error message.',
                time: date.getTime().toString()
            }), function (err) {
                console.log(err);
            });
        });
    });
}, 60000);
