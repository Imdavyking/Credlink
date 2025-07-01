import { BCS, getRustConfig } from "@benfen/bcs";
import { ethers } from "ethers";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
} from "viem";
import { publicActionsL2, walletActionsL2 } from "viem/op-stack";
import abi from "../assets/json/umix.json";
import { CONTRACT_ADDRESS } from "./constants";

export const umixInterface = new ethers.Interface(abi);

const bcs = new BCS(getRustConfig());
bcs.registerEnumType("SerializableTransactionData", {
  EoaBaseTokenTransfer: "",
  ScriptOrDeployment: "",
  EntryFunction: "",
  L2Contract: "",
  EvmContract: "Vec<u8>",
});

const serializeFunction = (data: string): `0x${string}` => {
  const code = Uint8Array.from(Buffer.from(data.replace("0x", ""), "hex"));
  const evmContract = bcs.ser("SerializableTransactionData", {
    EvmContract: code,
  });
  return `0x${evmContract.toString("hex")}`;
};

export const devnet = defineChain({
  id: 42069,
  sourceId: 42069,
  name: "Umi",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.uminetwork.com"],
    },
  },
});

export const getAccount = async () => {
  const [account] = await window.ethereum!.request({
    method: "eth_requestAccounts",
  });
  return account;
};

export const publicClient = () =>
  createPublicClient({
    chain: devnet,
    transport: custom(window.ethereum!),
  }).extend(publicActionsL2());

export const walletClient = () =>
  createWalletClient({
    chain: devnet,
    transport: custom(window.ethereum!),
  }).extend(walletActionsL2());

export const getFunction = async (name: string, ...args: any[]) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, umixInterface);
  const fn = contract.getFunction(name);
  if (!fn) throw new Error(`Function "${name}" not found in ABI`);

  const tx = await fn.populateTransaction(...args);

  return {
    to: tx.to as `0x${string}`,
    data: serializeFunction(tx.data),
  };
};
