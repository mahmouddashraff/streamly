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
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix newVideo
    if (content.includes('const newVideo = {') && content.includes('year: parseInt(formData.year)') && !content.includes('title: formData.title_en')) {
      content = content.replace(/const newVideo = \{\s*\.\.\.formData,\s*year: parseInt\(formData\.year\)/, 'const newVideo = {\n      ...formData,\n      title: formData.title_en,\n      description: formData.description_en,\n      year: parseInt(formData.year)');
      changed = true;
    }

    // Fix updatedVideo
    if (content.includes('const updatedVideo = {') && content.includes('year: parseInt(formData.year)') && !content.includes('title: formData.title_en')) {
      content = content.replace(/const updatedVideo = \{\s*\.\.\.formData,\s*year: parseInt\(formData\.year\)/, 'const updatedVideo = {\n      ...formData,\n      title: formData.title_en,\n      description: formData.description_en,\n      year: parseInt(formData.year)');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ' + filePath);
    }
  }
});
