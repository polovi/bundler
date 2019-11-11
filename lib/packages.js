const { readFileSync } = require('fs')
const path = require('path')

const toData = curpath => packageName => ({
  name: packageName,
  path: path.join(curpath, 'node_modules', packageName)
})

const processPackage = (state, seen) => (res, package) => {
  try {
    const { dependencies = {} } = JSON.parse(
      readFileSync(package.path + '/package.json', 'utf8')
    )

    if (!state.parent) {
      res.push(path.relative(state.root, package.path) + '/**')
    }

    return [
      ...res,
      ...walk(
        Object.keys(dependencies),
        {
          path: package.path,
          root: state.root,
          parent: state
        },
        seen
      )
    ]
  } catch (error) {
    return state.parent
      ? [...res, ...walk([package.name], state.parent, seen)]
      : res
  }
  return res
}

const walk = (packages, opt = {}, seen = new Set()) => {
  opt.path = opt.path || process.cwd()

  const state = {
    path: opt.path,
    root: opt.root || opt.path,
    parent: opt.parent
  }

  return packages
    .map(toData(opt.path))
    .filter(p => (!seen.has(p.path) ? seen.add(p.path) : false))
    .reduce(processPackage(state, seen), [])
}

const sync = (packages = [], path = process.cwd()) => {
  return walk(packages, { path, root: path })
}

module.exports = { sync }
