import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";
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
  assert.match(output, /add \[options\] <text>/);
  assert.match(output, /later \[options\] <text>/);
  assert.match(output, /debt \[options\] <text>/);
  assert.match(output, /edit \[options\] <id>/);
  assert.match(output, /project\s+Manage projects/);
  assert.match(output, /stats/);
  assert.match(output, /config/);
  assert.match(output, /versions/);
  assert.match(output, /update \[options\] \[version\]/);
});

// Verifies that short and long version flags both return the package version.
test("version flags -V and --version work", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const shortResult = runFlow(["-V"], { env });
  const longResult = runFlow(["--version"], { env });

  assert.equal(shortResult.status, 0, combineOutput(shortResult));
  assert.equal(longResult.status, 0, combineOutput(longResult));

  const shortVersion = stripAnsi(shortResult.stdout).trim();
  const longVersion = stripAnsi(longResult.stdout).trim();

  assert.match(shortVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(longVersion, shortVersion);
});

// Verifies that short and long help flags both show usage output.
test("help flags -h and --help work", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const shortResult = runFlow(["-h"], { env });
  const longResult = runFlow(["--help"], { env });

  assert.equal(shortResult.status, 0, combineOutput(shortResult));
  assert.equal(longResult.status, 0, combineOutput(longResult));

  const shortOutput = combineOutput(shortResult);
  const longOutput = combineOutput(longResult);

  assert.match(shortOutput, /(Usage|Uso): flow \[options\] \[command\]/);
  assert.match(longOutput, /(Usage|Uso): flow \[options\] \[command\]/);
  assert.match(shortOutput, /-V, --version/);
  assert.match(longOutput, /-h, --help/);
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
  assert.equal(items[0].type, "done");
  assert.equal(items[0].status, "done");
  assert.ok(items[0].doneAt);
});

// Ensures done rejects invalid ids with a clear validation error.
test("done rejects invalid item id", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const doneResult = runFlow(["done", "0"], { env });

  assert.equal(doneResult.status, 1, combineOutput(doneResult));
  assert.match(combineOutput(doneResult), /Invalid item id: 0/);
});

// Ensures done can create a new completed item directly from text.
test("done creates completed item from text", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const doneResult = runFlow(["done", "Ship release checklist"], { env });
  assert.equal(doneResult.status, 0, combineOutput(doneResult));

  const listResult = runFlow(["list", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));
  const items = JSON.parse(stripAnsi(listResult.stdout).trim());

  assert.equal(items.length, 1);
  assert.equal(items[0].type, "done");
  assert.equal(items[0].status, "done");
  assert.equal(items[0].text, "Ship release checklist");
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
  assert.match(output, /\s-\s#\d+\s(done|open)\s/);
  assert.match(output, /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);
  assert.doesNotMatch(output, /\.\d{3}/);

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
  const config = readJson<{ language: string }>(configPath);
  assert.equal(config.language, "en");
});

// Verifies that Spanish messages are used when language is configured to es.
test("uses Spanish messages when language is es", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const setResult = runFlow(["config", "set", "language", "es"], { env });
  assert.equal(setResult.status, 0, combineOutput(setResult));

  const laterResult = runFlow(["later", "Preparar reporte semanal"], { env });
  assert.equal(laterResult.status, 0, combineOutput(laterResult));

  const output = combineOutput(laterResult);
  assert.match(output, /Guardado para despues/);
});

// Verifies help output is localized according to language config.
test("help output is localized when language is es", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const setResult = runFlow(["config", "set", "language", "es"], { env });
  assert.equal(setResult.status, 0, combineOutput(setResult));

  const helpResult = runFlow(["help"], { env });
  assert.equal(helpResult.status, 0, combineOutput(helpResult));

  const output = combineOutput(helpResult);
  assert.match(output, /CLI personal para registrar tareas hechas, pendientes y deuda tecnica/);
  assert.match(output, /Registrar una tarea completada/);
  assert.match(output, /Ver y actualizar configuracion de usuario/);
  assert.match(output, /Listar versiones publicadas disponibles/);
  assert.match(output, /Actualizar flow globalmente/);
  assert.match(output, /Ejemplos:/);
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

// Ensures edit updates the text of an existing activity by id.
test("edit updates activity text", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["later", "Initial text"], { env }).status, 0);

  const editResult = runFlow(["edit", "1", "--new", "Updated text"], { env });
  assert.equal(editResult.status, 0, combineOutput(editResult));

  const listResult = runFlow(["list", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));

  const items = JSON.parse(stripAnsi(listResult.stdout).trim());
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 1);
  assert.equal(items[0].text, "Updated text");
});

