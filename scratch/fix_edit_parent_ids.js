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
  if (filePath.endsWith('.tsx') && filePath.includes('content') && filePath.includes('edit')) {
    
    let entityIdField = '';
    if (filePath.includes('presenters')) entityIdField = 'presenter_id';
    else if (filePath.includes('guests')) entityIdField = 'guest_id';
    else if (filePath.includes('channels')) entityIdField = 'channel_id';
    else if (filePath.includes('podcasts')) entityIdField = 'podcast_id';

    if (entityIdField) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      let changed = false;
      const wrongText = `${entityIdField}: id,`;
      const rightText = `${entityIdField}: parentId,`;
      
      if (content.includes(wrongText)) {
         content = content.replace(wrongText, rightText);
         changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed edit ' + filePath);
      }
    }
  }
});
