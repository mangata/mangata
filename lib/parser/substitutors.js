const AttributeReferenceRx = /(\\)?\{(\w[\w-]*|(set|counter2?):.+?)(\\)?}/g

export const NORMAL_SUBS = ['specialcharacters', 'quotes', 'attributes', 'replacements', 'macros', 'post_replacements']

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
