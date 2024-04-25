const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const fs = require("fs");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const wallets = JSON.parse(fs.readFileSync("./wallets.json", "utf-8"));

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = wallets[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  console.log(req.body);
  const { data, hash, sign } = req.body;
  const sender = data.sender;
  const recipient = data.recipient;
  const amount = data.amount;
  setInitialBalance(data.sender);
  setInitialBalance(data.recipient);

  const isValid = isValidTransaction(hash, sign, sender);
  if (!isValid) {
    res.status(400).send({ message: "Not a valid Sender" });
  }

  if (wallets[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    wallets[sender] -= amount;
    wallets[recipient] += amount;
    res.send({ balance: wallets[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!wallets[address]) {
    wallets[address] = 0;
  }
}

function isValidTransaction(hash, sign, sender) {
  const signature = Uint8Array.from(Object.values(sign[0]));
  const recoveryBit = sign[1];
  const recoveredPublicKey = secp.recoverPublicKey(
    hash,
    signature,
    recoveryBit
  );
  const isSigned = secp.verify(signature, hash, recoveredPublicKey);

  const isValidSender =
    sender.slice(2).toString() ===
    toHex(recoveredPublicKey.slice(1).slice(-20)).toString();

  return isValidSender && isSigned;
}
