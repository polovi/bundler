#!/usr/bin/env node

const fs = require('fs')
const { bundle } = require('../index')

const [, , ...args] = process.argv

const options = args
  .map(arg => arg.split('='))
  .reduce(
    (option, [o, v]) => ({
      ...option,
      ...{
        '--path': { path: v }
      }[o]
    }),
    { path: process.cwd() }
  )

const { bundles = [] } = JSON.parse(
  fs.readFileSync(options.path + '/package.json')
)

bundle(bundles, options.path)
