const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = 8080
const http = require('http').Server(app)
const WebSocket = require('ws')

app.use(express.static('public'))
app.use('/views', express.static('views'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/views/loginPage.html', (err) => {
    if (err) {
      res.status(500).send(err)
    }
  })
})
app.get('/dashboard', (_req, res) => {
  res.sendFile(__dirname + '/views/dashboard.html', (err) => {
    if (err) {
      res.status(500).send('Server Error')
    }
  })
})

app.post('/views', (_req, res) => {
  const { username, password } = _req.body

  if (username === 'admin' && password === 'admin') {
    // Authenticated user - send dashboard
    res.sendFile(__dirname + '/views/dashboard.html', (err) => {
      if (err) {
        res.status(500).send(err)
      }
    })
  } else {
    // Invalid credentials
    res.status(401).send('Invalid username or password')
  }
})

console.log('__dirname is:', __dirname)
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
