const fs = require('fs');
const path = require('path');

const targets = [
  'presenters',
  'guests',
  'podcasts',
  'exclusives',
];

const basePath = path.join(__dirname, 'src/app/admin');

for (const target of targets) {
  const filePath = path.join(basePath, target, '[id]/content/page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Ensure import exists
    if (!content.includes('deleteStorageFiles')) {
      content = content.replace(
        /import { useRouter } from "next\/navigation";/g,
        'import { useRouter } from "next/navigation";\nimport { deleteStorageFiles } from "@/app/actions/storage";'
      );
    }

    // Replace cleanup storage
    const cleanupRegex = /\/\/ Cleanup storage\s+const videoMatch = video_url\.match\(\/\\\/storage\\\/v1\\\/object\\\/public\\\/videos\\\/(.+)\$\/\);\s+if \(videoMatch && videoMatch\[1\]\) {\s+await supabase\.storage\.from\('videos'\)\.remove\(\[videoMatch\[1\]\]\);\s+}\s+const thumbnailMatch = thumbnail\.match\(\/\\\/storage\\\/v1\\\/object\\\/public\\\/thumbnails\\\/(.+)\$\/\);\s+if \(thumbnailMatch && thumbnailMatch\[1\]\) {\s+await supabase\.storage\.from\('thumbnails'\)\.remove\(\[thumbnailMatch\[1\]\]\);\s+}/;
    
    if (cleanupRegex.test(content)) {
        content = content.replace(cleanupRegex, 'await deleteStorageFiles([video_url, thumbnail]);');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`Regex did not match in ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
