export {}
const { Client } = require('pg')

const displayLog = (message: string) => {
  console.log(`[${new Date().toUTCString()}] ${message}`)
}

const connectToDB = (dbString: string, cb: Function) => {
  const dbClient = new Client({
    connectionString: dbString,
  })
  dbClient.connect()
  dbClient.query('SELECT NOW()', (err, res) => {
    if (err) {
      displayLog('Could not connect to database!')
      return
    }
    displayLog('Connected to database.')
    cb(dbClient)
  })
}

const getErrors = (db, cb: Function) => {
  return db.query(
    'SELECT id, serverName, level, detail, extract(epoch from time) as time FROM errors',
    (err, res) => {
      return res.rows
    }
  )
}

module.exports = {
  connectToDB,
  getErrors,
}
