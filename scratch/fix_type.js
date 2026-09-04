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
  if (filePath.endsWith('.tsx') && filePath.includes('content') && filePath.includes('new')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix type: "Video"
    if (content.includes('type: "Video" as "movie" | "Video"')) {
      content = content.replace('type: "Video" as "movie" | "Video"', 'type: "movie" as "movie" | "episode"');
      changed = true;
    }
    
    if (content.includes('type: "episode" as "movie" | "episode"')) {
       // Keep it episode for podcasts? Or change to movie? Let's keep it episode but add select.
    }

    // Now inject the select field if it doesn't exist.
    const selectField = `
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Content Type</label>
              <select
                id="type"
                name="type"
                value={formData.type || "movie"}
                onChange={handleChange}
                disabled={isUploading}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="movie">Movie</option>
                <option value="episode">Episode</option>
              </select>
            </div>
`;

    // We can insert this right before the year/duration grid
    if (!content.includes('name="type"')) {
      content = content.replace(/<div className="grid grid-cols-2 gap-4 md:col-span-2">/g, selectField + '\n            <div className="grid grid-cols-2 gap-4 md:col-span-2">');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ' + filePath);
    }
  }
});
