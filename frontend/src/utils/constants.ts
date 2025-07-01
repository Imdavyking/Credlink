// import usdc from "../assets/images/usdc.png";
import polkadot from "../assets/images/polkadot.png";
import { ethers } from "ethers";
export const tokens = [
  {
    name: "ETH",
    address: ethers.ZeroAddress,
    image: polkadot,
  },
];
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const SUBQUERY_ENDPOINT = import.meta.env.VITE_SUBQUERY_ENDPOINT;
export const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;
