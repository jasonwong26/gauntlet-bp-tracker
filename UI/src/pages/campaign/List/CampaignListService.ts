import { Campaign, CampaignSummary } from "../../../types";
import { DataService } from "../../../utility";

export class CampaignListService {
  service: DataService;

  constructor (service: DataService) {
    this.service = service;
  }

  getListKey = () : string => {
    return "campaigns-list";
  }

  public list = async () : Promise<CampaignSummary[]> => {
    const key = this.getListKey();
    let list = await this.service.fetch<CampaignSummary[]>(key);

    if(!list) {
      list = [];
      await this.saveList(list);
    }

    return list;
  }
  private saveList = async(items: CampaignSummary[]) : Promise<void> => {
    const key = this.getListKey();
    await this.service.save(key, items);
  }
  
  public exists = async (id: string) : Promise<boolean> => {
    const item = await this.get(id);

    return !!item;
  }
  
  public get = async (id: string) : Promise<CampaignSummary | null> => {
    const list = await this.list();
    const index = list.findIndex(value => value.id === id);

    if(index < 0) return null;
    return list[index];
  }

  public add = async (item: Campaign) : Promise<void> => {
    const { id, title, author } = item;
    const summary: CampaignSummary = { id, title, author }; 

    const list = await this.list();
    const insertAt = list.findIndex(value => value.title > summary.title);
    const appended = insertAt < 0 
      ? [...list, summary] 
      : list.splice(insertAt, 0, summary);

    await this.saveList(appended);
  }

  remove = async(id: string) : Promise<void> => {
    const list = await this.list();
    const index = list.findIndex(value => value.id === id);

    if(index < 0) return;

    list.splice(index, 1);
    await this.saveList(list);
  }
}