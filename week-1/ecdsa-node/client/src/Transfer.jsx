import { keccak256 } from "ethereum-cryptography/keccak";
import { getRandomBytesSync } from "ethereum-cryptography/random";
import { sign } from "ethereum-cryptography/secp256k1";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { useState } from "react";
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = setter => evt => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const privateKeyBytes = hexToBytes(privateKey);

    if (!sendAmount) alert("Specify an amount!");
    else if (privateKeyBytes.length != 32) alert("Invalid key length!");
    else if (!recipient.match(/[0-9A-F]{40}$/i))
      alert("Invalid address!\nAddress must be 20 bytes in hex");
    else if (!address.match(/[0-9A-F]{40}$/i))
      alert("Invalid recepient address!\nAddress must be 20 bytes in hex");
    else {
      const message = JSON.stringify({
        timestamp: Date.now(),
        sender: address,
        recipient,
        amount: parseInt(sendAmount),
        nonce: toHex(getRandomBytesSync(4)),
      });

      const [signature, recoveryBit] = await sign(
        keccak256(utf8ToBytes(message)),
        privateKeyBytes,
        { recovered: true },
      );

      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          signature: toHex(signature),
          recoveryBit,
          message,
        });
        setBalance(balance);
      } catch (ex) {
        alert(ex.response.data.message);
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address (in hex)"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
