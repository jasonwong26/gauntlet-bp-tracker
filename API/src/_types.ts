export interface Event {
  isBase64Encoded: boolean
  requestContext: {
    apiId: string
    connectionId: string,
    domainName: string,
    routeKey: string,
    messageId: string | null,
    eventType: string,
    extendedRequestId: string,
    requestTime: string,
    messageDirection: string,
    stage: string,
    connectedAt: number,
    requestTimeEpoch: number,
    requestId: string,
  }
}
export interface ConnectEvent extends Event {
  queryStringParameters?: {
    [key: string]: string
  }
}
export interface MessageEvent extends Event {
  body: string,
}

export interface Response {
  statusCode: number 
  body: string 
}
export type AsyncEventHandler<TEvent extends Event> = (event: TEvent) => Promise<Response>;

export interface Campaign {
  id: string,
  title: string,
  author: string,
  description: string
  authorEmail?: string,
  characters: CharacterSummary[]
}
export interface CharacterSummary {
  id: string,
  name: string,
  avatarUrl?: string,
  race: string,
  class: string
}
export interface Character extends CharacterSummary {
  history: PurchasedItem[]
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

interface DbRecord {
  pk: string,
  sk: string,
}
interface DbTypeRecord extends DbRecord {
  type: string,
  typeSk: string
}
export interface DbCampaign extends DbTypeRecord {
  campaign: Campaign
}
export interface DbCampaignSettings extends DbTypeRecord {
  settings: CampaignSettings
}
export interface DbCharacter extends DbTypeRecord {
  character: Character
}
export interface DbConnection extends DbTypeRecord {
  connectionId: string,
  created: number
}
export interface DbAlert extends DbTypeRecord {
  alert: BaseAlert
}

export interface PurchasedItem {
  id: string,
  key: string,
  description: string
  level: number,
  tier: number,
  points: number
  purchaseDate: number
}

interface BaseAlert {
  action: string,
  alertDate: number
}
export interface ActionAlert extends BaseAlert {
  description: string
}
export interface PurchaseAlert extends BaseAlert {
  character: CharacterSummary,
  item: PurchasedItem
}
