const keys = require('./keys')

// Express App Setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Postgres Client Setup
const { Pool } = require('pg')
const pgPool = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  user: keys.pgUser,
  password: keys.pgPassword,
  database: keys.pgDatabase
})

var pgClient

// Capture and log any errors
pgPool.on('error', (err, client) => {
  console.log('API: Unexpected error on Postgres Pool idle client', err)
  process.exit(-1)
})

// On any connect (first connection) check to see if we have our table defined
pgPool.on('connect', (client) => {
  console.log('Seeing if our table exists and creating if it does not..')
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .then((res) => console.log('RESULT OF CREATE TABLE IS ', res))
    .catch((err) => console.log('*** ERROR!!! ***', err))
})

// Get a client connection
console.log('API -- Forcing a client connection')
pgPool.connect().then((client) => (pgClient = client))

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values')

  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = req.body.index

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high')
  }

  redisClient.hset('values', index, 'Nothing yet!')
  redisPublisher.publish('insert', index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.send({ working: true })
})

app.listen(5000, (err) => {
  console.log('Listening')
})
