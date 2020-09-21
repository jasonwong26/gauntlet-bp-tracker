import { Encounter, PurchasedItem, PurchaseItem } from "../../../../types";

export interface AppState {
  balance: number,
  activeEncounter: Encounter, 
  encounters: Encounter[],
  purchaseBlocks: PurchaseBlock[],
  history: HistoryTier[],
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