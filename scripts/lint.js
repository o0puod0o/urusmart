const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const ROOT = process.cwd();
const JS_EXT_RE = /\.[jt]sx?$/;
const RESOLVE_EXTS = [".js", ".jsx", ".ts", ".tsx", ".json"];
const SKIP_DIRS = new Set([".git", "node_modules"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (JS_EXT_RE.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRelative(filePath) {
  return path.relative(ROOT, filePath);
}

function checkBabelSyntax(files) {
  const failures = [];

  for (const file of files) {
    try {
      babel.transformSync(fs.readFileSync(file, "utf8"), {
        filename: file,
        presets: ["babel-preset-expo"],
      });
    } catch (error) {
      failures.push(`${toRelative(file)}\n${error.message}`);
    }
  }

  return failures;
}

function pathExistsWithoutExtension(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return true;

  for (const ext of RESOLVE_EXTS) {
    if (fs.existsSync(`${basePath}${ext}`)) return true;
  }

  for (const ext of RESOLVE_EXTS) {
    if (fs.existsSync(path.join(basePath, `index${ext}`))) return true;
  }

  return false;
}

function checkRelativeImports(files) {
  const failures = [];
  const importRe =
    /import(?:[\s\S]*?from\s*)?["']([^"']+)["']|require\(["']([^"']+)["']\)/g;

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    let match;

    while ((match = importRe.exec(source))) {
      const specifier = match[1] || match[2];
      if (!specifier?.startsWith(".")) continue;

      const target = path.resolve(path.dirname(file), specifier);
      if (!pathExistsWithoutExtension(target)) {
        failures.push(`${toRelative(file)} imports missing path "${specifier}"`);
      }
    }
  }

  return failures;
}

function checkAppAssets() {
  const appJsonPath = path.join(ROOT, "app.json");
  const config = JSON.parse(fs.readFileSync(appJsonPath, "utf8")).expo;
  const assetPaths = [
    config.icon,
    config.splash?.image,
    config.android?.adaptiveIcon?.foregroundImage,
    config.web?.favicon,
  ].filter(Boolean);
  const failures = [];

  for (const assetPath of assetPaths) {
    if (!fs.existsSync(path.join(ROOT, assetPath))) {
      failures.push(`app.json references missing asset "${assetPath}"`);
    }
  }

  return failures;
}

function checkNavigationTargets(files) {
  const navigatorPath = path.join(ROOT, "src/navigation/AppNavigator.js");
  if (!fs.existsSync(navigatorPath)) return [];

  const navigatorSource = fs.readFileSync(navigatorPath, "utf8");
  const screenNames = new Set(
    [...navigatorSource.matchAll(/<[^>]+\.Screen\s+name=["']([^"']+)["']/g)].map(
      (match) => match[1],
    ),
  );
  const failures = [];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");

    for (const match of source.matchAll(
      /(?:navigation\.)?navigate\(\s*["']([^"']+)["']/g,
    )) {
      const routeName = match[1];
      if (!screenNames.has(routeName)) {
        failures.push(`${toRelative(file)} navigates to unregistered route "${routeName}"`);
      }
    }

    for (const match of source.matchAll(
      /routes:\s*\[\s*\{\s*name:\s*["']([^"']+)["']/g,
    )) {
      const routeName = match[1];
      if (!screenNames.has(routeName)) {
        failures.push(`${toRelative(file)} resets to unregistered route "${routeName}"`);
      }
    }
  }

  return failures;
}

function checkConflictMarkers(files) {
  const failures = [];
  const markerRe = /^(<<<<<<<|=======|>>>>>>>)/m;

  for (const file of files) {
    if (markerRe.test(fs.readFileSync(file, "utf8"))) {
      failures.push(`${toRelative(file)} contains merge conflict markers`);
    }
  }

  return failures;
}

function checkInsecureTokenStorage(files) {
  const failures = [];
  const allowedMigrationFile = "src/services/authStorage.js";
  const directTokenAccess =
    /AsyncStorage\.(?:getItem|setItem|multiGet|multiSet)\([\s\S]{0,120}?STORAGE_KEYS\.(?:TOKEN|TOKEN_TYPE)/;

  for (const file of files) {
    const relative = toRelative(file);
    if (relative === allowedMigrationFile) continue;
    if (directTokenAccess.test(fs.readFileSync(file, "utf8"))) {
      failures.push(
        `${relative} accesses auth tokens through AsyncStorage; use authStorage instead`,
      );
    }
  }

  return failures;
}

const files = walk(ROOT);
const appFiles = files.filter((file) => {
  const rel = toRelative(file);
  return rel === "App.js" || rel === "index.js" || rel.startsWith("src/");
});

const failures = [
  ...checkBabelSyntax(files),
  ...checkRelativeImports(appFiles),
  ...checkAppAssets(),
  ...checkNavigationTargets(appFiles),
  ...checkConflictMarkers(appFiles),
  ...checkInsecureTokenStorage(appFiles),
];

if (failures.length > 0) {
  console.error(`Lint failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`\n- ${failure}`);
  }
  process.exit(1);
}

console.log(`Lint OK (${files.length} JS/TS files checked)`);
