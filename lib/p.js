const fs = require('fs')
const path = require('path')

const readPackageJson = path => {
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'))
  return {
    dependencies: Object.keys(pkg.dependencies || [])
  }
}

const processPackage = state => (set, package) => {
  try {
    const pt = path.join(state.path, 'node_modules', package)
    const { dependencies } = readPackageJson(pt + '/package.json')
    return [
      ...set,
      path.relative(state.root, pt) + '/**',
      ...walk(dependencies, { root: state.root, parent: state, path: pt })
    ]
  } catch (error) {
    return state.parent ? [...set, ...walk([package], state.parent)] : set
  }
}

const walk = (packages, opt = {}) => {
  const state = {
    path: opt.path || process.cwd(),
    root: opt.root || process.cwd(),
    parent: opt.parent
  }
  return Array.from(new Set(packages.reduce(processPackage(state), [])))
}

module.exports = { walk }
