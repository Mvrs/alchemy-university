const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

/**
 * Functions to check broadcasted transactions of the network
 */

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

async function recoverKey(hash, signature, recoveryBit) {
  const publicKey = await secp.recoverPublicKey(hash, signature, recoveryBit);
  return secp.utils.bytesToHex(publicKey);
}

async function checkSignature(signature, hash, publicKey) {
  const isSigned = secp.verify(signature, hash, publicKey, { strict: true });
  return isSigned;
}

module.exports = {
  hashMessage,
  recoverKey,
  checkSignature,
};

