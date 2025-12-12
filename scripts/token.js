import * as StellarSDK from "@stellar/stellar-sdk";

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// prepare keypairs
const issuerKeypair = StellarSDK.Keypair.fromSecret("SDPFJY4UWM6EVSG2Z3Z7PQJ5FMOGM37BFNKIXMOYPWSRX2OTDKSMVXGG"); // use actual secret key here
const distributorKeypair = StellarSDK.Keypair.fromSecret("SDYRY5NSWJSMC6F7FZE3R6WCXTHSXXAQQN5WK7ALHDQSOQITDD7DGQA5"); // use actual secret key here

// define a token
// token code should be alphanumeric and up to 12 characters, case sensitive
const issuerPublicKey = issuerKeypair.publicKey();
console.log("Issuer public key:", issuerPublicKey);
const customToken = new StellarSDK.Asset("GTSTORE", issuerPublicKey);
console.log("Custom token:", customToken.getCode(), customToken.getIssuer());

const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());

// look up base fee
const response = await server.ledgers().order("desc").limit(1).call();
const latestBlock = response.records[0];
const baseFee = latestBlock.base_fee_in_stroops;

// prepare a transaction that establishes trustline
const trustlineTransaction = new StellarSDK.TransactionBuilder(distributorAccount, {
  fee: baseFee,
  networkPassphrase: NETWORK_PASSPHRASE,
  timebounds: await server.fetchTimebounds(90),
})
  .addOperation(StellarSDK.Operation.changeTrust({ 
    asset: customToken,
    limit: "922337203685.4775807" // Maximum int64 value for unlimited trustline
  }))
  .build();

trustlineTransaction.sign(distributorKeypair);

// submit a tx
try {
  await server.submitTransaction(trustlineTransaction);
  console.log("Trustline created successfully");
} catch (error) {
  console.error("Error creating trustline:", error.response?.data || error.message);
  if (error.response?.data?.extras?.result_codes) {
    console.error("Result codes:", error.response.data.extras.result_codes);
  }
  throw error;
}

//====================================================================================
// now mint TestToken by sending from issuer account to distributor account

const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

const paymentTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
  fee: baseFee,
  networkPassphrase: NETWORK_PASSPHRASE,
  timebounds: await server.fetchTimebounds(90),
})
  .addOperation(
    StellarSDK.Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: customToken,
      amount: "100000000", // amount to mint
    })
  )
  .build();

paymentTransaction.sign(issuerKeypair);

// submit a tx
try {
  await server.submitTransaction(paymentTransaction);
  console.log("Token issued successfully");
} catch (error) {
  console.error("Error issuing token:", error.response?.data || error.message);
  if (error.response?.data?.extras?.result_codes) {
    console.error("Result codes:", error.response.data.extras.result_codes);
  }
  throw error;
}

// checking new balance of the distributor account
const updatedDistributorAccount = await server.loadAccount(distributorKeypair.publicKey());
updatedDistributorAccount.balances.forEach((balance) => {
  if (balance.asset_type === "native") {
    console.log(`GTSTORE Balance: ${balance.balance}`);
  } else {
    console.log(`${balance.asset_code} Balance: ${balance.balance}`);
  }
});