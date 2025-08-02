import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"

dotenv.config()

const credLinkModule = buildModule("credLinkModule", (m) => {
    const credlinkDeployer = m.contract("Credlink", [])
    return { credlinkDeployer }
})

export default credLinkModule
