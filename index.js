const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const PubSub = require('./pubsub')
const request = require('request')
const DEFAULT_PORT = 3001

const app = express()
const blockchain = new Blockchain()
const pubsub = new PubSub({ blockchain })

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`


app.use(bodyParser.json())

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
  const { data } = req.body
  blockchain.addBlock({ data })
  pubsub.broadcastChain()
  res.redirect('/api/blocks')
})

const synceChains = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
    if(!error && response.statusCode === 200){
      const rootChain = JSON.parse(body)
      console.log('replace chain on a sync with', rootChain)
      blockchain.replaceChain(rootChain)
    }
  })
}

let PEER_PORT
console.log('process.env.GENERATE_PEER_PORT ', process.env.GENERATE_PEER_PORT )
if (process.env.GENERATE_PEER_PORT === 'true') {
  console.log('set peer')
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT
app.listen(PORT, () => {
  console.log(`server running PORT: ${PORT}`)

  if(PORT !== DEFAULT_PORT){
    synceChains()
  }
})
