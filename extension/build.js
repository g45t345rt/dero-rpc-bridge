const esbuild = require('esbuild')
const copyStaticFiles = require('esbuild-copy-static-files')

const args = process.argv
const watch = args.indexOf('watch') !== -1

esbuild.build({
  entryPoints: [
    './src/popup.js',
    './src/background.js',
    './src/content-script.js'
  ],
  logLevel: 'debug',
  outdir: 'dist',
  jsxFactory: 'h',
  loader: {
    '.js': 'jsx'
  },
  bundle: true,
  watch,
  plugins: [copyStaticFiles({
    src: './assets',
    dest: 'dist'
  })],
})
