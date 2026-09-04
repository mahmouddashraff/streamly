const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/Karim Ashraf/.gemini/antigravity-ide/brain/c740251b-342a-49c7-a102-9ea71834382a/.system_generated/logs/transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('export default async function Home') && line.includes('page.tsx')) {
       console.log(line.substring(0, 3000));
       break;
    }
  }
}

processLineByLine();
