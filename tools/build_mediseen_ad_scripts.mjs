import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "file:///C:/Users/Deepp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const outputDir = process.argv[2];
const outputPath = `${outputDir}/MediSeen_Ad_Scripts_Max_Safe_25s_Gate.xlsx`;
await fs.mkdir(`${outputDir}/previews`, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("MediSeen");
sheet.showGridLines = true;

const rows = [
  ["STT", "Screen Name", "Ads type", "Name", "ID", "Description", "Format", "Note", "Status"],
  [1, "Welcome / Splash Screen", "Banner", "banner_splash", null, "Banner ad at the bottom of the welcome screen", "standard", "Load without blocking. Never delay or hold the welcome screen while waiting for the ad.", "not working"],
  [2, "Language Screen", "Native", "native_language", null, "Native ad at the bottom of the language screen", "regular", "Keep below the language options. Do not show an interstitial after saving the language.", "not working"],
  [3, "Notification Permission Screen", "No Ads", "-", null, "No ad placement near notification permission controls", "-", "Do not place advertising before, behind or immediately after the permission prompt.", "working"],
  [4, "Onboarding Screen 1 - AI Health Insights", "Banner", "banner_home_fallback", null, "Banner ad at the bottom of onboarding screen 1", "standard", "Reuse the exact Home banner title and unit. Keep it above Next and never cover onboarding content.", "not working"],
  [5, "Onboarding Screen 2 - Diet Recommendations", "Banner", "banner_home_fallback", null, "Banner ad at the bottom of onboarding screen 2", "standard", "Reuse the exact Home banner title and unit. Keep it above Next and load without blocking.", "not working"],
  [6, "Onboarding Screen 3 - Health Tracking", "Banner", "banner_home_fallback", null, "Banner ad at the bottom of onboarding screen 3", "standard", "Reuse the exact Home banner title and unit. Keep it above Next and away from consent controls.", "not working"],
  [7, "Onboarding Screen 4 - AI Health Assistant", "Banner", "banner_home_fallback", null, "Banner ad at the bottom of the final onboarding screen", "standard", "Use the exact Home banner title and AdMob unit. Place above Get Started.", "working"],
  [8, "Sign In Screen", "No Ads", "-", null, "No ad placement on the sign-in form", "-", "Do not place ads near email, password or authentication actions.", "working"],
  [9, "Create Account Screen", "No Ads", "-", null, "No ad placement on the account registration form", "-", "Keep account creation and password confirmation free from advertising.", "working"],
  [10, "Profile Setup Screen", "No Ads", "-", null, "No ad placement while the user enters profile details", "-", "Name, age and gender fields contain personal information.", "working"],
  [11, "Home Screen", "Native", "native_home_content", null, "Native ad between the main Home actions and Today activity section", "Large", "Large native ad in the Home scroll. If it fails, request banner_home_fallback.", "working"],
  [12, "Home Screen", "Banner", "banner_home_fallback", null, "Banner fallback inside the Home screen content", "standard", "Same exact ad title and AdMob unit as Onboarding. Show only when the Home native ad fails.", "working"],
  [13, "AI Assistant Screen", "No Ads", "-", null, "No passive ad placement inside the health conversation", "-", "Do not mix advertising with health questions, answers or urgent guidance.", "working"],
  [14, "AI Assistant Limit Prompt", "reward", "reward_assistant_bonus", null, "Optional rewarded ad for additional non-urgent assistant questions", "standard", "User must opt in. Never gate urgent guidance, existing answers or normal navigation.", "not working"],
  [15, "Diet Plan Input Screen", "Banner", "banner_diet_input", null, "Banner ad at the bottom of the diet input screen", "standard", "Place below the form, never beside condition fields or the Generate Plan button.", "not working"],
  [16, "Diet Plan Loading Screen", "No Ads", "-", null, "No ad placement while the diet plan is being generated", "-", "Do not interrupt progress or display a full-screen ad during generation.", "working"],
  [17, "Diet Plan Results Screen", "Native", "native_diet_plan_end", null, "Native ad at the bottom of a completed diet plan", "Large", "Show after meals, recommendations and grocery content, before the medical disclaimer.", "working"],
  [18, "Grocery List Section", "Banner", "banner_grocery_list", null, "Banner ad after the generated grocery list", "standard", "Place after all grocery items. Do not insert ads between food recommendations.", "not working"],
  [19, "Library Browse Screen", "Native", "native_library_feed", null, "Native ad in the curated health conditions feed", "regular", "Show after the third two-card row, after 6 health shortcuts.", "working"],
  [20, "Library Detail Screen", "Native", "native_library_end", null, "Native ad at the bottom of the medical article", "Large", "Show after the full article and the Clear Results action.", "working"],
  [21, "Library Detail Screen", "inter", "inter_library_completion", null, "Interstitial ad after a completed Library reading session", "standard", "After 3 article completions, with a 10-minute cooldown and maximum 2 impressions per day.", "working"],
  [22, "Scan Upload Screen", "No Ads", "-", null, "No ad placement near camera or gallery upload", "-", "Keep file selection, camera permission and medical image upload free from ads.", "working"],
  [23, "Scan Symptoms Screen", "No Ads", "-", null, "No ad placement while symptoms are entered", "-", "Do not distract from symptom entry or mix ads with medical details.", "working"],
  [24, "Scan Review Screen", "No Ads", "-", null, "No ad placement while the user reviews scan inputs", "-", "Keep the final confirmation and Start Scan action clear.", "working"],
  [25, "Scan Limit Prompt", "reward", "rewarded_scan_unlock", null, "Rewarded ad to unlock one additional health scan", "standard", "After the daily free scan is used, the user may opt in. Grant one scan credit after reward completion.", "working"],
  [26, "Scan Processing Screen", "No Ads", "-", null, "No ad placement while the health scan is processing", "-", "Do not exploit waiting time or interrupt analysis progress.", "working"],
  [27, "Diagnosis Result Screen", "No Ads", "-", null, "No ad placement inside the diagnosis result", "-", "Keep confidence, recommendations and safety language uninterrupted.", "working"],
  [28, "Scan History Screen", "No Ads", "-", null, "No ad placement within personal scan history", "-", "Health history is sensitive and must not be mixed with sponsored content.", "working"],
  [29, "Activity Tracking Screen", "Banner", "banner_activity", null, "Banner ad at the bottom of the activity summary", "standard", "Place after steps and calories. Keep away from Health Connect permission actions.", "not working"],
  [30, "Profile / Settings Screen", "No Ads", "-", null, "No ad placement on account and settings controls", "-", "Keep sign-out, privacy choices and account deletion controls clear.", "working"],
  [31, "Edit Profile Screen", "No Ads", "-", null, "No ad placement while profile details are edited", "-", "Do not place ads near personal data fields or save actions.", "working"],
  [32, "Privacy Policy Screen", "No Ads", "-", null, "No ad placement inside the privacy policy", "-", "Legal and privacy disclosures must remain uninterrupted.", "working"],
  [33, "Terms and Conditions Screen", "No Ads", "-", null, "No ad placement inside the terms and conditions", "-", "Legal terms must remain uninterrupted.", "working"],
  [34, "Main Navigation Tabs", "Banner", "banner_all_nav", null, "Shared banner inventory for eligible main navigation screens", "standard", "Use only when that screen has no native or banner ad. Exclude Scan, Assistant, Profile and legal screens.", "not working"],
  [35, "Timed Navigation Break", "inter", "inter_navigation_25s", null, "Interstitial becomes eligible after 25 seconds of active app use", "standard", "25s arms the ad. Show only at the next safe transition. Never while reading, typing, scanning, on Back or exit. 3-minute cooldown; max 2/day.", "not working"],
  [36, "App Resume", "app_open", "app_open_main_foreground", null, "App-open ad when an eligible user returns from background", "standard", "From the third foreground after 30 seconds in background, with a 4-hour cooldown. Never show in the first session.", "working"],
];

sheet.getRange(`A1:I${rows.length}`).values = rows;
sheet.getRange(`A1:I${rows.length}`).format.font = { name: "Arial", size: 10 };
sheet.getRange("A1:I1").format = {
  fill: "#00FF00",
  font: { name: "Arial", size: 10, bold: true, color: "#000000" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#000000" },
};
sheet.getRange(`A2:I${rows.length}`).format = {
  font: { name: "Arial", size: 10, color: "#000000" },
  verticalAlignment: "center",
  wrapText: false,
};
sheet.getRange(`A2:A${rows.length}`).format.horizontalAlignment = "right";

const widths = {
  A: 46,
  B: 315,
  C: 105,
  D: 190,
  E: 185,
  F: 430,
  G: 105,
  H: 850,
  I: 105,
};
for (const [column, widthPx] of Object.entries(widths)) {
  sheet.getRange(`${column}:${column}`).format.columnWidthPx = widthPx;
}
sheet.getRange("1:1").format.rowHeightPx = 24;
sheet.getRange(`2:${rows.length}`).format.rowHeightPx = 22;

sheet.getRange(`C2:C${rows.length}`).dataValidation = {
  rule: { type: "list", values: ["No Ads", "Banner", "Native", "inter", "app_open", "reward"] },
};
sheet.getRange(`G2:G${rows.length}`).dataValidation = {
  rule: { type: "list", values: ["-", "regular", "standard", "Large"] },
};
sheet.getRange(`I2:I${rows.length}`).dataValidation = {
  rule: { type: "list", values: ["working", "not working"] },
};
sheet.freezePanes.freezeRows(1);

const preview = await workbook.render({
  sheetName: "MediSeen",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/previews/MediSeen_Exact_Format.png`, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

const inspect = await workbook.inspect({
  kind: "workbook,sheet,region,computedStyle",
  sheetId: "MediSeen",
  range: `A1:I${rows.length}`,
  maxChars: 30000,
  tableMaxRows: 20,
  tableMaxCols: 9,
  tableMaxCellChars: 180,
});
await fs.writeFile(`${outputPath}.inspect.ndjson`, inspect.ndjson, "utf8");

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  maxChars: 10000,
});
await fs.writeFile(`${outputPath}.errors.ndjson`, errors.ndjson, "utf8");

console.log(outputPath);
