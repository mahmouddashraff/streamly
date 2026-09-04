import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const res = await fetch(`${url}/rest/v1/categories?select=*`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
console.log('Categories:', await res.json());

const res2 = await fetch(`${url}/rest/v1/videos?select=category`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
console.log('Video Categories:', await res2.json());
