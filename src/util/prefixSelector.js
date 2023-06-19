import parser from 'postcss-selector-parser'

/**
 * @template {string | import('postcss-selector-parser').Root} T
 *
 * Prefix all classes in the selector with the given prefix
 *
 * It can take either a string or a selector AST and will return the same type
 *
 * @param {string} prefix
 * @param {T} selector
 * @param {boolean} prependNegative
 * @returns {T}
 */
export default function (prefix, selector, prependNegative = false) {
  if (prefix === '') {
    return selector
  }

  /** @type {import('postcss-selector-parser').Root} */
  let ast = typeof selector === 'string' ? parser().astSync(selector) : selector

  // ast.walk bails to early when returning so it's not usable here
  function prefixClasses(node) {
    // Prefix any classes we find
    if (node.type === 'class') {
      let baseClass = node.value
      let shouldPlaceNegativeBeforePrefix = prependNegative && baseClass.startsWith('-')

      node.value = shouldPlaceNegativeBeforePrefix
        ? `-${prefix}${baseClass.slice(1)}`
        : `${prefix}${baseClass}`
      return
    }

    // Keep looking for classes
    if (node.length) {
      node.each(prefixClasses)
    }
  }

  ast.each(prefixClasses)

  return typeof selector === 'string' ? ast.toString() : ast
}
