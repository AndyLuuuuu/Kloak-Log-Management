const { Client } = require('pg')

class Logger {
  private dbString: string
  private interval: number
  private logDirectory: string
  private intervalFn: NodeJS.Timer
  private dbClient
  constructor(dbString: string, interval: number, logDirectory: string) {
    this.dbString = dbString
    this.interval = interval
    this.logDirectory = logDirectory
  }

  createTable(table: string) {
    switch (table) {
      case 'errors':
        this.dbClient.query(
          `CREATE TABLE ${table} (id SERIAL, level integer, detail text, time timestamp)`
        )
        break
      case 'userCount':
        this.dbClient.query(
          `CREATE TABLE ${table} (id SERIAL, active integer, idle int, time timestamp)`
        )
        break
      default:
        return
    }
  }

  displayLog(message: string) {
    console.log(`[${new Date().toUTCString()}] ${message}`)
  }

  checkTables(cb: Function) {
    this.dbClient.query('SELECT * FROM usercount', (err, res) => {
      if (err) {
        this.createTable('userCount')
        this.displayLog('Created USERCOUNT table.')
      }
    })
    this.dbClient.query('SELECT * FROM errors', (err, res) => {
      if (err) {
        this.createTable('errors')
        this.displayLog('Created ERRORS table.')
      }
    })
    cb()
  }

  connectToDB(cb: Function) {
    this.dbClient = new Client({
      connectionString: this.dbString,
    })
    this.dbClient.connect()
    this.dbClient.query('SELECT NOW()', (err, res) => {
      if (!err) {
        this.displayLog('Connected to database.')
        this.checkTables(cb)
      }
    })
  }

  readFile() {}

  start() {
    const callback = () => {
      this.displayLog(`Automatically reading logs every ${this.interval}ms.`)
      this.intervalFn = setInterval(() => {}, this.interval)
    }
    this.connectToDB(callback)
    if (!this.interval) {
      throw console.error('Please set a interval time!')
    }
  }
}
