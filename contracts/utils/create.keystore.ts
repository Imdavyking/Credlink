import { ethers } from "ethers"
import fs from "fs"
import path from "path"

// Function to create a keystore file
export const createKeystore = ({
    privateKey,
    password,
    outputFile,
}: {
    privateKey: string
    password: string
    outputFile?: string
}) => {
    try {
        if (!privateKey || !password) {
            throw new Error("❌ Missing private key or password.")
        }

        console.info("🔐 Creating keystore...")

        const wallet = new ethers.Wallet(privateKey)
        const keystore = wallet.encryptSync(password)
        const keyStoreFile = path.join(process.cwd(), outputFile || "keystore.json")

        // Save keystore to a file
        fs.writeFileSync(keyStoreFile, keystore)

        console.log(`✅ Keystore created successfully!`)
        console.log(`📂 Saved at: ${keyStoreFile}`)
        console.log(`📜 Wallet Address: ${wallet.address}`)
    } catch (error: any) {
        console.error("❌ Failed to create keystore:", error.message)
        process.exit(1)
    }
}

// Check if running from CLI
if (require.main === module) {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        console.error("❌ Usage: yarn keystore:create <PRIVATE_KEY> <PASSWORD> [OUTPUT_FILE]")
        process.exit(1)
    }

    const [privateKey, password, outputFile] = args
    createKeystore({ privateKey, password, outputFile })
}
