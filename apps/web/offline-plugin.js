import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
export function offlinePlugin() {
  let directory;
  return {
    name: 'multiedu-offline',
    apply: 'build',
    configResolved(config) {
      directory = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const files = [
        'index.html',
        ...(await readdir(path.join(directory, 'assets'))).map((file) => `assets/${file}`),
      ];
      const hash = createHash('sha256');
      for (const file of files) hash.update(await readFile(path.join(directory, file)));
      const version = `multiedu-${hash.digest('hex').slice(0, 12)}`;
      await writeFile(
        path.join(directory, 'sw.js'),
        `
const CACHE=${JSON.stringify(version)};
const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new URL(file,self.registration.scope).href))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('multiedu-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  if(event.request.mode==='navigate'){try{return await fetch(event.request);}catch{return await cache.match(new URL('index.html',self.registration.scope).href);}}
  return await cache.match(event.request,{ignoreSearch:true,ignoreVary:true})||fetch(event.request);
 }));
});
 `,
      );
    },
  };
}
