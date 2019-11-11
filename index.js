const packages = require('./lib/packages')
const glob = require('./lib/glob')
const { ZipFile } = require('yazl')
const fs = require('fs')

const getFilePath = (file, replaces = {}) => {
  return Object.keys(replaces).reduce((path, pattern) => {
    const re = new RegExp(pattern, 'i')
    return re.test(path) ? path.replace(re, replaces[pattern]) : path
  }, file)
}

const bundle = (bundles = [], path) =>
  Promise.all(
    bundles.map(bundle => {
      const files = glob.sync(
        [...bundle.files, ...packages.sync(bundle.packages, path)],
        path
      )

      return new Promise((resolve, reject) => {
        const archive = new ZipFile()
        files.forEach(file => {
          archive.addFile(file, getFilePath(file, bundle.replacePath))
        })
        archive.outputStream
          .pipe(fs.createWriteStream(bundle.output))
          .on('error', reject)
          .on('close', _ => resolve())
        archive.end()
      })
    })
  )

module.exports = { bundle }
