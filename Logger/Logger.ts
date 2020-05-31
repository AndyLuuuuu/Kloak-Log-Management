export {}
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
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
          `CREATE TABLE ${table} (id SERIAL, servername text, level integer, detail text, time timestamp)`
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

  insertIntoDB(folder: string, data: JSON, cb: Function) {
    switch (folder) {
      case 'error_log':
        // const query =
        //   'INSERT INTO errors(servername, level, detail, time) VALUES ($1, $2, $3, $4) returning *'
        // const values = Object.values(data)
        // this.dbClient.query(query, values).then((res) => {
        //   console.log(res.rows[0])
        //   cb()
        // })
        cb()
        break
      case 'users':
        break
      default:
        break
    }
  }

  readFiles() {
    fs.readdir(path.join(this.logDirectory), (err, files) => {
      if (err) {
        this.displayLog(`An error occured while reading ${this.logDirectory}`)
        throw err
      }
      if (files.length > 0) {
        let directories = [this.logDirectory]
        directories.push(files[0])
        fs.readdir(path.join(this.logDirectory, files[0]), (err, files) => {
          files.map((file) => {
            directories.push(file)
            fs.readdir(path.join(...directories), (err, files) => {
              files.map((file) => {
                console.log(file)
                fs.readFile(path.join(...directories, file), (err, data) => {
                  const callback = () => {
                    fs.unlink(path.join(...directories, file), (err) => {
                      if (err) {
                        return
                      }
                    })
                  }
                  this.insertIntoDB(
                    directories[directories.length - 1],
                    JSON.parse(data.toString()),
                    callback
                  )
                })
              })
              directories = directories.slice(0, directories.length - 1)
              console.log(directories)
              // fs.readFiles(path.join(this.logDirectory, parent, file, files))
            })
          })
        })
      }
    })
  }

  start() {
    const callback = () => {
      this.displayLog(`Automatically reading logs every ${this.interval}ms.`)
      this.intervalFn = setInterval(() => {}, this.interval)
    }
    callback()
    // this.connectToDB(callback)
    if (!this.interval) {
      throw console.error('Please set a interval time!')
    }
  }
}

const log = new Logger(
  'postgres://dwojrnzm:c-_JKegtgW88VTxBKskf5jWJSDSTHXLi@ruby.db.elephantsql.com:5432/dwojrnzm',
  300,
  './sharedFolder/Log_Management/timestamp'
)

log.readFiles()
