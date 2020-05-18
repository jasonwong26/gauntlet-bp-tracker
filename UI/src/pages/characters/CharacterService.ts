import { DataService } from "../../utility";
import { Character } from "./View/_types";

export interface CharacterSummary {
  id: string,
  name: string,
  avatarUrl?: string,
  race: string,
  class: string
}

export class CharacterService {
  service: DataService;

  constructor (service: DataService) {
    this.service = service;
  }

  getListKey = () => {
    return "characters-list";
  }
  getStorageKey = (id: string) => {
    return `character-${id}`;
  }

  public list = async () => {
    const key = this.getListKey();
    let list = await this.service.fetch<CharacterSummary[]>(key);

    if(!list) list = [];
    await this.saveList(list);

    return list;
  }
  saveList = async(items: CharacterSummary[]) => {
    const key = this.getListKey();
    await this.service.save(key, items);
  } 

  public fetch = async (id: string) => {
    const key = this.getStorageKey(id);
    return this.service.fetch<Character>(key);
  }

  public create = async (item: Character) => {
    const key = this.getStorageKey(item.id);
    await this.service.save(key, item);
    await this.appendToList(item);
  }
  appendToList = async (item: Character) => {
    const summary: CharacterSummary = {
      id: item.id,
      name: item.name,
      avatarUrl: item.avatarUrl,
      race: item.race,
      class: item.class
    }; 
    const list = await this.list();
    const insertAt = list.findIndex(value => value.name > summary.name);

    const appended = insertAt < 0 
      ? [...list, summary] 
      : list.splice(insertAt, 0, summary);

    await this.saveList(appended);
  }

  public save = async (item: Character) => {
    const key = this.getStorageKey(item.id);
    await this.service.save(key, item);
  }

  public delete = async (id: string) => {
    const key = this.getStorageKey(id);
    await this.service.delete(key);
    await this.removeFromList(id);
  }
  removeFromList = async(id: string) => {
    const list = await this.list();
    const index = list.findIndex(value => value.id === id);

    if(index < 0) return;

    list.splice(index, 1);
    await this.saveList(list);
  }
}