#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const { bundle } = require('../lib/bundler')

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
  fs.readFileSync(path.join(options.path, 'package.json'))
)

bundle(bundles).then(_ => console.log('Bundles ready'))
