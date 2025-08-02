import hre, { ethers } from "hardhat"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { cleanDeployments } from "../utils/clean"
import { updateEnv } from "./update.env"
import { copyABI } from "./copy.abi"
import { localHardhat } from "../utils/localhardhat.chainid"
import credLinkModule from "../ignition/modules/CredLinkDeployer"

dotenv.config()

async function main() {
    const chainId = network.config.chainId!
    cleanDeployments(chainId!)
    console.log("Deploying contract...")
    const { credlinkDeployer } = await hre.ignition.deploy(credLinkModule)
    await credlinkDeployer.waitForDeployment()
    const credlinkAddress = await credlinkDeployer.getAddress()
    console.log("credLink is deployed to:", credlinkAddress)
    const chainName = process.env.CHAIN_NAME!
    const chainCurrencyName = process.env.CHAIN_CURRENCY_NAME!
    const chainSymbol = process.env.CHAIN_SYMBOL!
    console.log(`credLink deployed to: ${credlinkAddress}`)
    await verify(credlinkAddress, [])

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) return

    const blockNumber = await ethers.provider.getBlockNumber()
    const rpcUrl = (network.config as any).url
    const blockExplorerUrl = network.config.ignition.explorerUrl!
    /** contract address */
    updateEnv(credlinkAddress, "frontend", "VITE_CONTRACT_ADDRESS")
    updateEnv(credlinkAddress, "indexer", "CONTRACT_ADDRESS")

    /** block number */
    updateEnv(blockNumber.toString(), "indexer", "BLOCK_NUMBER")
    /** chainid */
    updateEnv(chainId!.toString()!, "frontend", "VITE_CHAIN_ID")
    updateEnv(chainId!.toString()!, "indexer", "CHAIN_ID")
    /** rpc url */
    updateEnv(rpcUrl, "frontend", "VITE_RPC_URL")
    updateEnv(rpcUrl, "indexer", "RPC_URL")
    /** block explorer url (3091) */
    updateEnv(blockExplorerUrl, "frontend", "VITE_CHAIN_BLOCKEXPLORER_URL")
    /** update chain name */
    updateEnv(chainName, "frontend", "VITE_CHAIN_NAME")
    /** update chain currency name */
    updateEnv(chainCurrencyName, "frontend", "VITE_CHAIN_CURRENCY_NAME")
    /** update chain currency name */
    updateEnv(chainSymbol, "frontend", "VITE_CHAIN_SYMBOL")

    copyABI("Credlink", "frontend/src/assets/json", "credlink")
    copyABI("Credlink", "indexer/abis", "credlink")
}

main().catch(console.error)
