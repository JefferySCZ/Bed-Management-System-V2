const express = require('express')
const app = express()
const PORT = 8080
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use('/view', express.static('view'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

io.on('connection', (socket) => {
  console.log('A user connected')
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/view/dashboard.html', (err) => {
    if (err) {
      res.status(500).send(err)
    }
  })
})
console.log('__dirname is:', __dirname)
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
