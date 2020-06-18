import { Campaign } from "../pages/characters/View/_types";

export const campaign: Campaign = {
  encounters: [
    { tier: 1, level: 1, points: 100 },
    { tier: 1, level: 2, points: 100 },
    { tier: 1, level: 3, points: 100 },
    { tier: 1, level: 4, points: 300 },
    { tier: 2, level: 5, points: 250 },
    { tier: 2, level: 6, points: 250 },
    { tier: 2, level: 7, points: 250 },
    { tier: 2, level: 8, points: 250 },
    { tier: 2, level: 9, points: 250 },
    { tier: 2, level: 10, points: 1000 },
    { tier: 3, level: 11, points: 750 },
    { tier: 3, level: 12, points: 750 },
    { tier: 3, level: 13, points: 750 },
    { tier: 3, level: 14, points: 750 },
    { tier: 3, level: 15, points: 750 },
    { tier: 3, level: 16, points: 2000 }, 
    { tier: 4, level: 17, points: 1250 },
    { tier: 4, level: 18, points: 1250 },
    { tier: 4, level: 19, points: 1250 },
    { tier: 4, level: 20, points: 1250 }
  ],  
  achievements: [
    { key: "a1", description: "Break an enemy’s concentration", points: 10 },
    { key: "a2", description: "End a condition affecting an ally*", points: 10 },
    { key: "a3", description: "Finish an Encounter without taking damage", points: 10 },
    { key: "a4", description: "Kill two or more monsters in one turn", points: 10 },
    { key: "a5", description: "Roll a 20 on a Death Saving Throw", points: 10 },
    { key: "a6", description: "Roll a critical hit", points: 10 },
    { key: "a7", description: "Stabilize an ally with 0 hit points", points: 10 },
    { key: "a8", description: "Finish the Encounter as last ally standing", points: 10 },
    { key: "a9", description: "Finish the Encounter in one round", points: 100 },
    { key: "a10", description: "Finish the Encounter in two rounds", points: 60 },
    { key: "a11", description: "Finish the Encounter in three rounds", points: 25 }
  ],  
  restsAndImprovements: [
    { key: "sr1", description: "Short Rest (Phase 1)", points: -80, tier: 1 },
    { key: "lr1", description: "Long Rest (Phase 1)", points: -275, tier: 1 },
    { key: "sr2", description: "Short Rest (Phase 2)", points: -200, tier: 2 },
    { key: "lr2", description: "Long Rest (Phase 2)", points: -675, tier: 2 },
    { key: "sr3", description: "Short Rest (Phase 3)", points: -475, tier: 3 },
    { key: "lr3", description: "Long Rest (Phase 3)", points: -1650, tier: 3 },
    { key: "sr4", description: "Short Rest (Phase 4)", points: -1125, tier: 4 },
    { key: "lr4", description: "Long Rest (Phase 4)", points: -2750, tier: 4 },
    { key: "asi",description: "Ability Score / Feat", points: -3000 }
  ],
  potions: [
    { key: "ph1", description: "Potion of Healing (2d4+2)", points: -45 },
    { key: "ph2", description: "Potion of Greater Healing (4d4+4)", points: -90 },
    { key: "ph3",description: "Potion of Superior Healing (8d4+8)", points: -225 },
    { key: "ph4",description: "Potion of Supreme Healing (10d4+20)", points: -575 }
  ],
  weapons: [
    { key: "ws1", description: "Simple Weapon +1", points: -500 },
    { key: "wm1", description: "Martial Weapon +1", points: -550 },
    { key: "wf1",description: "Spell Focus +1", points: -550 },
    { key: "ws2", description: "Simple Weapon +2", points: -1850 },
    { key: "wm2", description: "Martial Weapon +2", points: -1900 },
    { key: "wf2",description: "Spell Focus +2", points: -1900 },
    { key: "ws3", description: "Simple Weapon +3", points: -5000 },
    { key: "wm3", description: "Martial Weapon +3", points: -5050 },
    { key: "wf3",description: "Spell Focus +3", points: -5050 }
  ],
  armor: [
    { key: "as1", description: "Shield +1", points: -850 },
    { key: "al1", description: "Light Armor +1", points: -750 },
    { key: "am1", description: "Medium Armor +1", points: -850 },
    { key: "ah1", description: "Heavy Armor +1", points: -1200 },
    { key: "as2", description: "Shield +2", points: -2400 },
    { key: "al2", description: "Light Armor +2", points: -2300 },
    { key: "am2", description: "Medium Armor +2", points: -2400 },
    { key: "ah2", description: "Heavy Armor +2", points: -2750 },
    { key: "as3", description: "Shield +3", points: -5900 },
    { key: "al3", description: "Light Armor +3", points: -5800 },
    { key: "am3", description: "Medium Armor +3", points: -5900 },
    { key: "ah3", description: "Heavy Armor +3", points: -6250 }
  ],
  magic: [
    { key: "ms1", description: "1st Level Spell", points: -100 },
    { key: "ms2", description: "2nd Level Spell", points: -200 },
    { key: "ms3", description: "3rd Level Spell", points: -300 },
    { key: "ms4", description: "4th Level Spell", points: -400 },
    { key: "ms5", description: "5th Level Spell", points: -500 },
    { key: "ms6", description: "6th Level Spell", points: -600 },
    { key: "ms7", description: "7th Level Spell", points: -700 },
    { key: "ms8", description: "8th Level Spell", points: -800 },
    { key: "ms9", description: "9th Level Spell", points: -900 }
  ]
};