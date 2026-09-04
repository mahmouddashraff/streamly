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

const files = [];

walkDir(path.join(__dirname, 'src/app/admin'), (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('.remove([')) {
      files.push(filePath);
    }
  }
});

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add import if missing
  if (!content.includes('deleteStorageFiles')) {
    content = content.replace(
      /import { useRouter } from "next\/navigation";/g,
      'import { useRouter } from "next/navigation";\nimport { deleteStorageFiles } from "@/app/actions/storage";'
    );
  }

  content = content.replace(
    /const match = ([a-zA-Z_]+)\.match\(\/\\\/storage\\\/v1\\\/object\\\/public\\\/[a-zA-Z_]+\\\/\(\.\+\)\$\/\);\s*if \(match && match\[1\]\) \{\s*await supabase\.storage\.from\([^\)]+\)\.remove\(\[match\[1\]\]\);\s*\}/g,
    'await deleteStorageFiles([$1]);'
  );

  content = content.replace(
    /const thumbnailMatch = thumbnail\.match\(\/\\\/storage\\\/v1\\\/object\\\/public\\\/thumbnails\\\/\(\.\+\)\$\/\);\s*if \(thumbnailMatch && thumbnailMatch\[1\]\) \{\s*await supabase\.storage\.from\('thumbnails'\)\.remove\(\[thumbnailMatch\[1\]\]\);\s*\}/g,
    'await deleteStorageFiles([thumbnail]);'
  );

  content = content.replace(
    /await supabase\.storage\.from\('logos'\)\.remove\(\[fileName\]\);/g,
    'await deleteStorageFiles([publicUrlData?.publicUrl]);'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${filePath}`);
  }
}
