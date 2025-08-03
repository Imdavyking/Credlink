import fs from "fs"
import path from "path"

export function saveJSONConfig(
    config: object,
    destinationFolder: string,
    fileName: string = "etherlink.json"
) {
    try {
        const destPath = path.join(__dirname, `../../${destinationFolder}/${fileName}`)
        fs.mkdirSync(path.dirname(destPath), { recursive: true })
        fs.writeFileSync(destPath, JSON.stringify(config, null, 2), "utf8")
        console.log(`✅ Config saved to ${destinationFolder}/${fileName}`)
    } catch (error: any) {
        console.error(`❌ Error saving config: ${error.message}`)
    }
}
