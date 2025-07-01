import hre, { ethers } from "hardhat"
import UmixDeployer from "../ignition/modules/UmixDeployer"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { cleanDeployments } from "../utils/clean"
import { updateEnv } from "./update.env"
import { copyABI } from "./copy.abi"
import { localHardhat } from "../utils/localhardhat.chainid"

dotenv.config()

async function main() {
    const chainId = network.config.chainId!

    cleanDeployments(chainId!)
    const { umixDeployer } = await hre.ignition.deploy(UmixDeployer)
    const umixAddress = await umixDeployer.getAddress()
    const chainName = process.env.CHAIN_NAME!
    const chainCurrencyName = process.env.CHAIN_CURRENCY_NAME!
    const chainSymbol = process.env.CHAIN_SYMBOL!
    console.log(`Umix deployed to: ${umixAddress}`)
    await verify(umixAddress, [])

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) return

    const blockNumber = await ethers.provider.getBlockNumber()
    const rpcUrl = (network.config as any).url
    const blockExplorerUrl = network.config.ignition.explorerUrl!
    /** contract address */
    updateEnv(umixAddress, "frontend", "VITE_CONTRACT_ADDRESS")
    updateEnv(umixAddress, "indexer", "CONTRACT_ADDRESS")

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

    copyABI("Umix", "frontend/src/assets/json", "umix")
    copyABI("Umix", "indexer/abis", "umix")
}

main().catch(console.error)
