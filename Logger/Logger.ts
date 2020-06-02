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
  private folderNames: Array<string>
  private pause: boolean = false
  constructor(
    dbString: string,
    interval: number,
    logDirectory: string,
    folderNames: Array<string>
  ) {
    this.dbString = dbString
    this.interval = interval
    this.logDirectory = logDirectory
    this.folderNames = folderNames
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  displayLog(message: string) {
    console.log(`[${new Date().toUTCString()}] ${message}`)
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

  insertIntoDB(folder: string, data: JSON, fileName: string, cb: Function) {
    switch (folder) {
      case 'error_log':
        const query =
          'INSERT INTO errors(servername, level, detail, time) VALUES ($1, $2, $3, to_timestamp($4)) returning *'
        const values = Object.values(data)
        this.dbClient.query(query, values).then((res) => {
          cb(fileName)
        })
        break
      case 'users':
        break
      default:
        break
    }
    // cb(fileName)
  }

  readFiles(filePath: string, folderName: string, deleteFolder: Function) {
    const cb = (file: string) => {
      fs.unlink(path.join(filePath, file), (err) => {
        if (err) {
          console.log(err)
        }
        this.displayLog(`Deleted ${path.join(filePath, file)}`)
        checkFolder(filePath)
      })
    }

    const checkFolder = (filePath: string) => {
      fs.readdir(filePath, (err, files) => {
        console.log('second read', files)
        if (err) {
          this.displayLog(`An error occured while reading ${path}`)
          return
        }
        if (files.length === 0) {
          deleteFolder(filePath)
        }
      })
    }
    fs.readdir(filePath, (err, files) => {
      if (err) {
        this.displayLog(`An error occured while reading ${path}`)
        throw err
      }
      if (files.length > 0) {
        files.map((file) => {
          fs.readFile(path.join(filePath, file), async (err, data) => {
            this.insertIntoDB(folderName, JSON.parse(data.toString()), file, cb)
            await this.sleep(250)
          })
        })
      }
    })
  }

  readFolders() {
    this.pause = true
    const deleteFolder = (folder: string) => {
      fs.rmdir(folder, (err) => {
        if (err) {
          this.displayLog(`An error occured while deleting ${folder}.`)
          throw err
        }
        this.displayLog(`Deleted ${folder}.`)
        fs.rmdir(path.join(folder, '..'), (err) => {
          if (err) {
            return
          }
          this.displayLog(`Deleted ${path.join(folder, '..')}.`)
        })
      })
    }
    let timestamps: Array<string> = []
    fs.readdir(path.join(this.logDirectory), (err, folders) => {
      if (err) {
        this.displayLog(`An error occured while reading ${this.logDirectory}.`)
        throw err
      }
      if (folders.length > 0) {
        timestamps = folders
        timestamps.map((timestamp) => {
          if (timestamp !== '.DS_Store') {
            fs.readdir(
              path.join(this.logDirectory, timestamp),
              (err, folders) => {
                if (err) {
                  this.displayLog(
                    `An error occured while reading ${path.join(
                      this.logDirectory,
                      timestamp
                    )}.`
                  )
                  throw err
                }
                if (folders.length > 0) {
                  folders.map((folder) => {
                    if (this.folderNames.includes(folder)) {
                      this.readFiles(
                        path.join(this.logDirectory, timestamp, folder),
                        folder,
                        deleteFolder
                      )
                    }
                  })
                }
                fs.rmdir(path.join(this.logDirectory, timestamp), (err) => {
                  this.displayLog(
                    `Deleted ${path.join(this.logDirectory, timestamp)}.`
                  )
                })
              }
            )
          }
        })
      }
    })
    this.pause = false
  }

  start() {
    const callback = () => {
      this.displayLog(`Automatically reading logs every ${this.interval}ms.`)
      this.intervalFn = setInterval(() => {
        if (!this.pause) {
          this.readFolders()
        }
      }, this.interval)
    }
    this.connectToDB(callback)
    if (!this.interval) {
      throw console.error('Please set a interval time!')
    }
  }

  stop() {
    if (!this.intervalFn) {
      this.displayLog(`You don't have a running logger!`)
      return
    }
    clearInterval(this.intervalFn)
  }
}

if (process.argv.slice(2)[0].length < 30) {
  console.log('Please enter a database connection string!')
  throw Error
}

// How to run script...
// node Logger.js yourPostgreSQL connection string.

const log = new Logger(
  process.argv.slice(2)[0],
  60000,
  './sharedFolder/Log_Management/timestamp',
  ['error_log']
)

log.start()
