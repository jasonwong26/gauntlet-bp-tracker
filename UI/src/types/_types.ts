
export interface CampaignSummary {
  id: string,
  title: string,
  author: string
}
export interface CharacterSummary {
  id: string,
  name: string,
  avatarUrl?: string,
  race: string,
  class: string
}

export interface Campaign extends CampaignSummary {
  description: string
  authorEmail?: string,
  characters: CharacterSummary[]
}

export interface CampaignSettings {
  encounters: Encounter[],
  achievements: PurchaseItem[],
  restsAndImprovements: PurchaseItem[],
  potions: PurchaseItem[],
  weapons: PurchaseItem[],
  armor: PurchaseItem[],
  magic: PurchaseItem[]
}
export interface Encounter {
  tier: number,
  level: number,
  points: number
}
export interface PurchaseItem {
  key: string,
  description: string
  points: number
  tier?: number
}

export interface Character {
  id: string,
  name: string,
  avatarUrl?: string,
  race: string,
  class: string,
  history: PurchasedItem[]
}
export interface PurchasedItem extends PurchaseItem {
  id: string,
  level: number,
  tier: number,
  purchaseDate: number
}

export interface PurchaseAlert {
  action: string,
  alertDate: number,
  character: CharacterSummary,
  item: PurchasedItem
}

export interface AlertRequest {
  minDate: number,
  maxDate: number,
  pageSize?: number
}