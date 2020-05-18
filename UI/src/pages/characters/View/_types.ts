
export type SetEncounter = (encounter: Encounter) => void;
export type OnPurchase = (item: PurchaseItem) => void;
export type OnRemove = (item: PurchasedItem) => void;

export interface App {
  activeEncounter: Encounter, 
  encounters: Encounter[],
  purchaseBlocks: PurchaseBlock[],
  history: HistoryTier[],
  setEncounter: SetEncounter
  onPurchase: OnPurchase
  onRemove: OnRemove
  getState: () => AppState
}

export interface Campaign {
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

export interface AppState {
  profile: Profile,
  balance: number,
  activeEncounter: Encounter, 
  encounters: Encounter[],
  purchaseBlocks: PurchaseBlock[],
  history: HistoryTier[],
}
export interface Profile {
  name: string,
  avatarUrl: string,
  race: string,
  class: string
}
export interface PurchaseBlock {
  key: string,
  title: string,
  defaultActive: boolean
  items: PurchaseItem[]
}
export interface HistoryTier {
  tier: number,
  startingBalance: number,
  endingBalance: number,
  levels: HistoryLevel[]
}
export interface HistoryLevel {
  level: number,
  startingBalance: number,
  endingBalance: number,
  encounter: Encounter,
  items: HistoryItem[]
}
export interface HistoryItem extends PurchasedItem {
  balance: number
}
