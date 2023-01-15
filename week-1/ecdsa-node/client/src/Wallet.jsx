import { keccak256 } from "ethereum-cryptography/keccak";
import { getPublicKey, utils } from "ethereum-cryptography/secp256k1";
import { hexToBytes, toHex } from "ethereum-cryptography/utils";
import { useState } from "react";
import server from "./server";

function Wallet({
  privateKey,
  setPrivateKey,
  address,
  setAddress,
  balance,
  setBalance,
}) {
  const [generatedAddress, setGeneratedAddress] = useState("");

  async function addressChanged(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function privateKeyChanged(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    if (privateKey.length === 64) {
      const generatedAddress = getAddress(getPublicKey(hexToBytes(privateKey)));
      setGeneratedAddress(generatedAddress);
    } else {
      setGeneratedAddress("Private key must be 32 bytes in hex");
    }
  }

  async function generateKey(evt) {
    evt.preventDefault();
    const privateKey = utils.randomPrivateKey();
    const publicKey = getPublicKey(privateKey);
    const address = getAddress(publicKey);
    // manually trigger onChange events with fake event objects
    privateKeyChanged({ target: { value: toHex(privateKey) } });
    addressChanged({ target: { value: address } });
  }

  return (
    <form className="container wallet" onSubmit={generateKey}>
      <h1>Your Wallet</h1>

      <label>
        Address
        <input
          placeholder="Enter your address (in hex)"
          value={address}
          onChange={addressChanged}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder="Enter your private key (in hex)"
          value={privateKey}
          onChange={privateKeyChanged}
        ></input>
      </label>

      <label>Corresponding Address: {generatedAddress}</label>

      <div className="balance">Balance: {balance}</div>

      <input type="submit" className="button" value="Generate new key" />
    </form>
  );
}

function getAddress(publicKey) {
  return toHex(keccak256(publicKey.slice(1)).slice(-20));
}

export default Wallet;
