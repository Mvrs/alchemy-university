import { useState } from "react";
import "./App.scss";
import Buy from "./Buy";
import Transfer from "./Transfer";
import Wallet from "./Wallet";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div>
      <div className="app">
        <Wallet
          balance={balance}
          setBalance={setBalance}
          address={address}
          setAddress={setAddress}
          privateKey={privateKey}
          setPrivateKey={setPrivateKey}
        />
      </div>
      <div className="app" style={{ marginTop: 10 }}>
        <Buy setBalance={setBalance} address={address} />
        <Transfer
          setBalance={setBalance}
          address={address}
          privateKey={privateKey}
        />
      </div>
    </div>
  );
}

export default App;
