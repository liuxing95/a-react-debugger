type PropertyType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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