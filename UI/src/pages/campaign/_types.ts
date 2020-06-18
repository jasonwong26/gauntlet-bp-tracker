import { CharacterSummary } from "../characters/_types";
import { PurchasedItem } from "../characters/View/_types";

export interface CampaignSummary {
  id: string,
  title: string,
  author: string
}

export interface Campaign extends CampaignSummary {
  description: string
  authorEmail: string,
  characters: CharacterSummary[]
}

export interface PurchaseAlert {
  character: CharacterSummary,
  item: PurchasedItem
}