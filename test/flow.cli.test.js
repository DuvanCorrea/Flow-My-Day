import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildHomeEnv,
  createSandbox,
  readJson,
  removeSandbox,
  runFlow,
  stripAnsi
} from "./helpers/cliTestUtils.js";

// Combines stdout and stderr and removes color codes for stable assertions.
function combineOutput(result) {
  return stripAnsi(`${result.stdout || ""}\n${result.stderr || ""}`);
}

// Verifies that global help includes the expected core commands.
test("help shows core commands", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));

  const result = runFlow(["--help"], { env: buildHomeEnv(sandbox.home) });

  assert.equal(result.status, 0);
  const output = combineOutput(result);
  assert.match(output, /add <text>/);
  assert.match(output, /later <text>/);
  assert.match(output, /debt <text>/);
  assert.match(output, /stats/);
  assert.match(output, /config/);
});

// Ensures that add/later/debt write data and stats --json reflects those entries.
test("add later debt persist and stats --json is correct", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Finished payment API"], { env }).status, 0);
  assert.equal(runFlow(["later", "Update incident documentation"], { env }).status, 0);
  assert.equal(runFlow(["debt", "Split date utilities module"], { env }).status, 0);

  const statsResult = runFlow(["stats", "--json"], { env });
  assert.equal(statsResult.status, 0, combineOutput(statsResult));

  const stats = JSON.parse(stripAnsi(statsResult.stdout).trim());
  assert.equal(stats.total, 3);
  assert.equal(stats.done, 1);
  assert.equal(stats.open, 2);
  assert.deepEqual(stats.byType, {
    done: 1,
    later: 1,
    debt: 1
  });
});

// Checks that marking a pending item as done updates status and doneAt.
test("done changes open item status", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["later", "Add export tests"], { env }).status, 0);

  const doneResult = runFlow(["done", "1"], { env });
  assert.equal(doneResult.status, 0, combineOutput(doneResult));

  const listResult = runFlow(["list", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));
  const items = JSON.parse(stripAnsi(listResult.stdout).trim());

  assert.equal(items.length, 1);
  assert.equal(items[0].id, 1);
  assert.equal(items[0].status, "done");
  assert.ok(items[0].doneAt);
});

// Ensures list output is grouped by section with emojis.
test("list groups items by section with emojis", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Closed onboarding bug"], { env }).status, 0);
  assert.equal(runFlow(["later", "Write release notes"], { env }).status, 0);
  assert.equal(runFlow(["debt", "Split billing helper"], { env }).status, 0);

  const listResult = runFlow(["list"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));

  const output = combineOutput(listResult);
  assert.match(output, /Later ⏳ \(1\)/);
  assert.match(output, /Done ✅ \(1\)/);
  assert.match(output, /Tech Debt 🧱 \(1\)/);
  assert.match(output, /\s-\s#\d+/);

  const laterPos = output.indexOf("Later ⏳");
  const donePos = output.indexOf("Done ✅");
  const debtPos = output.indexOf("Tech Debt 🧱");
  assert.ok(laterPos > -1 && donePos > -1 && debtPos > -1);
  assert.ok(laterPos < donePos && donePos < debtPos);
});

// Confirms config set/get persists user preferences in ~/.flow/config.json.
test("config set/get persists preferences", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const setResult = runFlow(["config", "set", "language", "en"], { env });
  assert.equal(setResult.status, 0, combineOutput(setResult));

  const getResult = runFlow(["config", "get", "language"], { env });
  assert.equal(getResult.status, 0, combineOutput(getResult));
  assert.equal(stripAnsi(getResult.stdout).trim(), "en");

  const configPath = path.join(sandbox.home, ".flow", "config.json");
  const config = readJson(configPath);
  assert.equal(config.language, "en");
});

// Validates markdown export output and output path creation.
test("export creates markdown at target path", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Prepare changelog"], { env }).status, 0);

  const outputRelative = path.join("reports", "daily.md");
  const exportResult = runFlow(["export", outputRelative, "-f", "md"], {
    env,
    cwd: sandbox.cwd
  });

  assert.equal(exportResult.status, 0, combineOutput(exportResult));

  const outputPath = path.join(sandbox.cwd, outputRelative);
  assert.equal(fs.existsSync(outputPath), true);

  const content = fs.readFileSync(outputPath, "utf8");
  assert.match(content, /^# Flow Daily Log/m);
  assert.match(content, /## Done/);
});

// Verifies auto-recovery when the data file is corrupted.
test("recovers from corrupt data file", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const flowDir = path.join(sandbox.home, ".flow");
  fs.mkdirSync(flowDir, { recursive: true });
  fs.writeFileSync(path.join(flowDir, "data.json"), "{", "utf8");

  const listResult = runFlow(["list", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));

  const items = JSON.parse(stripAnsi(listResult.stdout).trim());
  assert.deepEqual(items, []);

  const backups = fs.readdirSync(flowDir).filter((name) => name.startsWith("data.json.corrupt."));
  assert.ok(backups.length > 0);
});

// Ensures export rejects unsupported formats with a non-zero exit code.
test("rejects invalid export format", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const result = runFlow(["export", "-f", "xml"], { env, cwd: sandbox.cwd });

  assert.notEqual(result.status, 0);
  assert.match(combineOutput(result), /Invalid format/);
});
