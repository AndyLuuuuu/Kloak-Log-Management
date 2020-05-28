const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'views')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.listen(PORT, () => {
  console.log(`Server is up on PORT ${PORT}`)
})
