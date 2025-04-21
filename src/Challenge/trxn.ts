import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
const connection = new Connection("https://api.devnet.solana.com");
export async function sendtrasaction(
  privatekey: string,
  publicKey: string,
  Amount: number
) {
  try {
    const decodedKey = bs58.decode(privatekey);
    const keypair = Keypair.fromSecretKey(decodedKey);
    console.log("chekad");
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(publicKey),
        lamports: Math.floor(LAMPORTS_PER_SOL * Amount),
      })
    );
    const send = await connection.sendTransaction(transaction, [keypair]);
    console.log(send);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
export async function revertback(
  privatekey: string,
  publicKey: string,
  amount: number
) {
  const decodedKey = bs58.decode(privatekey);
  console.log(decodedKey);
  const secretkey = Keypair.fromSecretKey(decodedKey);
  console.log("secrret", secretkey);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: secretkey.publicKey,
      toPubkey: new PublicKey(publicKey),
      lamports: Math.floor(LAMPORTS_PER_SOL * amount),
    })
  );
  const sendtransaction = await sendAndConfirmTransaction(
    connection,
    transaction,
    [secretkey]
  );
  return sendtransaction;
}
export async function recivetransaction(
  privatekey: string,
  decoded: Transaction
) {
  try {
    const privateKeyArray = privatekey
      .split(",")
      .map((num) => parseInt(num, 10));
    const uintprivat = new Uint8Array(privateKeyArray);
    const secretkey = Keypair.fromSecretKey(uintprivat);
    const sendtrasaction = await sendAndConfirmTransaction(
      connection,
      decoded,
      [secretkey]
    );
    // console.log(sendtrasaction);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
