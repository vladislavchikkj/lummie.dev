export interface FormulaProcessingResult {
  textWithPlaceholders: string
  formulas: string[]
}

const PATTERNS = {
  brackets: /\\\[([\s\S]*?)\\\]/,
  doubleDollar: /\$\$([\s\S]*?)\$\$/,
  environment: /\\begin\{([a-zA-Z*]+)\}([\s\S]*?)\\end\{\1\}/,
  parens: /\\\(([\s\S]*?)\\\)/,
  singleDollar: /\$([^$]*?)\$(?!\d)/,
}

const FORMULA_REGEX = new RegExp(
  [
    PATTERNS.brackets.source,
    PATTERNS.doubleDollar.source,
    PATTERNS.environment.source,
    PATTERNS.parens.source,
    PATTERNS.singleDollar.source,
  ].join('|'),
  'g'
)

export function processFormulas(content: string): FormulaProcessingResult {
  const formulas: string[] = []
  let placeholderIndex = 0

  const textWithPlaceholders = content.replace(
    FORMULA_REGEX,
    (
      match,
      brackets,
      doubleDollar,
      envName,
      envContent,
      parens,
      singleDollar
    ) => {
      let formula = ''
      let isBlock = false

      if (brackets) {
        formula = brackets
        isBlock = true
      } else if (doubleDollar) {
        formula = doubleDollar
        isBlock = true
      } else if (envName && envContent !== undefined) {
        formula = `\\begin{${envName}}${envContent}\\end{${envName}}`
        isBlock = true
      } else if (parens) {
        formula = parens
      } else if (singleDollar) {
        formula = singleDollar
      }

      if (formula) {
        const normalizedFormula = isBlock ? `$$${formula}$$` : `$${formula}$`
        formulas.push(normalizedFormula)
        return ` %${placeholderIndex++}% `
      }

      return match
    }
  )

  return { textWithPlaceholders, formulas }
}

export function restoreFormulas(
  textWithPlaceholders: string,
  formulas: string[]
): string {
  let result = textWithPlaceholders
  formulas.forEach((formula, index) => {
    const placeholder = ` %${index}% `
    result = result.replace(placeholder, formula)
  })
  return result
}
