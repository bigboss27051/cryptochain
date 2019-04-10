const Block = require('./block')
const { GENESIS_DATA, MINE_RATE } = require('./config')
const cryptoHash = require('./crypto-hash')
const hexToBinary = require('hex-to-binary')

describe('Block', () => {
  const timestamp = 2000
  const lastHash = 'last-hash'
  const hash = 'hash'
  const data = ['blockchain', 'data-chain']
  const nonce = 1
  const difficulty = 1
  const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty })

  it('has a timestamp, lastHash, hash and data property', () => {
    expect(block.timestamp).toEqual(timestamp)
    expect(block.lastHash).toEqual(lastHash)
    expect(block.hash).toEqual(hash)
    expect(block.data).toEqual(data)
    expect(block.nonce).toEqual(nonce)
    expect(block.difficulty).toEqual(difficulty)
  })

  describe('genesis()', () => {
    const genesisBlock = Block.genesis()
    it('return a Block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true)
    })

    it('return the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA)
    })
  })

  describe('mineBlock', () => {
    const lastBlock = Block.genesis()
    const data = 'mined data'
    const mineBlock = Block.mineBlock({ lastBlock, data })

    it('return a Block instance', () => {
      expect(mineBlock instanceof Block).toBe(true)
    })

    it(`set the 'lastHash' to be the 'hash' of the last block`, () => {
      expect(mineBlock.lastHash).toEqual(lastBlock.hash)
    })

    it(`set the 'data'`, () => {
      expect(mineBlock.data).toEqual(data)
    })

    it('set a timestamp', () => {
      expect(mineBlock.timestamp).not.toEqual(undefined)
    })

    it(`create a SHA-256 'hash' base on proper inputs`, () => {
      expect(mineBlock.hash)
        .toEqual(
          cryptoHash(
            mineBlock.timestamp,
            mineBlock.nonce,
            mineBlock.difficulty,
            lastBlock.hash,
            data
          )
        )
    })

    it(`set a 'hash' that match difficulty criteria`, () => {
      expect(hexToBinary(mineBlock.hash).substring(0, mineBlock.difficulty))
        .toEqual('0'.repeat(mineBlock.difficulty))
    })

    it('adjust the difficulty', () => {
      const possibleResult = [lastBlock.difficulty + 1, lastBlock.difficulty - 1]
      expect(possibleResult.includes(mineBlock.difficulty)).toBe(true)
    })

  })

  describe('adjustDifficulty', () => {
    it('raise the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
      })).toEqual(block.difficulty + 1)
    })

    it('lower the difficulty for a slowly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
      })).toEqual(block.difficulty - 1)
    })

    it('has a lower limit of 1', () => {
      block.difficulty = - 1
      expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1)
    })
  })

  
})

