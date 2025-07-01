import { ethers } from "hardhat"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { cleanDeployments } from "../utils/clean"
import { updateEnv } from "./update.env"
import { copyABI } from "./copy.abi"
import { BCS, getRustConfig } from "@benfen/bcs"
import { localHardhat } from "../utils/localhardhat.chainid"

dotenv.config()
const bcs = new BCS(getRustConfig())
bcs.registerEnumType("ScriptOrDeployment", {
    Script: "",
    Module: "",
    EvmContract: "Vec<u8>",
})

bcs.registerEnumType("SerializableTransactionData", {
    EoaBaseTokenTransfer: "",
    ScriptOrDeployment: "",
    EntryFunction: "",
    L2Contract: "",
    EvmContract: "Vec<u8>",
})

async function main() {
    const chainId = network.config.chainId!
    cleanDeployments(chainId!)
    const umixFactory = await ethers.getContractFactory("Umix")
    const code = serialize(umixFactory.bytecode)
    console.log("CODE:", code)
    const umixCode = await umixFactory.deploy()
    await umixCode.waitForDeployment()
    const umixAddress = await umixCode.getAddress()
    console.log("Umix is deployed to:", umixAddress)
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

const serialize = (bytecode: string): string => {
    // Extract the byte array to serialize within the higher level enum
    const code = Uint8Array.from(Buffer.from(bytecode.replace("0x", ""), "hex"))
    const evmContract = bcs.ser(
        "ScriptOrDeployment",
        { EvmContract: code },
        {
            maxSize: 1000000,
        }
    )
    return "0x" + evmContract.toString("hex")
}
main().catch(console.error)