// Verifies project assignment on creation and orphan behavior after project removal.
test("projects assign on create and orphan on remove", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const addResult = runFlow(["add", "Ship billing migration", "--project", "Billing"], { env });
  assert.equal(addResult.status, 0, combineOutput(addResult));

  const projectsAfterCreate = runFlow(["project", "list", "--json"], { env });
  assert.equal(projectsAfterCreate.status, 0, combineOutput(projectsAfterCreate));
  const projects = JSON.parse(stripAnsi(projectsAfterCreate.stdout).trim());
  assert.equal(projects.length, 1);
  assert.equal(projects[0].name, "Billing");

  const itemsAfterCreate = runFlow(["list", "--json"], { env });
  assert.equal(itemsAfterCreate.status, 0, combineOutput(itemsAfterCreate));
  const createdItems = JSON.parse(stripAnsi(itemsAfterCreate.stdout).trim());
  assert.equal(createdItems.length, 1);
  assert.equal(createdItems[0].projectId, projects[0].id);

  const removeResult = runFlow(["project", "remove", String(projects[0].id)], { env });
  assert.equal(removeResult.status, 0, combineOutput(removeResult));

  const itemsAfterRemove = runFlow(["list", "--json"], { env });
  assert.equal(itemsAfterRemove.status, 0, combineOutput(itemsAfterRemove));
  const orphanedItems = JSON.parse(stripAnsi(itemsAfterRemove.stdout).trim());
  assert.equal(orphanedItems.length, 1);
  assert.equal(orphanedItems[0].projectId, null);

  const projectsAfterRemove = runFlow(["project", "list", "--json"], { env });
  assert.equal(projectsAfterRemove.status, 0, combineOutput(projectsAfterRemove));
  const remainingProjects = JSON.parse(stripAnsi(projectsAfterRemove.stdout).trim());
  assert.deepEqual(remainingProjects, []);
});

// Keeps backward compatibility with legacy single-dash long options.
test("legacy -new and -project options are normalized", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  const addResult = runFlow(["add", "Legacy option task", "-project", "Core"], { env });
  assert.equal(addResult.status, 0, combineOutput(addResult));

  const editResult = runFlow(["edit", "1", "-new", "Legacy option updated"], { env });
  assert.equal(editResult.status, 0, combineOutput(editResult));

  const listResult = runFlow(["list", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));
  const items = JSON.parse(stripAnsi(listResult.stdout).trim());
  assert.equal(items.length, 1);
  assert.equal(items[0].text, "Legacy option updated");
  assert.equal(typeof items[0].projectId, "number");
});

// Filters list by project reference (name and id).
test("list filters activities by project", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Ship checkout", "--project", "Payments"], { env }).status, 0);
  assert.equal(runFlow(["later", "Prepare roadmap", "--project", "Platform"], { env }).status, 0);

  const projectsResult = runFlow(["project", "list", "--json"], { env });
  assert.equal(projectsResult.status, 0, combineOutput(projectsResult));
  const projects = JSON.parse(stripAnsi(projectsResult.stdout).trim());
  const payments = projects.find((project) => project.name === "Payments");
  assert.ok(payments);

  const byName = runFlow(["list", "--project", "Payments", "--json"], { env });
  assert.equal(byName.status, 0, combineOutput(byName));
  const byNameItems = JSON.parse(stripAnsi(byName.stdout).trim());
  assert.equal(byNameItems.length, 1);
  assert.equal(byNameItems[0].text, "Ship checkout");

  const byId = runFlow(["list", "--project", String(payments.id), "--json"], { env });
  assert.equal(byId.status, 0, combineOutput(byId));
  const byIdItems = JSON.parse(stripAnsi(byId.stdout).trim());
  assert.equal(byIdItems.length, 1);
  assert.equal(byIdItems[0].projectId, payments.id);
});

