import { useState } from "react";
import server from "./server";

function Buy({ address, setBalance }) {
  const [amount, setAmount] = useState("");

  const setValue = setter => evt => setter(evt.target.value);

  async function buy(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`buy`, {
        address,
        amount: parseInt(amount),
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container buy" onSubmit={buy}>
      <h1>Buy Funds</h1>

      <label>
        Amount
        <input
          placeholder="1, 2, 3..."
          value={amount}
          onChange={setValue(setAmount)}
        ></input>
      </label>

      <input type="submit" className="button" value="Buy" />
    </form>
  );
}

export default Buy;
