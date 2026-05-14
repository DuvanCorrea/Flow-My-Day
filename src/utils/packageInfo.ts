import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface PackageInfo {
  name: string;
  version: string;
}

export function getPackageInfo(moduleMetaUrl: string): PackageInfo {
  const moduleDir = path.dirname(fileURLToPath(moduleMetaUrl));
  const candidates = [
    path.resolve(moduleDir, "../../package.json"),
    path.resolve(moduleDir, "../../../package.json")
  ];

  for (const candidatePath of candidates) {
    try {
      if (!fs.existsSync(candidatePath)) {
        continue;
      }

      const parsed = JSON.parse(fs.readFileSync(candidatePath, "utf8")) as Partial<PackageInfo>;
      if (typeof parsed.name === "string" && typeof parsed.version === "string") {
        return {
          name: parsed.name,
          version: parsed.version
        };
      }
    } catch {
      // Try next candidate.
    }
  }

  return {
    name: "flow-my-day",
    version: "0.0.0"
  };
}
