
export interface DataService {
  fetch: <T>(key: string) => Promise<T | null>;
  save: <T>(key: string, item: T) => Promise<void>;
  delete: (key: string) => Promise<void>;
}