// Filters by today/week/month/date and validates date filter conflicts.
test("list supports date filters", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Today item"], { env }).status, 0);
  assert.equal(runFlow(["later", "Week item"], { env }).status, 0);
  assert.equal(runFlow(["debt", "Old item"], { env }).status, 0);

  const dataPath = path.join(sandbox.home, ".flow", "data.json");
  const data = readJson<any>(dataPath);

  const now = dayjs();
  const todayIso = now.toISOString();
  const weekIso = now.subtract(2, "day").toISOString();
  const oldIso = now.subtract(40, "day").toISOString();

  for (const item of data.items) {
    if (item.text === "Today item") {
      item.createdAt = todayIso;
      continue;
    }

    if (item.text === "Week item") {
      item.createdAt = weekIso;
      continue;
    }

    if (item.text === "Old item") {
      item.createdAt = oldIso;
    }
  }

  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const todayResult = runFlow(["list", "--today", "--json"], { env });
  assert.equal(todayResult.status, 0, combineOutput(todayResult));
  const todayItems = JSON.parse(stripAnsi(todayResult.stdout).trim());
  assert.equal(todayItems.length, 1);
  assert.equal(todayItems[0].text, "Today item");

  const weekResult = runFlow(["list", "--week", "--json"], { env });
  assert.equal(weekResult.status, 0, combineOutput(weekResult));
  const weekItems = JSON.parse(stripAnsi(weekResult.stdout).trim());
  assert.equal(weekItems.length, 2);

  const monthResult = runFlow(["list", "--month", "--json"], { env });
  assert.equal(monthResult.status, 0, combineOutput(monthResult));
  const monthItems = JSON.parse(stripAnsi(monthResult.stdout).trim());
  assert.ok(monthItems.length >= 2);

  const dateValue = now.format("YYYY-MM-DD");
  const dateResult = runFlow(["list", "--date", dateValue, "--json"], { env });
  assert.equal(dateResult.status, 0, combineOutput(dateResult));
  const dateItems = JSON.parse(stripAnsi(dateResult.stdout).trim());
  assert.equal(dateItems.length, 1);
  assert.equal(dateItems[0].text, "Today item");

  const conflictResult = runFlow(["list", "--today", "--week"], { env });
  assert.equal(conflictResult.status, 1, combineOutput(conflictResult));
  assert.match(combineOutput(conflictResult), /Use one date mode only/);

  const from = now.subtract(3, "day").format("YYYY-MM-DD");
  const to = now.format("YYYY-MM-DD");
  const rangeResult = runFlow(["list", "--from", from, "--to", to, "--json"], { env });
  assert.equal(rangeResult.status, 0, combineOutput(rangeResult));
  const rangeItems = JSON.parse(stripAnsi(rangeResult.stdout).trim());
  assert.equal(rangeItems.length, 2);

  const invalidRange = runFlow(["list", "--from", to, "--to", from], { env });
  assert.equal(invalidRange.status, 1, combineOutput(invalidRange));
  assert.match(combineOutput(invalidRange), /Invalid date range/);
});

// Keeps backward compatibility with legacy -date option alias.
test("legacy -date option is normalized", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Legacy date filter item"], { env }).status, 0);
  const dateValue = dayjs().format("YYYY-MM-DD");

  const result = runFlow(["list", "-date", dateValue, "--json"], { env });
  assert.equal(result.status, 0, combineOutput(result));
  const items = JSON.parse(stripAnsi(result.stdout).trim());
  assert.equal(items.length, 1);
  assert.equal(items[0].text, "Legacy date filter item");
});

// Keeps backward compatibility with -from/-to aliases.
test("legacy -from and -to options are normalized", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Range alias item"], { env }).status, 0);
  const dateValue = dayjs().format("YYYY-MM-DD");

  const result = runFlow(["list", "-from", dateValue, "-to", dateValue, "--json"], { env });
  assert.equal(result.status, 0, combineOutput(result));
  const items = JSON.parse(stripAnsi(result.stdout).trim());
  assert.equal(items.length, 1);
  assert.equal(items[0].text, "Range alias item");
});

