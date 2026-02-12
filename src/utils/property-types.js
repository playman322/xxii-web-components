import { isNil } from './helpers.js';

const DESERIALIZERS = {
  String: (str) => str,

  Number: (str) => {
    const trimmed = str.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isNaN(n) ? 0 : n;
  },

  Boolean: (str) => str === 'true',

  Object: (str) => {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  },

  Array: (str) => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
};

const SERIALIZERS = {
  String: (value) => !isNil(value) ? String(value) : '',
  Number: (value) => String(value),
  Boolean: (value) => String(value),
  
  Object: (value) => {
    try {
      return JSON.stringify(value);
    } catch {
      return '{}';
    }
  },
  
  Array: (value) => {
    try {
      return JSON.stringify(value);
    } catch {
      return '[]';
    }
  },
};

const NORMALIZERS = {
  String,
  Number,
  Boolean,
  
  Object: (value) => {
    if (isNil(value)) return {};
    return typeof value === 'object' && !Array.isArray(value) ? value : {};
  },
  
  Array: (value) => {
    if (isNil(value)) return [];
    return Array.isArray(value) ? value : [];
  },
};

export function deserializeAttribute(str, type) {
  if (isNil(str)) return undefined;

  const deserializer = DESERIALIZERS[type.name];
  return deserializer ? deserializer(str) : str;
}

export function serializeAttribute(value, type) {
  const serializer = SERIALIZERS[type.name];
  return serializer ? serializer(value) : (!isNil(value) ? String(value) : '');
}

export function normalizeValue(value, type) {
  const normalizer = NORMALIZERS[type?.name];
  return normalizer ? normalizer(value) : value;
}
