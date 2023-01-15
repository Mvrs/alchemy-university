const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const { json } = require("express");

app.use(cors());
app.use(express.json());

const balances = {};
const lastSecNonces = [];

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log(address, ":", balances[address]);
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/buy", (req, res) => {
  const { address, amount } = req.body;
  if (amount < 1) {
    res.status(400).send({ message: "Enter a positive amount!" });
  } else {
    balances[address] ??= 0;
    balances[address] += amount;
    console.log(address, ":", balances[address]);
    res.send({ balance: balances[address] });
  }
});

app.post("/send", (req, res) => {
  const { signature, recoveryBit, message } = req.body;
  const transaction = JSON.parse(message);

  // replay attack protection
  const timeMillis = Date.now;
  if (timeMillis - transaction.timestamp > 1000) {
    res.status(400).send({ message: "Request Timedout!\nProtection against replay attacks" });
    return;
  } else {
    lastSecNonces.filter(e => timeMillis - e.timeMillis < 1000);
    if (lastSecNonces.find(e => e.nonce === transaction.nonce)) {
      res.status(400).send({ message: "Repeated Nonce!\nProtection against replay attacks" });
      return;
    }
  }
  lastSecNonces.push({ nonce: transaction.nonce, timeMillis: Date.now });

  // derive sender address from signature
  setInitialBalance(transaction.sender);
  setInitialBalance(transaction.recipient);
  const hash = keccak256(utf8ToBytes(message));
  const publicKey = secp.recoverPublicKey(hash, signature, recoveryBit);
  const address = getAddress(publicKey);

  if (address !== transaction.sender) {
    res.status(400).send({ message: "Invalid Signature!\nDerived address doesn't match sender address" })
  } else if (transaction.amount < 1) {
    res.status(400).send({ message: "Enter a positive amount!\nCheeky bastard ;)" });
  } else if (balances[transaction.sender] < transaction.amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[transaction.sender] -= transaction.amount;
    balances[transaction.recipient] += transaction.amount;
    res.send({ balance: balances[transaction.sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getAddress(publicKey) {
  return toHex(keccak256(publicKey.slice(1)).slice(-20));
}