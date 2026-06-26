const fs = require('fs');
const path = require('path');
const dir = 'f:\\wiet-hackverse-2-0-hackathon-project-submission-aiml-701-wa05_hackmatrix\\frontend\\app\\i18n\\translations';
const replacements = {
  'ar.ts': ['آلاف الحالات', 'الحالات'],
  'de.ts': ['tausende Zustände', 'Zustände'],
  'es.ts': ['miles de condiciones', 'condiciones'],
  'fr.ts': ["des milliers d'affections", 'des affections'],
  'hi.ts': ['हज़ारों स्थितियों', 'स्थितियों'],
  'ja.ts': ['何千もの状態', '状態'],
  'ko.ts': ['수천 건의 상태', '상태'],
  'zh.ts': ['数千种状况', '状况']
};

Object.entries(replacements).forEach(([file, [search, replace]]) => {
  const fp = path.join(dir, file);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(fp, content);
    console.log('Replaced in ' + file);
  }
});
