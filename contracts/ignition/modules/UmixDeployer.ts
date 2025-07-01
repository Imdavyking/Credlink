import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"

dotenv.config()

const umixModule = buildModule("UmixModule", (m) => {
    const umixDeployer = m.contract("Umix", [])
    return { umixDeployer }
})

export default umixModule
