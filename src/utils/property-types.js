import { isNil } from './helpers.js';

export function deserializeAttribute(str, type) {
  if (isNil(str)) return undefined;

  switch (type) {
    case String:
      return str;
    
    case Number: {
      const n = Number(str);
      return Number.isNaN(n) ? 0 : n;
    }
    
    case Boolean:
      return str === 'true';
    
    case Object:
      try {
        const parsed = JSON.parse(str);
        return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    
    case Array:
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    
    default:
      return str;
  }
}

export function serializeAttribute(value, type) {
  switch (type) {
    case String:
      return !isNil(value) ? String(value) : '';
    
    case Number:
      return String(value);
    
    case Boolean:
      return String(value);
    
    case Object:
    case Array:
      try {
        return JSON.stringify(value);
      } catch {
        return type === Array ? '[]' : '{}';
      }
    
    default:
      return !isNil(value) ? String(value) : '';
  }
}