// Verifies project rename updates project name without breaking assignments.
test("project rename updates existing project", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Task with project", "--project", "Payments"], { env }).status, 0);

  const projectsBefore = runFlow(["project", "list", "--json"], { env });
  assert.equal(projectsBefore.status, 0, combineOutput(projectsBefore));
  const projects = JSON.parse(stripAnsi(projectsBefore.stdout).trim());
  assert.equal(projects.length, 1);

  const rename = runFlow(["project", "rename", String(projects[0].id), "Payments API"], { env });
  assert.equal(rename.status, 0, combineOutput(rename));

  const projectsAfter = runFlow(["project", "list", "--json"], { env });
  assert.equal(projectsAfter.status, 0, combineOutput(projectsAfter));
  const renamedProjects = JSON.parse(stripAnsi(projectsAfter.stdout).trim());
  assert.equal(renamedProjects[0].name, "Payments API");

  const listResult = runFlow(["list", "--project", "Payments API", "--json"], { env });
  assert.equal(listResult.status, 0, combineOutput(listResult));
  const items = JSON.parse(stripAnsi(listResult.stdout).trim());
  assert.equal(items.length, 1);
});

// Verifies remove deletes an item and undo restores it.
test("remove deletes activity and undo restores it", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["later", "To be removed"], { env }).status, 0);

  const removeResult = runFlow(["remove", "1"], { env });
  assert.equal(removeResult.status, 0, combineOutput(removeResult));

  const afterRemove = runFlow(["list", "--json"], { env });
  assert.equal(afterRemove.status, 0, combineOutput(afterRemove));
  assert.deepEqual(JSON.parse(stripAnsi(afterRemove.stdout).trim()), []);

  const undoResult = runFlow(["undo"], { env });
  assert.equal(undoResult.status, 0, combineOutput(undoResult));

  const afterUndo = runFlow(["list", "--json"], { env });
  assert.equal(afterUndo.status, 0, combineOutput(afterUndo));
  const items = JSON.parse(stripAnsi(afterUndo.stdout).trim());
  assert.equal(items.length, 1);
  assert.equal(items[0].text, "To be removed");
});

// Verifies stats supports project/date filters and returns filtered aggregates.
test("stats supports project and date filters", (t) => {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox.root));
  const env = buildHomeEnv(sandbox.home);

  assert.equal(runFlow(["add", "Done payment", "--project", "Payments"], { env }).status, 0);
  assert.equal(runFlow(["later", "Open payment", "--project", "Payments"], { env }).status, 0);
  assert.equal(runFlow(["debt", "Other project debt", "--project", "Platform"], { env }).status, 0);

  const dataPath = path.join(sandbox.home, ".flow", "data.json");
  const data = readJson<any>(dataPath);
  const now = dayjs();
  const oldIso = now.subtract(20, "day").toISOString();

  for (const item of data.items) {
    if (item.text === "Open payment") {
      item.createdAt = oldIso;
    }
  }

  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const statsToday = runFlow(["stats", "--project", "Payments", "--today", "--json"], { env });
  assert.equal(statsToday.status, 0, combineOutput(statsToday));
  const todayStats = JSON.parse(stripAnsi(statsToday.stdout).trim());
  assert.equal(todayStats.total, 1);
  assert.equal(todayStats.done, 1);
  assert.equal(todayStats.open, 0);

  const statsRange = runFlow(["stats", "--project", "Payments", "--from", now.subtract(30, "day").format("YYYY-MM-DD"), "--to", now.format("YYYY-MM-DD"), "--json"], { env });
  assert.equal(statsRange.status, 0, combineOutput(statsRange));
  const rangeStats = JSON.parse(stripAnsi(statsRange.stdout).trim());
  assert.equal(rangeStats.total, 2);
  assert.equal(rangeStats.done, 1);
  assert.equal(rangeStats.open, 1);
});
