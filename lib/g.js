const globalyzer = require('globalyzer')
const globrex = require('globrex')
const fs = require('fs')
const path = require('path')

const patternToRule = pattern => {
  const s = globalyzer(pattern)
  const { regex, path } = globrex(pattern, {
    filepath: true,
    globstar: true,
    extended: true
  })
  return {
    ...s,
    pattern: regex,
    segments: path.segments.slice(s.base.split('/').length),
    globstar: path.globstar
  }
}

const DOT_FILES_REG = new RegExp(/(^|[\\\/])\.[^\\\/\.]/g)

const testDotFiles = filename => !DOT_FILES_REG.test(filename)

const test = (rule, root, entry, level) => (results, file) => {
  const rgx = rule.segments[level]
  if (rgx.test(file)) {
    return [
      ...results,
      ...walk(
        rule,
        root,
        entry + '/' + file,
        String(rule.segments[level]) !== String(rule.globstar)
          ? level + 1
          : level
      )
    ]
  }
  return results
}

const seen = []

const walk = (rule, root, entry, level = 0) => {
  const abs = root + '/' + entry
  const stats = fs.statSync(abs)

  if (stats.isDirectory()) {
    return fs
      .readdirSync(abs)
      .filter(testDotFiles)
      .reduce(test(rule, root, entry, level), [])
  }

  return rule.pattern.test(entry) ? [entry] : []
}

const sync = (patterns, root = process.cwd()) => {
  return [
    ...new Set(
      patterns
        .map(patternToRule)
        .reduce((r, rule) => [...r, ...walk(rule, root, rule.base)], [])
    )
  ]
}

module.exports = { sync, walk, patternToRule }
