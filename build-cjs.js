import {rmSync} from 'node:fs';
import * as esbuild from 'esbuild';
import packageJson from './package.json' with {type: 'json'};

rmSync('./dist/cjs', {recursive: true, force: true});

await esbuild.build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/cjs/index.cjs',
  format: 'cjs',
  platform: 'node',
  target: ['node18'],
  bundle: true,
  keepNames: true,
  external: [
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.dependencies || {}),
  ],
});
