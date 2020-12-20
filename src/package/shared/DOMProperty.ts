type PropertyType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// A reserved attribute.
// It is handled by React separately and shouldn't be written to the DOM.
export const RESERVED = 0;

// A simple string attribute.
// Attributes that aren't in the whitelist are presumed to have this type.
export const STRING = 1;

// A string attribute that accepts booleans in React. In HTML, these are called
// "enumerated" attributes with "true" and "false" as possible values.
// When true, it should be set to a "true" string.
// When false, it should be set to a "false" string.
export const BOOLEANISH_STRING = 2;

// A real boolean attribute.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.
export const BOOLEAN = 3;

// An attribute that can be used as a flag as well as with a value.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.
// For any other value, should be present with that value.
export const OVERLOADED_BOOLEAN = 4;

// An attribute that must be numeric or parse as a numeric.
// When falsy, it should be removed.
export const NUMERIC = 5;

// An attribute that must be positive numeric or parse as a positive numeric.
// When falsy, it should be removed.
export const POSITIVE_NUMERIC = 6;

export type PropertyInfo = {
  acceptsBooleans: boolean,
  attributeName: string,
  attributeNamespace: string | null,
  mustUseProperty: boolean,
  propertyName: string,
  type: PropertyType,
};

// When adding attributes to this list, be sure to also add them to
// the `possibleStandardNames` module to ensure casing and incorrect
// name warnings.
const properties = {};

export function getPropertyInfo(name: string): PropertyInfo | null {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}

/* eslint-disable max-len */
export const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
/* eslint-enable max-len */
export const ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

export const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
  '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$',
);

const hasOwnProperty = Object.prototype.hasOwnProperty;
const illegalAttributeNameCache = {};
const validatedAttributeNameCache = {};
export function isAttributeNameSafe(attributeName: string): boolean {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true
  }
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true
  return false;
}

// 判断该属性是否忽略
export function shouldIgnoreAttribute(
  name: string,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean
): boolean {
  if (propertyInfo !== null) {
    return propertyInfo.type === RESERVED
  }

  if (isCustomComponentTag) {
    return false
  }
  // 点击事件属性
  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return true
  }
  return false
}

export function shouldRemoveAttributeWithWarning(
  name: string,
  value: any,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean
): boolean {
  if (propertyInfo !== null && propertyInfo.type === RESERVED) {
    return false
  }
  switch(typeof value) {
    case 'function':
    case 'symbol':
        return true
    case 'boolean': {
      if (isCustomComponentTag) {
        return false
      }
      if (propertyInfo !== null) {
        return !propertyInfo.acceptsBooleans
      } else {
        const prefix = name.toLowerCase().slice(0, 5);
        return prefix !== 'data-' && prefix !== 'aria-';
      }
    }
    default:
      return false
  }
}

export function shouldRemoveAttribute(
  name: string,
  value: any,
  propertyInfo: PropertyInfo | null,
  isCustomComponentTag: boolean
): boolean {
  if (value === null || typeof value === 'undefined') {
    return true
  }
  if (
    shouldRemoveAttributeWithWarning(
      name,
      value,
      propertyInfo,
      isCustomComponentTag
    )) {
      return true
    }
  
  if (isCustomComponentTag) {
    return false
  }

  if (propertyInfo !== null) {
    switch(propertyInfo.type) {
      case BOOLEAN:
        return !value
      case OVERLOADED_BOOLEAN:
        return value === false;
      case NUMERIC:
        return isNaN(value);
      case POSITIVE_NUMERIC:
        return isNaN(value) || value < 1
    }
  }

  return false
}