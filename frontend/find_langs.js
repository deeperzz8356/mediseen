const fs = require('fs');
const path = require('path');
const dir = 'f:\\wiet-hackverse-2-0-hackathon-project-submission-aiml-701-wa05_hackmatrix\\frontend\\app\\i18n\\translations';

['bn.ts', 'mr.ts', 'te.ts'].forEach(f => {
  const fp = path.join(dir, f);
  if (fs.existsSync(fp)) {
    const content = fs.readFileSync(fp, 'utf8');
    const lines = content.split('\n');
    let inLib = false;
    for(let i=0; i<lines.length; i++) {
      if(lines[i].includes('library: {')) inLib = true;
      if(inLib && lines[i].includes('subtitle:') && !lines[i].includes('shortcutsTitle')) {
        console.log(f, '=>', lines[i].trim());
        break;
      }
    }
  }
});
