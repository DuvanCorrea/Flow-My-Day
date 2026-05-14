import chalk from "chalk";
import { createInterface } from "node:readline/promises";
import type { Project } from "../domain/activity.js";
import { t } from "./messages.js";

interface RuntimeConfig {
  language: string;
  tone: string;
}

export function canPromptProjectSelection(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export async function promptProjectSelection(config: RuntimeConfig, projects: Project[]): Promise<number | null> {
  console.log(chalk.cyan(t(config, "projectSelectionTitle")));
  console.log(`  0) ${t(config, "projectNoneOption")}`);
  for (const project of projects) {
    console.log(`  ${project.id}) ${project.name}`);
  }

  const promptText = `${t(config, "projectSelectionPrompt")} `;
  const validIds = new Set(projects.map((project) => project.id));
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    while (true) {
      const answer = (await rl.question(promptText)).trim();
      if (!/^[+-]?\d+$/.test(answer)) {
        console.log(chalk.red(t(config, "projectSelectionInvalid")));
        continue;
      }

      const id = Number(answer);
      if (!Number.isSafeInteger(id) || id < 0) {
        console.log(chalk.red(t(config, "projectSelectionInvalid")));
        continue;
      }

      if (id === 0) {
        return null;
      }

      if (validIds.has(id)) {
        return id;
      }

      console.log(chalk.red(t(config, "projectSelectionInvalid")));
    }
  } finally {
    rl.close();
  }
}
