const globalyzer = require('globalyzer')
const globrex = require('globrex')
const path = require('path')
const fs = require('fs')

const defaultIgnoreRules = [
  /(^|[\/])\.[^\/\.)]/, //dot files
  /^(readme|copying|notice|changes|changelog|history){1}(|\.([^/]*))$/i,
  /^examples?$/,
  /^(__tests__|test){1}$/,
  /.*\.ts$/,
]

const toRule = pattern => {
  const s = globalyzer(pattern)
  const { regex, path } = globrex(pattern, {
    filepath: true,
    globstar: true,
    extended: true,
  })
  return {
    s,
    // base: !s.isGlob && s.base === '.' ? s.glob : s.base,
    base: s.base === '.' ? '' : s.base,
    pattern: regex,
    startSegment: s.base === '.' ? 0 : s.base.split('/').length,
    segments: path.segments,
    globstar: path.globstar,
  }
}

const ignore = rule => file => !defaultIgnoreRules.find(rule => rule.test(file))

const test = (rule, root, base, level) => (results, entry) => {
  const rgx = rule.segments[level]

  if (rgx.test(entry)) {
    return [
      ...results,
      ...walk(
        rule,
        root,
        base + '/' + entry,
        String(rule.segments[level]) !== String(rule.globstar) ? level + 1 : level
      ),
    ]
  }

  return results
}

const walk = (rule, root, base, level = 0) => {
  const abs = root + '/' + base
  const rel = abs.substr(root.length + 1).replace(/^\//, '')
  const stats = fs.statSync(abs)

  if (stats.isDirectory()) {
    return fs
      .readdirSync(abs)
      .filter(ignore(rule))
      .reduce(test(rule, root, rel, level), [])
  }

  return stats.isFile() && rule.pattern.test(rel) ? [rel] : []
}

const sync = (patterns, root = process.cwd()) => {
  return [
    ...new Set(patterns.map(toRule).reduce((r, rule) => [...r, ...walk(rule, root, rule.base, rule.startSegment)], [])),
  ]
}

module.exports = { sync }
