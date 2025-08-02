// import usdc from "../assets/images/usdc.png";
import logo from "../assets/images/umi.svg";
import { ethers } from "ethers";
export const tokens = [
  {
    name: "XTZ",
    address: ethers.ZeroAddress,
    image: logo,
  },
];
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const GOLDSKY_ENDPOINT = import.meta.env.VITE_GOLDSKY_ENDPOINT;
export const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;
