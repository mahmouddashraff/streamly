const fs = require('fs');

const lines = fs.readFileSync('C:/Users/Karim Ashraf/.gemini/antigravity-ide/brain/c740251b-342a-49c7-a102-9ea71834382a/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.function.name === 'write_to_file') {
          const args = JSON.parse(call.function.arguments);
          if (args.TargetFile && args.TargetFile.includes('page.tsx')) {
            console.log(`--- MATCH IN STEP ${obj.step_index} ---`);
            console.log("WROTE CONTENT:");
            console.log(args.CodeContent.substring(0, 1000));
          }
        }
      }
    }
  } catch (e) {}
}
