import shortid from "shortid";

import { CampaignSettings, Character, Encounter, PurchasedItem, PurchaseItem } from "../../../../types";
import { AppState, HistoryItem, HistoryLevel, HistoryTier, PurchaseBlock } from "./_types";

type GetBalance = (history: HistoryTier[], activeEncounter: Encounter) => number;

export interface AppService {
  setEncounter: (encounter: Encounter) => void
  onPurchase: (item: PurchaseItem) => PurchasedItem
  onRemove: (item: PurchasedItem) => void
  getState: () => AppState | undefined
  getCharacter: () => Character
}

export class CharacterAppService implements AppService {
  campaign: CampaignSettings;
  character: Character;  
  activeEncounter: Encounter;

  constructor(campaign: CampaignSettings, character: Character) {
    this.campaign = campaign;
    this.character = character;
    this.activeEncounter = this.getDefaultEncounter();
  }
  getDefaultEncounter: () => Encounter = () => {
    const defaultEncounter = this.campaign.encounters[0];

    const index = this.character.history.reduce((count, current) => {
      if (current.key.startsWith("en")) {
        return count + 1;
      }
      return count;
    }, 0);

    if(index < this.campaign.encounters.length) {
      return this.campaign.encounters[index];
    }

    return defaultEncounter;
  }

  public setEncounter = (encounter: Encounter) : void => {
    const newEncounter = this.campaign.encounters.find(e => e.level === encounter.level);
    if(!newEncounter) return;
    this.activeEncounter = newEncounter;
  }
  public onPurchase = (item: PurchaseItem) : PurchasedItem => {
    const purchasedItem : PurchasedItem = {
      ...item, 
      id: shortid.generate(),
      tier: this.activeEncounter.tier,
      level: this.activeEncounter.level,
      purchaseDate: new Date().getTime()
    };

    const index = this.character.history.findIndex(value => {
      return purchasedItem.level < value.level;
    });
    if(index < 0) {
      this.character.history.push(purchasedItem);
    } else {
      this.character.history.splice(index, 0, purchasedItem);  
    }

    return purchasedItem;
  }
  public onRemove = (item: PurchasedItem) : void => {
    const index = this.character.history.findIndex(value => {
      return item.id === value.id;
    });
    this.character.history.splice(index, 1);
  }

  public getState = () : AppState | undefined => {
    if(!this.campaign || !this.character) return undefined;

    const history = this.buildHistory();
    const balance = this.getBalance(history, this.activeEncounter);

    return {
      balance,
      activeEncounter: { ...this.activeEncounter },
      encounters: [ ...this.campaign.encounters ],
      purchaseBlocks: this.setPurchaseBlocks(),
      history
    };    
  }
  buildHistory: () => HistoryTier[] = () => {
    // build map of purchases w/ running balances
    const transactions = this.buildTransactionMap(this.character);
    
    const history: HistoryTier[] = [];
    const tiers = new Map<number, HistoryTier>();

    let balance = 0;
    this.campaign.encounters.forEach(e => {
      const startingBalance = balance;
      const items = transactions.get(e.level) || [];
      if(items.length) {
        const lastItem = items[items.length - 1];
        balance = lastItem.balance + lastItem.points;
      }
      const level: HistoryLevel = { 
        level: e.level, 
        encounter: e, 
        startingBalance, 
        endingBalance: balance, 
        items 
      };

      const tier = tiers.get(e.tier);
      if(!tier) {
        const newTier: HistoryTier = { 
          tier: e.tier, 
          startingBalance: level.startingBalance, 
          endingBalance: level.endingBalance, 
          levels: [ level ] 
        };
        history.push(newTier);
        tiers.set(e.tier, newTier);
      } else {
        tier.levels.push(level);
        tier.endingBalance = level.endingBalance;
      }
    });

    return history;
  }
  buildTransactionMap = (character: Character) : Map<number, HistoryItem[]> => {
    const map = new Map<number, HistoryItem[]>();
    let balance = 0;
    character.history.forEach(t => {
      const item: HistoryItem = {
        ...t,
        balance
      };

      let arr = map.get(t.level);
      if(!arr) {
        arr = [];
        map.set(t.level, arr);
      }
      arr.push(item);
  
      // update balance for next iteration
      balance += t.points;
    });

    return map;      
  }

  getBalance: GetBalance = (history, activeEncounter) => {
    const i = history.findIndex(t => t.tier === activeEncounter.tier);
    const n = history[i].levels.findIndex(l => l.level === activeEncounter.level);
    
    return history[i].levels[n].endingBalance;
  }
  setPurchaseBlocks: () => PurchaseBlock[] = () => {
    return [ 
      this.buildEncounters(),
      this.buildAchievements(), 
      this.buildRests(), 
      this.buildPotions(),
      this.buildWeapons(),
      this.buildArmor(),
      this.buildMagic()
    ];
  }
  buildEncounters: () => PurchaseBlock = () => {
    const level = this.activeEncounter.level;
    const encounterItem: PurchaseItem = {
      key: `en${level}`,
      description: `Complete Encounter ${level}`,
      points: this.activeEncounter.points
    };

    const revive: PurchaseItem = {
      key: `rv${level}`,
      description: `Revive Character (Level ${level})`,
      points: level * -75
    };

    return {
      key: "pb-encounters",
      title: "Encounters",
      defaultActive: true,
      items: [ encounterItem, revive ]
    };
  }
  buildAchievements: () => PurchaseBlock = () => {
    return {
      key: "pb-achievements",
      title: "Achievements",
      defaultActive: false,
      items: [ ...this.campaign.achievements ]
    };
  }
  buildRests: () => PurchaseBlock = () => {
    const tier = this.activeEncounter.tier;
    const available = this.campaign.restsAndImprovements.filter(item => item.tier === tier || item.tier == null);

    return {
      key: "pb-recovery",
      title: "Recovery & Improvement",
      defaultActive: false,
      items: [ ...available ]
    };
  }
  buildPotions: () => PurchaseBlock = () => {
    return {
      key: "pb-potions",
      title: "Potions",
      defaultActive: false,
      items: [...this.campaign.potions]
    };
  }
  buildWeapons: () => PurchaseBlock = () => {
    return {
      key: "pb-weapons",
      title: "Weapons",
      defaultActive: false,
      items: [...this.campaign.weapons]
    };
  }
  buildArmor: () => PurchaseBlock = () => {
    return {
      key: "pb-armor",
      title: "Armor",
      defaultActive: false,
      items: [...this.campaign.armor]
    };
  }
  buildMagic: () => PurchaseBlock = () => {
    return {
      key: "pb-magic",
      title: "Magic",
      defaultActive: false,
      items: [...this.campaign.magic]
    };
  }
  public getCharacter = () : Character => {
    const history = [...this.character.history];
    return {...this.character, history};
  }
}
