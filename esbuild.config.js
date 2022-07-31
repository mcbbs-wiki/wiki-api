import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { tgz } from 'compressing'
import { createWriteStream } from 'fs'
const stream = new tgz.Stream()
console.info('Bundling...')
build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  format: 'esm',
  minify: true,
  plugins: [nodeExternalsPlugin()]
})
console.info('Compressing...')
stream.addEntry('./package.json')
stream.addEntry('./dist/bundle.js')
const destStream = createWriteStream('dist/bundle.tar.gz')
stream.pipe(destStream)
console.info('Ready!')
