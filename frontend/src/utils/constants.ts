// import usdc from "../assets/images/usdc.png";
import { createThirdwebClient, getContract } from "thirdweb";
import logo from "../assets/images/etherlink.jpg";
import { ethers } from "ethers";
import { etherlinkTestnet } from "thirdweb/chains";
import credLinkAbi from "../assets/json/credlink.json";

export const NATIVE_TOKEN_ADDRESS = ethers.ZeroAddress;
export const tokens = [
  {
    name: "XTZ",
    address: NATIVE_TOKEN_ADDRESS,
    image: logo,
  },
];
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const GOLDSKY_ENDPOINT = import.meta.env.VITE_GOLDSKY_ENDPOINT;
export const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
export const THIRDWEB_CLIENT = createThirdwebClient({
  clientId: CLIENT_ID,
});

export const credLinkThirdWeb = getContract({
  abi: credLinkAbi as any,
  address: CONTRACT_ADDRESS,
  chain: etherlinkTestnet,
  client: THIRDWEB_CLIENT,
});

export const isNativeTokenAddressCred = (address: string) => {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
};
