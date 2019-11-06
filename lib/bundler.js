const g = require('./g')
const p = require('./p')
const archiver = require('archiver-promise')

const bundle = config => {
  return Promise.all(
    config.map(bundle => {
      const dependencies = p.walk(bundle.packages)
      const flist = g.sync([...bundle.files, ...dependencies])

      const archive = archiver(bundle.dist)
      flist.forEach(name => archive.file(name, { name }))
      return archive.finalize()
    })
  )
}

module.exports = { bundle }
