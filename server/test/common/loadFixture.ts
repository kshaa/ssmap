import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadFixture = async (name: string): Promise<string> => {
    return await fs.readFile(path.join(__dirname, '..', 'fixtures', name), 'utf8');
};
