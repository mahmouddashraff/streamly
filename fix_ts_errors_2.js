const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'src/app/admin'), (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(
      /await deleteOldStorageFile\(([^)]+)\);/g,
      'await deleteStorageFiles([$1]);'
    );

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${filePath}`);
    }
  }
});
