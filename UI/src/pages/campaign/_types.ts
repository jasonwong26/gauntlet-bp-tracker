import { CharacterSummary } from "../characters/_types";
import * as CharactersViewTypes from "../characters/View/_types";

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
// TODO: refactor types to eliminte inheritance
export interface CampaignSettings extends CharactersViewTypes.Campaign {
}

export interface PurchaseAlert {
  character: CharacterSummary,
  item: CharactersViewTypes.PurchasedItem
}