const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f === 'page.tsx') {
        callback(dirPath);
      }
    }
  });
}

walkDir('src/app/admin', function(filePath) {
  if (!filePath.includes('content') && !filePath.includes('videos\\new') && !filePath.includes('videos\\edit') && !filePath.includes('videos/[id]/edit')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // New Video
  const oldOnSuccess1 = `const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n            newVideo.video_url = publicUrlData.publicUrl;`;
  const newOnSuccess1 = `let finalVideoUrl = "";\n            if (bucketName === "videos") {\n              const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n              finalVideoUrl = publicUrlData.publicUrl;\n            } else {\n              finalVideoUrl = \`\${projectId}/storage/v1/object/authenticated/\${bucketName}/\${fileName}\`;\n            }\n            newVideo.video_url = finalVideoUrl;`;

  // Edit Video
  const oldOnSuccess2 = `const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n            updatedVideo.video_url = publicUrlData.publicUrl;`;
  const newOnSuccess2 = `let finalVideoUrl = "";\n            if (bucketName === "videos") {\n              const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n              finalVideoUrl = publicUrlData.publicUrl;\n            } else {\n              finalVideoUrl = \`\${projectId}/storage/v1/object/authenticated/\${bucketName}/\${fileName}\`;\n            }\n            updatedVideo.video_url = finalVideoUrl;`;

  // Soon New Content
  const oldOnSuccess3 = `const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n            newContent.video_url = publicUrlData.publicUrl;`;
  const newOnSuccess3 = `let finalVideoUrl = "";\n            if (bucketName === "videos") {\n              const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);\n              finalVideoUrl = publicUrlData.publicUrl;\n            } else {\n              finalVideoUrl = \`\${projectId}/storage/v1/object/authenticated/\${bucketName}/\${fileName}\`;\n            }\n            newContent.video_url = finalVideoUrl;`;

  if (content.includes(oldOnSuccess1)) {
    content = content.replace(oldOnSuccess1, newOnSuccess1);
    changed = true;
  }
  if (content.includes(oldOnSuccess2)) {
    content = content.replace(oldOnSuccess2, newOnSuccess2);
    changed = true;
  }
  if (content.includes(oldOnSuccess3)) {
    content = content.replace(oldOnSuccess3, newOnSuccess3);
    changed = true;
  }

  const oldDbError = `await deleteStorageFiles([publicUrlData?.publicUrl]);`;
  const newDbError = `await deleteStorageFiles([finalVideoUrl]);`;
  if (content.includes(oldDbError)) {
    content = content.replaceAll(oldDbError, newDbError);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
});
