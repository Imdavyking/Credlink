import {
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";

// Extend the Window interface to include the solana property
declare global {
  interface Window {
    solana?: any;
  }
}

const sendVersionedTransfer = async () => {
  const connection = new Connection("https://api.devnet.solana.com");

  // Connect to wallet (Phantom)
  const provider = window.solana;
  //   if (!provider?.isPhantom) {
  //     throw new Error("Phantom not found");
  //   }

  await provider.connect(); // Prompt user to connect
  const sender = new PublicKey(provider.publicKey.toString());

  // Recipient address (replace with any devnet address)
  const recipient = new PublicKey(
    "BgEiVNTmGxFi933sXRHhCHAUPEWk4nJTE61yo5QyS5Yv"
  );

  // Get blockhash & height
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("finalized");

  // Create transfer instruction
  const ix = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: 1000000, // 0.001 SOL
  });

  // Build the v0 message
  const messageV0 = new TransactionMessage({
    payerKey: sender,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();

  const v0Tx = new VersionedTransaction(messageV0);

  // Let Phantom sign the transaction
  const signedTx = await provider.signTransaction(v0Tx);

  // Send the transaction
  const sig = await connection.sendTransaction(signedTx, {
    maxRetries: 3,
    skipPreflight: false,
  });

  console.log("Sent versioned transaction:", sig);

  // Confirm transaction
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  console.log("Transaction confirmed!");
};

export default function SolHome() {
  return (
    <div>
      <h1>Solana Home</h1>
      <button onClick={sendVersionedTransfer}>Send Versioned Transfer</button>
    </div>
  );
}
