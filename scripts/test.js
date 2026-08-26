const assert = require("assert");
const fs = require("fs");
const Module = require("module");
const path = require("path");
const babel = require("@babel/core");

process.env.EXPO_PUBLIC_API_URL = "https://api.example.test/api";

function loadModule(relativePath) {
  const filename = path.resolve(process.cwd(), relativePath);
  const code = fs.readFileSync(filename, "utf8");
  const output = babel.transformSync(code, {
    filename,
    presets: ["babel-preset-expo"],
  });
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(output.code, filename);
  return mod.exports;
}

const thaiDate = loadModule("src/utils/thaiDate.js");
const image = loadModule("src/utils/image.js");
const name = loadModule("src/utils/name.js");
const inputSanitize = loadModule("src/utils/inputSanitize.js");

const parsed = thaiDate.parseISOToDate("2024-10-26");
assert.equal(parsed.getFullYear(), 2024);
assert.equal(parsed.getMonth(), 9);
assert.equal(parsed.getDate(), 26);
assert.equal(thaiDate.toISODate(new Date(2024, 9, 26)), "2024-10-26");
assert.equal(thaiDate.formatThaiDate("2024-10-26"), "26/10/2567");
assert.equal(thaiDate.formatThaiDate("0000-00-00"), "");

assert.equal(
  image.fixPhotoUrl("/storage/photos/profile.jpg"),
  "https://api.example.test/storage/photos/profile.jpg",
);
assert.equal(
  image.fixPhotoUrl("http://localhost:8001/storage/photos/profile.jpg"),
  "https://api.example.test/storage/photos/profile.jpg",
);
assert.equal(image.fixPhotoUrl("https://cdn.example.test/a.jpg"), "https://cdn.example.test/a.jpg");
assert.equal(image.fixPhotoUrl(null), "");

assert.equal(name.stripNamePrefix("นางสาว สมใจ ทดสอบ"), "สมใจ ทดสอบ");
assert.equal(name.stripNamePrefix("นายธรานนท์ ไชยโสภา"), "ธรานนท์ ไชยโสภา");
assert.equal(name.stripNamePrefix("ดร. ตัวอย่าง ทดสอบ"), "ตัวอย่าง ทดสอบ");
assert.equal(name.stripNamePrefix("ไม่มีคำนำหน้า"), "ไม่มีคำนำหน้า");

assert.equal(
  inputSanitize.sanitizeAcademicText("O'Reilly: E=mc²; Smith [2026]"),
  "O'Reilly: E=mc²; Smith [2026]",
);
assert.equal(
  inputSanitize.sanitizeAcademicText("Universite\u0301 de Paris\r\nResearch"),
  "Université de Paris\nResearch",
);
assert.equal(
  inputSanitize.sanitizeAcademicText("Thai\u0000 text\u0007"),
  "Thai text",
);
assert.equal(
  inputSanitize.sanitizeAcademicText("University 🫶 of Oxford"),
  "University of Oxford",
);
assert.equal(
  inputSanitize.sanitizeLinkInput(" https://example.org/a b?q=1 <tag> 😄 "),
  "https://example.org/ab?q=1tag",
);

console.log("Tests OK");
