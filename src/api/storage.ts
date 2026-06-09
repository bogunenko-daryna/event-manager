export function readStorage<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);

  if (!value) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  return JSON.parse(value) as T;
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
