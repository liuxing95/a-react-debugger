
export type DOMTopLevelEventType = string;

export function unsafeCastStringToDOMTopLevelType(
  topLevelType: string,
): DOMTopLevelEventType {
  return topLevelType;
}

export function unsafeCastDOMTopLevelTypeToString(
  topLevelType: DOMTopLevelEventType,
): string {
  return topLevelType;
}