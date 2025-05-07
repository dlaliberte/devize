// Mock registry module
const typeRegistry: Record<string, any> = {};

export function registerType(type: any): void {
  typeRegistry[type.name] = type;
}

export function getType(name: string): any {
  return typeRegistry[name];
}

export function hasType(name: string): boolean {
  return !!typeRegistry[name];
}

export function getAllTypes(): any[] {
  return Object.values(typeRegistry);
}

export function _resetRegistryForTesting(): void {
  Object.keys(typeRegistry).forEach(key => {
    delete typeRegistry[key];
  });
}
