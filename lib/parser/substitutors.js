const SpecialCharsRx = /[<&>]/
const SpecialCharsTr = { '>': '&gt;', '<': '&lt;', '&': '&amp;' }

const AttributeReferenceRx = /(\\)?\{(\w[\w-]*|(set|counter2?):.+?)(\\)?}/g

// Detects if text is a possible candidate for the quotes substitution.
const QuotedTextSniffRx = { 'false': /[*_`#^~]/, 'true': /[*'_+#^~]/ }

const BASIC_SUBS = ['specialcharacters']
const HEADER_SUBS = ['specialcharacters', 'attributes']
const NO_SUBS = []
export const NORMAL_SUBS = ['specialcharacters', 'quotes', 'attributes', 'replacements', 'macros', 'post_replacements']
const REFTEXT_SUBS = ['specialcharacters', 'quotes', 'replacements']
const VERBATIM_SUBS = ['specialcharacters', 'callouts']

const SUB_GROUPS = {
  'none': NO_SUBS,
  'normal': NORMAL_SUBS,
  'verbatim': VERBATIM_SUBS,
  'specialchars': BASIC_SUBS,
}

const SUB_HINTS = {
  'a': 'attributes',
  'm': 'macros',
  'n': 'normal',
  'p': 'post_replacements',
  'q': 'quotes',
  'r': 'replacements',
  'c': 'specialcharacters',
  'v': 'verbatim',
}

const SUB_OPTIONS = {
  'block': Object.keys(SUB_GROUPS).concat(NORMAL_SUBS).concat('callouts'),
  'inline': Object.keys(SUB_GROUPS).concat(NORMAL_SUBS),
}

function substituteAttributes (text, attrs) {
  return text.replaceAll(AttributeReferenceRx, (_, leadingEscape, attributeName, trailingEscape) => {
    if (leadingEscape === '\\' || trailingEscape === '\\') {
      return `{${attributeName}}`
    }
    if (attributeName in attrs) {
      return attrs[attributeName]
    }
    return `{${attributeName}}`
  })
}

export default function applySubstitution (text, attrs, subs = NORMAL_SUBS) {
  if (text.length === 0 || subs.length === 0) {
    // nothing to do
    return text
  }
  for (const sub of subs) {
    if (sub === 'attributes') {
      if (text.includes('{')) {
        text = substituteAttributes(text, attrs)
      }
    }
  }
  return text
}
