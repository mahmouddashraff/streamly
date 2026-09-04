import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const res = await fetch(`${url}/rest/v1/videos?select=*&presenter_id=not.is.null`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
console.log('Presenter Videos:', await res.json());

const res2 = await fetch(`${url}/rest/v1/videos?select=*&channel_id=not.is.null`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
console.log('Channel Videos:', await res2.json());

const res3 = await fetch(`${url}/rest/v1/videos?select=*&guest_id=not.is.null`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
console.log('Guest Videos:', await res3.json());
