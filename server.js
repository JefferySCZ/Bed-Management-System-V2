const express = require('express')
const app = express()
const PORT = 8080
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('A user connected')
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

app.get('/', (req, res) => {
  res.sendFIle(__dirname + '/public/index.html')
})

http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
