import { BrowserProvider, ethers } from "ethers";
import { createPublicClient, custom, defineChain } from "viem";
import { publicActionsL2 } from "viem/op-stack";
import abi from "../assets/json/credlink.json";
import { etherlinkTestnet } from "thirdweb/chains";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const etherlinkTestnetViem = defineChain({
  id: 128123,
  sourceId: 128123,
  name: "XTZ",
  nativeCurrency: {
    decimals: 18,
    name: "Etherlink Testnet",
    symbol: "XTZ",
  },
  rpcUrls: {
    default: {
      http: ["https://node.ghostnet.etherlink.com"],
    },
  },
});

async function switchOrAddChain(
  ethProvider: ethers.JsonRpcApiProvider,
  switchChainId: string | number
) {
  try {
    const currentChainId = Number(
      await ethProvider.provider.send("eth_chainId", [])
    );
    const targetChainId = Number(switchChainId);
    const chainIdHex = `0x${targetChainId.toString(16)}`;

    console.log(
      `Current chainId: ${currentChainId}, Switch chainId: ${targetChainId}`
    );

    if (currentChainId === targetChainId) {
      console.log(`Already connected to ${targetChainId}`);
      return;
    }

    try {
      await ethProvider.provider.send("wallet_switchEthereumChain", [
        { chainId: chainIdHex },
      ]);
      console.log(`Switched to ${targetChainId}`);
    } catch (error: any) {
      console.error(`Error switching chain:`, error);

      if (error.code === 4902) {
        console.log(`Chain ${targetChainId} not found. Attempting to add.`);

        if (targetChainId === Number(etherlinkTestnet.id)) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            {
              chainId: chainIdHex,
              chainName: etherlinkTestnet.name,
              nativeCurrency: {
                name: etherlinkTestnet.nativeCurrency?.name,
                symbol: etherlinkTestnet.nativeCurrency?.symbol,
                decimals: 18,
              },
              rpcUrls: [etherlinkTestnet.rpc],
              blockExplorerUrls: [
                etherlinkTestnet.blockExplorers?.[0]?.url || "",
              ],
            },
          ]);
          console.log(`${etherlinkTestnet.id} added and switched`);
        }
      } else {
        console.error(`Failed to switch to ${targetChainId}:`, error);
      }
    }
  } catch (error) {
    console.error(`Unexpected error in switchOrAddChain:`, error);
  }
}

export const getAccount = async () => {
  const [account] = await window.ethereum!.request({
    method: "eth_requestAccounts",
  });
  return account;
};

export const publicClient = () =>
  createPublicClient({
    chain: etherlinkTestnetViem,
    transport: custom(window.ethereum!),
  }).extend(publicActionsL2());

export const getSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};
