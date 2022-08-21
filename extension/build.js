import esbuild from 'esbuild'
import copy from 'esbuild-copy-files-plugin'

const main = () => {
  const args = process.argv
  const watch = args.indexOf('--watch') !== -1
  const manifestType = args.indexOf('--manifest2') !== -1 ? 2 : 3
  const outdir = `dist_m${manifestType}`

  esbuild.build({
    entryPoints: [
      './src/popup',
      './src/background',
      './src/content-script'
    ],
    logLevel: 'debug',
    outdir,
    loader: {
      '.js': 'jsx'
    },
    bundle: true,
    watch,
    plugins: [copy({
      source: [`./manifest_${manifestType}/manifest.json`, './assets',],
      target: outdir
    })]
  })
}

main()
