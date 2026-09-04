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

    // Fix newVideo bug in edit pages
    content = content.replace(
      /await deleteStorageFiles\(\[publicUrlData\?\.publicUrl \|\| newVideo\?\.video_url\]\);/g,
      'await deleteStorageFiles([publicUrlData?.publicUrl]);'
    );
    
    // Fix deleteOldStorageFile bug
    content = content.replace(
      /await deleteOldStorageFile\(([^,]+),\s*'[^']+'\);/g,
      'await deleteStorageFiles([$1]);'
    );
    
    content = content.replace(
      /const deleteOldStorageFile = async \([^)]+\) => {[\s\S]*?await supabase\.storage\.from\([^\)]+\)\.remove\(\[filePath\]\);\s*\}\s*\};/g,
      ''
    );
    
    content = content.replace(
      /const deleteOldStorageFile = async \([^)]+\) => {[\s\S]*?await deleteStorageFiles\(\[oldUrl\]\);\s*\}\s*\};/g,
      ''
    );
    
    content = content.replace(
      /const deleteOldStorageFile = async \([^)]+\) => {[\s\S]*?await supabase\.storage\.from\([^\)]+\)\.remove\(\[match\[1\]\]\);\s*\}\s*\};/g,
      ''
    );

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${filePath}`);
    }
  }
});
