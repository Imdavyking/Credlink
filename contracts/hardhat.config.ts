import { HardhatUserConfig, extendEnvironment } from "hardhat/config"
import { createProvider } from "hardhat/internal/core/providers/construction"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider"
import dotenv from "dotenv"
import { initKeystore } from "./utils/init.keystore"

dotenv.config()

const wallet = initKeystore(null)
const networkName = process.env.NETWORK_NAME || "umi"
const RPC_URL = process.env.RPC_URL
const CHAIN_ID = process.env.CHAIN_ID
const API_URL = process.env.API_URL
const BROWSER_URL = process.env.BROWSER_URL || ""
const API_SCAN_VERIFIER_KEY = process.env.API_SCAN_VERIFIER_KEY || ""

if (!RPC_URL) {
    throw new Error("RPC_URL is not set")
}

if (!CHAIN_ID) {
    throw new Error("CHAIN_ID is not set")
}

if (!API_URL) {
    throw new Error("API_URL is not set")
}

if (!BROWSER_URL) {
    throw new Error("BROWSER_URL is not set")
}

if (!API_SCAN_VERIFIER_KEY) {
    throw new Error("API_SCAN_VERIFIER_KEY is not set, used to verify contracts on explorer")
}

declare module "hardhat/types/runtime" {
    export interface HardhatRuntimeEnvironment {
        changeNetwork: Function
    }
}

extendEnvironment(async (hre) => {
    hre.changeNetwork = async function changeNetwork(newNetwork: string) {
        if (!this.config.networks[newNetwork]) {
            throw new Error(`changeNetwork: Couldn't find network '${newNetwork}'`)
        }
        const providers: any = {}
        if (!providers[this.network.name]) {
            providers[this.network.name] = this.network.provider
        }
        this.network.name = newNetwork
        this.network.config = this.config.networks[newNetwork]

        if (!providers[newNetwork]) {
            providers[newNetwork] = await createProvider(this.config, newNetwork, this.artifacts)
        }
        this.network.provider = providers[newNetwork]
        if (this.ethers) {
            this.ethers.provider = new HardhatEthersProvider(this.network.provider, newNetwork)
        }
    }
})

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        [networkName]: {
            url: process.env.RPC_URL,
            accounts: [wallet.privateKey],
            chainId: +CHAIN_ID!,
            ignition: {
                explorerUrl: process.env.CHAIN_BLOCKEXPLORER_URL,
            },
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    etherscan: {
        apiKey: {
            [networkName]: API_SCAN_VERIFIER_KEY,
        },
        customChains: [
            {
                network: networkName,
                chainId: +CHAIN_ID!,
                urls: {
                    apiURL: API_URL,
                    browserURL: BROWSER_URL,
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
}

export default config
