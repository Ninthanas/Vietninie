import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const destination=path.resolve(root,'../react');
await mkdir(destination,{recursive:true});
await cp(path.join(root,'dist'),destination,{recursive:true});
console.log('Preview prepared in /react. Commit this folder to publish on GitHub Pages.');
