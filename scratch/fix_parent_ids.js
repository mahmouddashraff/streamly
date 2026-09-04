const fs = require('fs');
const path = require('path');

const adminDir = path.join('d:', 'حدث اليوم', 'src', 'app', 'admin');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(adminDir, function(filePath) {
  if (filePath.endsWith('.tsx') && filePath.includes('content') && (filePath.includes('new') || filePath.includes('edit'))) {
    
    // Determine the entity type
    let entityIdField = '';
    if (filePath.includes('presenters')) entityIdField = 'presenter_id';
    else if (filePath.includes('guests')) entityIdField = 'guest_id';
    else if (filePath.includes('channels')) entityIdField = 'channel_id';
    else if (filePath.includes('podcasts')) entityIdField = 'podcast_id';

    if (entityIdField) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // Fix newVideo
      if (content.includes('const newVideo = {') && !content.includes(`[${entityIdField}]:`)) {
        // We will insert `[entityIdField]: id,` right after `year: parseInt(formData.year) || new Date().getFullYear(),`
        // Note: the component uses `const { id } = use(params);` or `const { id: presenter_id } = use(params);`
        // Actually let's just use `[entityIdField]: id,` but wait, in presenters/new it might be renamed!
        // Let's check how id is defined.
        
        let idVariable = 'id';
        if (content.match(/const { id: [a-z_]+ } = use\(params\);/)) {
            const match = content.match(/const { id: ([a-z_]+) } = use\(params\);/);
            idVariable = match[1];
        }

        const regexNew = /year: parseInt\(formData\.year\)(?: \|\| new Date\(\)\.getFullYear\(\))?,/;
        if (regexNew.test(content)) {
            content = content.replace(regexNew, `year: parseInt(formData.year) || new Date().getFullYear(),\n      ${entityIdField}: ${idVariable},`);
            changed = true;
        }
      }

      // Fix updatedVideo
      if (content.includes('const updatedVideo = {') && !content.includes(`[${entityIdField}]:`)) {
        let idVariable = 'id';
        if (content.match(/const { id: [a-z_]+ } = use\(params\);/)) {
            const match = content.match(/const { id: ([a-z_]+) } = use\(params\);/);
            idVariable = match[1];
        }

        const regexUpdate = /year: parseInt\(formData\.year\)(?: \|\| new Date\(\)\.getFullYear\(\))?,/;
        if (regexUpdate.test(content)) {
            content = content.replace(regexUpdate, `year: parseInt(formData.year) || new Date().getFullYear(),\n      ${entityIdField}: ${idVariable},`);
            changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed ' + filePath);
      }
    }
  }
});
