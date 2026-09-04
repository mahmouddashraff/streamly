const fs = require('fs');

const lines = fs.readFileSync('C:/Users/Karim Ashraf/.gemini/antigravity-ide/brain/c740251b-342a-49c7-a102-9ea71834382a/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.function.name === 'replace_file_content' || call.function.name === 'write_to_file' || call.function.name === 'multi_replace_file_content') {
          const args = JSON.parse(call.function.arguments);
          if (args.TargetFile && args.TargetFile.includes('page.tsx')) {
            console.log(`--- MATCH IN STEP ${obj.step_index} ---`);
            if (args.TargetContent) {
                console.log("REPLACED CONTENT:");
                console.log(args.TargetContent.substring(0, 500));
            }
          }
        }
      }
    }
  } catch (e) {}
}
