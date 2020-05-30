const fss = require('fs')
const https = require('https')
const faker = require('faker')
const { v4: uuidv4 } = require('uuid')

let connections = []

let users = []
let errors = []

let time = 1580000000000
let randUsers: number = null
let randConnections: number = null

const dir = `./sharedFolder/Log_Management/timestamp`

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

setInterval(() => {
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

  const date = new Date().getTime()
  const err = {
    serverName: faker.company.companyName(),
    level: Math.floor(Math.random() * 4),
    detail: 'Some error message.',
    time: date,
  }
  fss.mkdir(`${dir}/${date}`, (err) => {
    console.log(err)
  })
  fss.appendFile(`${dir}/${date}/${uuidv4()}`, JSON.stringify(err), (err) => {
    console.log(err)
  })
}, 15000)
