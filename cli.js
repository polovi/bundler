const { resolve } = require('path')
const bundler = require('./index.js')

const [, , ...args] = process.argv

const options = args
  .map(arg => arg.split('='))
  .reduce(
    (option, [o, v]) => ({
      ...option,
      ...{
        '--files': { files: v.split(',') },
        '--packages': { packages: v.split(',') },
        '--path': { path: v }
      }[o]
    }),
    {}
  )

bundler.bundle({
  files: options.files || [],
  packages: options.packages || [],
  path: resolve(options.path || process.cwd())
})
