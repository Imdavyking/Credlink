import path from "path";
import fs from "fs";

export const cleanDB = () => {
  try {
    const dbFolder = path.join(process.cwd(), ".data");
    if (fs.existsSync(dbFolder)) {
      console.log(`🗑️ Deleting folder: ${dbFolder}`);
      fs.rmSync(dbFolder, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error cleaning the database", error);
  }
};
