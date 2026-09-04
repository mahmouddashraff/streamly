import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

console.log('Fetching from:', url);
const res = await fetch(`${url}/rest/v1/presenters?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
});
const data = await res.json();
console.log('Presenters:', data);

const res2 = await fetch(`${url}/rest/v1/channels?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
});
console.log('Channels:', await res2.json());

const res3 = await fetch(`${url}/rest/v1/guests?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
});
console.log('Guests:', await res3.json());

const res4 = await fetch(`${url}/rest/v1/videos?select=*&is_soon=eq.true`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
});
console.log('Soon videos:', await res4.json());
