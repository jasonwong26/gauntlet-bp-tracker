import { DataService } from "./_types";

export class LocalStorageService implements DataService {
  public fetch = async <T>(key: string) : Promise<T | null> => {
    if(!key) throw new Error("storage key not defined!");

    const value = localStorage.getItem(key);
    if(!value) return null;

    const obj = JSON.parse(value);
    return obj as T;
  }

  public save = async <T>(key: string, item: T) : Promise<void> => {
    if(!key) throw new Error("storage key not defined!");

    const value = JSON.stringify(item);
    localStorage.setItem(key, value);

    return;
  }

  public delete = async (key: string) : Promise<void> => {
    if(!key) throw new Error("storage key not defined!");

    localStorage.removeItem(key);
    return;
  }
}
