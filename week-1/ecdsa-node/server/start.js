const secp = require('ethereum-cryptography/secp256k1')
const { keccak256 } = require('ethereum-cryptography/keccak')

/**
 * Functions to generate random public / private keys pairs
 * and to load them with virtual token
 */

function getAddress(publicKey) {
  // Get 0x address from the pub key
  const pubKeyWithoutFormat = publicKey.slice(1)
  const hash = keccak256(pubKeyWithoutFormat)
  const addressHex = hash.slice(-20) // last 20 bytes

  const address = `0x${secp.utils.bytesToHex(addressHex)}`
  return address
}

async function generateRandomPKey() {
  // This function generates three random keys pairs
  const keyPairs = {}

  for (let index = 0; index < 3; index++) {
    const privateKey = secp.utils.randomPrivateKey()
    const publicKey = secp.getPublicKey(privateKey)
    const address = getAddress(publicKey)

    const privateKeyHex = secp.utils.bytesToHex(privateKey)

    keyPairs[`${address}`] = {
      privateKey: privateKeyHex,
      publicKey: secp.utils.bytesToHex(publicKey),
    }
  }

  return keyPairs
}

module.exports = {
  generateRandomPKey,
}