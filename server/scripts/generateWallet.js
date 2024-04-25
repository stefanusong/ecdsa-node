const { utils, getPublicKey } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const fs = require("fs");

function generateKeys(count) {
  const address = {};
  const privateKeyMapping = {};
  var privateKey;
  var publicKey;
  var walletAddress;

  for (let i = 0; i < count; i++) {
    privateKey = utils.randomPrivateKey();
    publicKey = getPublicKey(privateKey);
    walletAddress = `0x${toHex(publicKey.slice(1).slice(-20))}`;
    address[walletAddress] = Math.floor(Math.random() * 100) + 50;
    privateKeyMapping[walletAddress] = toHex(privateKey);
  }

  return { address, privateKeyMapping };
}

async function generateWallet(count) {
  const { address, privateKeyMapping } = generateKeys(count);
  fs.writeFileSync("../wallets.json", JSON.stringify(address), "utf-8");
  fs.writeFileSync("../keys.json", JSON.stringify(privateKeyMapping), "utf-8");
}

generateWallet(3);
