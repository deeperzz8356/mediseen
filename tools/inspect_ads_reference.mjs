import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "file:///C:/Users/Deepp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const source = process.argv[2];
const outputDir = process.argv[3];

const blob = await FileBlob.load(source);
const workbook = await SpreadsheetFile.importXlsx(blob);
await fs.mkdir(outputDir, { recursive: true });

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 30,
  tableMaxCols: 12,
  tableMaxCellChars: 160,
});
await fs.writeFile(`${outputDir}/reference-inspect.ndjson`, summary.ndjson, "utf8");

const region = await workbook.inspect({
  kind: "region",
  sheetId: "Lumora AI",
  range: "A1:I27",
  maxChars: 30000,
});
await fs.writeFile(`${outputDir}/lumora-region.ndjson`, region.ndjson, "utf8");

const style = await workbook.inspect({
  kind: "computedStyle",
  sheetId: "Lumora AI",
  range: "A1:I27",
  maxChars: 30000,
});
await fs.writeFile(`${outputDir}/lumora-style.ndjson`, style.ndjson, "utf8");

const preview = await workbook.render({
  sheetName: "Lumora AI",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/lumora-reference.png`, new Uint8Array(await preview.arrayBuffer()));

console.log("Reference workbook inspected and rendered.");
