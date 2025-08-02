// import usdc from "../assets/images/usdc.png";
import { createThirdwebClient, getContract } from "thirdweb";
import logo from "../assets/images/umi.svg";
import { ethers } from "ethers";
import { etherlinkTestnet } from "thirdweb/chains";
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

export const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
export const THIRDWEB_CLIENT = createThirdwebClient({
  clientId: CLIENT_ID,
});

export const credLinkContract = getContract({
  address: CONTRACT_ADDRESS,
  chain: etherlinkTestnet,
  client: THIRDWEB_CLIENT,
});
