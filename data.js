import chalk from 'chalk'
import { apply_map } from './funcs.js'

function xp_modifier_from_single_prime_req(value) {
    return apply_map([
        { limit: 5, modifier: -20 },
        { limit: 8, modifier: -10 },
        { limit: 12, modifier: 0 },
        { limit: 15, modifier: 5 }
    ], 10, value);
}

const classes = [
    {
        name: "Cleric",
        description: "Cleric (prime requisite WIS)",
        allowed: () => true,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(wis),
        other_info: "Blunt weapons only, Turn undead",
        blunt_weapons_only: true,
        languages: "Alignment, Common",
        divine_magic: true,
        spells: [
            [], [1], [2], [2, 1],
            [2, 2], [2, 2, 1, 1], [2, 2, 2, 1, 1], [3, 3, 2, 2, 1],
            [3, 3, 3, 2, 2], [4, 4, 3, 3, 2], [4, 4, 4, 3, 3], [5, 5, 4, 4, 3],
            [5, 5, 5, 4, 4], [6, 5, 5, 5, 4]
        ],
        max_level: 14,
        post_level_9_hd: [1, 2, 3, 4, 5],
        thac0: [ { level: 4, value: 19 }, { level: 8, value: 17 }, { level: 12, value: 14 }, { level: 14, value: 12 } ],
        base_xp: [ 0, 1500, 3000, 6000, 12_000, 25_000, 50_000, 100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000 ],
        saves: [ { level: 4, values: [ 11, 12, 14, 16, 15 ] }, { level: 8, values: [ 9, 10, 12, 14, 12 ] },
                 { level: 12, values: [ 6, 7, 9, 11, 9 ] }, { level: 14, values: [ 3, 5, 7, 8, 7 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Dwarf",
        description: "Dwarf (prime requisite STR)",
        allowed: (str, dex, con, int, wis, cha) => con >= 9,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str),
        other_info: "Infravision 60, Listening at doors 2-in-6, Detect room traps 2-in-6, Detect construction tricks 2-in-6, Weapons small/normal sized only",
        small_normal_weapons_only: true,
        languages: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold",
        max_level: 12,
        post_level_9_hd: [3, 6, 9],
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 9, value: 14 }, { level: 12, value: 12 } ],
        base_xp: [ 0, 2200, 4400, 8800, 17_000, 35_000, 70_000, 140_000, 270_000, 400_000, 530_000, 660_000 ],
        saves: [ { level: 3, values: [ 8, 9, 10, 13, 12 ] }, { level: 6, values: [ 6, 7, 8, 10, 10 ] },
                 { level: 9, values: [ 4, 5, 6, 7, 8 ] }, { level: 12, values: [ 2, 3, 4, 4, 6 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Elf",
        description: "Elf (prime requisite INT and STR)",
        allowed: (str, dex, con, int, wis, cha) => int >= 9,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => {
            if (int >= 16 && str >= 13)
                return 10;
            if (int >= 13 && str >= 13)
                return 5;
            return 0;
        },
        other_info: "Infravision 60, Listening at doors 2-in-6, Detect secret doors 2-in-6, Immune to ghoul paralysis",
        languages: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish",
        spells: [
            [1], [2], [2, 1], [2, 2],
            [2, 2, 1], [2, 2, 2], [3, 2, 2, 1], [3, 3, 2, 2],
            [3, 3, 3, 2, 1], [3, 3, 3, 3, 2]
        ],
        has_spell_book: true,
        max_level: 10,
        post_level_9_hd: [2],
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 9, value: 14 }, { level: 10, value: 12 } ],
        base_xp: [ 0, 4000, 8000, 16_000, 32_000, 64_000, 120_000, 250_000, 400_000, 600_000 ],
        saves: [ { level: 3, values: [ 12, 13, 13, 15, 15 ] }, { level: 6, values: [ 10, 11, 11, 13, 12 ] },
                 { level: 9, values: [ 8, 9, 9, 10, 10 ] }, { level: 10, values: [ 6, 7, 8, 8, 8 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Fighter",
        description: "Fighter (prime requisite STR)",
        allowed: () => true,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str),
        languages: "Alignment, Common",
        max_level: 14,
        post_level_9_hd: [2, 4, 6, 8, 10],
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 9, value: 14 }, { level: 12, value: 12 }, { level: 14, value: 10 } ],
        base_xp: [ 0, 2000, 4000, 8000, 16_000, 32_000, 64_000, 120_000, 240_000, 360_000, 480_000, 600_000, 720_000, 840_000 ],
        saves: [ { level: 3, values: [ 12, 13, 14, 15, 16 ] }, { level: 6, values: [ 10, 11, 12, 13, 14 ] },
                 { level: 9, values: [ 8, 9, 10, 10, 12 ] }, { level: 12, values: [ 6, 7, 8, 8, 10 ] },
                 { level: 14, values: [ 4, 5, 6, 5, 8 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Halfling",
        description: "Halfling (prime requisite DEX and STR)",
        allowed: (str, dex, con, int, wis, cha) => con >= 9 && dex >= 9,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        ac_bonus_against_large: 2,
        missile_bonus: 1,
        xp_mod: (str, dex, con, int, wis, cha) => {
            if (dex >= 13 && str >= 13)
                return 10;
            if (dex >= 13 || str >= 13)
                return 5;
            return 0;
        },
        other_info: "Listening at doors 2-in-6, Hiding 90% in woods / 2-in-6 in dungeons, Weapons and armor appropriate to size",
        small_normal_weapons_only: true,
        languages: "Alignment, Common, Halfling",
        max_level: 8,
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 8, value: 14 } ],
        base_xp: [ 0, 2000, 4000, 8000, 16_000, 32_000, 64_000, 120_000 ],
        saves: [ { level: 3, values: [ 8, 9, 10, 13, 12 ] }, { level: 6, values: [ 6, 7, 8, 10, 10 ] },
                 { level: 8, values: [ 4, 5, 6, 7, 8 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Magic-user",
        description: "Magic-user (prime requisite INT)",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: false,
        shield_allowed: false,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(int),
        other_info: "Dagger only, No armor, No shields",
        dagger_only: true,
        languages: "Alignment, Common",
        spells: [
            [1], [2], [2, 1], [2, 2],
            [2, 2, 1], [2, 2, 2], [3, 2, 2, 1], [3, 3, 2, 2],
            [3, 3, 3, 2, 1], [3, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 4, 3, 3, 3, 2],
            [4, 4, 4, 3, 3, 3], [4, 4, 4, 4, 3, 3]
        ],
        has_spell_book: true,
        max_level: 14,
        post_level_9_hd: [1, 2, 3, 4, 5],
        thac0: [ { level: 5, value: 19 }, { level: 10, value: 17 }, { level: 14, value: 14 } ],
        base_xp: [ 0, 2500, 5000, 10_000, 20_000, 40_000, 80_000, 150_000, 300_000, 450_000, 600_000, 750_000, 900_000, 1_050_000 ],
        saves: [ { level: 5, values: [ 13, 14, 13, 16, 15 ] }, { level: 10, values: [ 11, 12, 11, 14, 12 ] },
                 { level: 14, values: [ 8, 9, 8, 11, 8 ] } ],
        autoequip: {
            armor: { index: 0 },
            weapons: { indices: [ 3, 12 ] }
        }
    },
    {
        name: "Thief",
        description: "Thief (prime requisite DEX)",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: true,
        leather_armor_only: true,
        shield_allowed: false,
        thieves_tools: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(dex),
        other_info: "Back-stab, Leather armor only, No shields, " +
                    "Climb sheer surfaces, Find or remove treasure traps, Hear noise, Hide in shadows, Move silently, Open locks, Pick pockets",
        level_dep_info: (level) => {
            var r = level >= 4 ? [ "Read languages" ] : [];
            if (level >= 10)
                r.push("Scroll use");
            return r.join(", ");
        },
        languages: "Alignment, Common",
        max_level: 14,
        post_level_9_hd: [2, 4, 6, 8, 10],
        thac0: [ { level: 4, value: 19 }, { level: 8, value: 17 }, { level: 12, value: 14 }, { level: 14, value: 12 } ],
        base_xp: [ 0, 1200, 2400, 4800, 9600, 20_000, 40_000, 80_000, 160_000, 280_000, 400_000, 520_000, 640_000, 760_000 ],
        saves: [ { level: 4, values: [ 13, 14, 13, 16, 15 ] }, { level: 8, values: [ 12, 13, 11, 14, 13 ] },
                 { level: 12, values: [ 10, 11, 9, 12, 10 ] }, { level: 14, values: [ 8, 9, 7, 10, 8 ] } ],
        autoequip: {
            armor: { index: 1 },
            weapons: { roll: true }
        }
    },
    {
        name: "Half-elf",
        description: "Half-elf (prime requisite INT and STR)",
        allowed: (str, dex, con, int, wis, cha) => cha >= 9 && con >= 9,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => {
            if ((int >= 16 && str >= 13) || (int >= 13 && str >= 16))
                return 10;
            if (int >= 13 && str >= 13)
                return 5;
            return 0;
        },
        other_info: "Infravision 60, Detect secret doors 2-in-6",
        languages: "Alignment, Common, Elvish",
        spells: [
            [], [1], [2], [2],
            [2, 1], [2, 2], [2, 2], [2, 2, 1],
            [3, 2, 1], [3, 2, 2], [3, 2, 2, 1], [3, 3, 2, 1]
        ],
        has_spell_book: true,
        max_level: 12,
        post_level_9_hd: [2, 4, 6],
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 9, value: 14 }, { level: 12, value: 12 } ],
        base_xp: [ 0, 2500, 5000, 10_000, 20_000, 40_000, 80_000, 150_000, 300_000, 450_000, 600_000, 750_000 ],
        saves: [ { level: 3, values: [ 12, 13, 13, 15, 15 ] }, { level: 6, values: [ 10, 11, 11, 13, 12 ] },
                { level: 9, values: [ 8, 9, 9, 10, 10 ] }, { level: 12, values: [ 6, 7, 8, 8, 8 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true }
        }
    },
    {
        name: "Dark elf",
        description: "Dark elf (prime requisite STR and WIS)",
        allowed: (str, dex, con, int, wis, cha) => int >= 9,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => {
            if (wis >= 16 && str >= 13)
                return 10;
            if (wis >= 13 && str >= 13)
                return 5;
            return 0;
        },
        other_info: `${chalk.bold('Light sensitivity (-2 attack -1 AC in bright light)')}, Spider affinity (+1 to reaction against spiders), Infravision 90, ` +
                    `Listening at doors 2-in-6, Detect secret doors 2-in-6, Immune to ghoul paralysis`,
        level_dep_info: (level) => {
            var r = level == 1 ? [ chalk.bold("Can only memorize Light (Darkness) spell") ] : [];
            if (level >= 3)
                r.push("Can memorize magic-user Web (lv2) spell");
            return r.join(", ");
        },
        languages: "Alignment, Common, Deepcommon, Elvish, Gnomish, Spiders",
        divine_magic: true,
        spells: [
            [1], [2], [2, 1], [2, 2],
            [2, 2, 1], [2, 2, 2, 1], [3, 3, 2, 2, 1], [3, 3, 3, 2, 2],
            [4, 4, 3, 3, 2], [4, 4, 4, 3, 3]
        ],
        max_level: 10,
        post_level_9_hd: [2],
        thac0: [ { level: 3, value: 19 }, { level: 6, value: 17 }, { level: 9, value: 14 }, { level: 10, value: 12 } ],
        base_xp: [ 0, 4000, 8000, 16_000, 32_000, 64_000, 120_000, 250_000, 400_000, 600_000 ],
        saves: [ { level: 3, values: [ 12, 13, 13, 15, 12 ] }, { level: 6, values: [ 10, 11, 11, 13, 10 ] },
                 { level: 9, values: [ 8, 9, 9, 10, 8 ] }, { level: 10, values: [ 6, 7, 8, 8, 6 ] } ],
        autoequip: {
            armor: { roll: true },
            weapons: { roll: true },
            fixed_spell_indices: (level) =>  {
                if (level == 1)
                    return [ 3 ]; // Light (Darkness)
                return [];
            }
        }
    }
];

const language_list = [
    'Bugbear',
    'Doppelganger',
    'Dragon',
    'Dwarvish',
    'Elvish',
    'Gargoyle',
    'Gnoll',
    'Gnomish',
    'Goblin',
    'Halfling',
    'Harpy',
    'Hobgoblin',
    'Kobold',
    'Lizard man',
    'Medusa',
    'Minotaur',
    'Ogre',
    'Orcish',
    'Pixie',
    'Human dialect'
];

const weapon_list = [
    { value: 0, name: 'Battle axe (slow, 2-h, 1d8)', smallnormal: true },
    { value: 1, name: 'Club (1d4)', blunt: true, smallnormal: true },
    { value: 2, name: 'Crossbow (slow, reload, 2-h, 1d6, 80/160/240)', smallnormal: true, needs_bolts: true },
    { value: 3, name: 'Dagger (1d4, 10/20/30 as missile)', dagger: true, smallnormal: true },
    { value: 4, name: 'Hand axe (1d6, 10/20/30 as missile)', smallnormal: true },
    { value: 5, name: 'Javelin (1d4, 30/60/90)', smallnormal: true },
    { value: 6, name: 'Lance (charge, 1d6)' },
    { value: 7, name: 'Longbow (2-h, 1d6, 70/140/210)', needs_arrows: true },
    { value: 8, name: 'Mace (1d6)', blunt: true, smallnormal: true },
    { value: 9, name: 'Polearm (brace, slow, 2-h, 1d10)' },
    { value: 10, name: 'Shortbow (2-h, 1d6, 50/100/150)', smallnormal: true, needs_arrows: true },
    { value: 11, name: 'Shortsword (1d6)', smallnormal: true },
    { value: 12, name: 'Silver dagger (1d4, 10/20/30 as missile)', dagger: true, smallnormal: true },
    { value: 13, name: 'Sling (1d4, 40/80/160)', blunt: true, smallnormal: true, needs_slingstones: true },
    { value: 14, name: 'Spear (brace, 1d6, 20/40/60 as missile)' },
    { value: 15, name: 'Staff (slow, 2-h, 1d4)', blunt: true },
    { value: 16, name: 'Sword (1d8)', smallnormal: true },
    { value: 17, name: 'Two-handed sword (slow, 2-h, 1d10)' },
    { value: 18, name: 'Warhammer (1d6)', blunt: true, smallnormal: true },
    { value: 19, name: 'Whip (entangle, 1d2)', blunt: true, smallnormal: true }
];

const auto_weapon_list = [
    0, 1, 2, 3, 4, 7, 8, 10, 11, 13, 14, 16, 18, 19
];

const armor_list = [
    {
        name: "None",
        speed: 120,
        ac: 9
    },
    {
        name: "Leather armor",
        speed: 90,
        ac: 7
    },
    {
        name: "Chainmail",
        speed: 60,
        ac: 5
    },
    {
        name: "Plate mail",
        speed: 60,
        ac: 3
    }
];

const auto_armor_list = [
    { index: 1 },
    { index: 1, shield: true },
    { index: 2 },
    { index: 2, shield: true },
    { index: 3 },
    { index: 3, shield: true }
];

const equipment_list = [
    { name: 'Ration', unit: 7 },
    { name: 'Torch', unit: 6 },
    { name: 'Oil flask' },
    { name: 'Lantern' },
    { name: 'Tinder box' },
    { name: 'Waterskin' },
    { name: 'Holy water vial' },

    { name: 'Iron spike', unit: 12 },
    { name: 'Hand mirror' },
    { name: 'Rope', unit: 50, unit_str: 'ft' },
    { name: 'Ten foot wooden pole' },
    { name: 'Garlic' },
    { name: 'Stakes and mallet', unit: 3 },

    { name: 'Backpack' },
    { name: 'Crowbar' },
    { name: 'Grappling hook' },
    { name: 'Small hammer' },
    { name: 'Large sack' },
    { name: 'Small sack' },
    { name: 'Wine', unit: 2, unit_str: 'pints' },
    { name: 'Wolfsbane', unit: 1, unit_str: 'bunch' }
];

const auto_equipment_extra_list = [
    [ { name: 'Crowbar', count: 1 } ],
    [ { name: 'Small hammer', count: 1 }, { name: 'Iron spike', count: 12 } ]
    [ { name: 'Holy water', count: 1 } ],
    [ { name: 'Lantern', count: 1 }, { name: 'Oil flask', count: 3 } ]
    [ { name: 'Hand mirror', count: 1 } ],
    [ { name: 'Ten foot wooden pole', count: 1 } ],
    [ { name: 'Rope', count: 1, unit: 50, unit_str: 'ft' } ],
    [ { name: 'Rope', count: 1, unit: 50, unit_str: 'ft' }, { name: 'Grappling hook', count: 1 } ],
    [ { name: 'Garlic', count: 1 } ],
    [ { name: 'Wine', count: 1, unit: 2, unit_str: 'pints' }, ],
    [ { name: 'Stakes and mallet', count: 1, unit: 3 } ],
    [ { name: 'Wolfsbane', count: 1, unit: 1, unit_str: 'bunch' } ]
];

const magicuser_spell_list = [
    [
        'Charm person',
        'Detect magic',
        'Floating disc',
        'Hold portal',
        'Light / Darkness',
        'Magic missile',
        'Protection from evil',
        'Read languages',
        //'Read magic',
        'Shield',
        'Sleep',
        'Ventriloquism'
    ],
    [
        'Continual light / Continual darkness',
        'Detect evil',
        'Detect invisible',
        'ESP',
        'Invisibility',
        'Knock',
        'Levitate',
        'Location object',
        'Mirror image',
        'Phantasmal force',
        'Web',
        'Wizard lock'
    ],
    [
        'Clairvoyance',
        'Dispel magic',
        'Fireball',
        'Fly',
        'Haste',
        'Hold person',
        'Infravision',
        'Invisibility 10 ft radius',
        'Lightning bolt',
        'Protection from evil 10 ft radius',
        'Protection from normal missiles',
        'Water breathing'
    ],
    [
        'Charm monster',
        'Confusion',
        'Dimension door',
        'Growth of plants',
        'Hallucinatory terrain',
        'Massmorph',
        'Polymorph others',
        'Polymorph self',
        'Remove curse / Curse',
        'Wall of fire',
        'Wall of ice',
        'Wizard eye'
    ],
    [
        'Animate dead',
        'Cloudkill',
        'Conjure elemental',
        'Contact higher plane',
        'Feeblemind',
        'Hold monster',
        'Magic jar',
        'Pass-wall',
        'Telekinesis',
        'Teleport',
        'Transmute rock to mud / Mud to rock',
        'Wall of stone'
    ],
    [
        'Anti-magic shell',
        'Control weather',
        'Death spell',
        'Disintegrate',
        'Geas / Remove geas',
        'Invisible stalker',
        'Lower water',
        'Move earth',
        'Part water',
        'Projected image',
        'Reincarnation',
        'Stone to flesh / Flesh to stone'
    ]
];

const cleric_spell_list = [
    [
        'Cure light wounds (Rev.: Cause light wounds)',
        'Detect evil',
        'Detect magic',
        'Light (Rev.: Darkness)',
        'Protection from evil',
        'Purify food and water',
        'Remove fear (Rev.: Cause fear)',
        'Resist cold'
    ],
    [
        'Bless (Rev.: Blight)',
        'Find traps',
        'Hold person',
        'Know alignment',
        'Resist fire',
        'Silence',
        'Sneak charm',
        'Speak with animals'
    ],
    [
        'Continual light (Rev.: Continual darkness)',
        'Cure disease (Rev.: Cause disease)',
        'Growth of animal',
        'Locate object',
        'Remove curse (Rev.: Curse)',
        'Striking'
    ],
    [
        'Create water',
        'Cure serious wounds (Rev.: Cause serious wounds)',
        'Neutralize posion',
        'Protection from evil 10 ft radius',
        'Speak with plants',
        'Sticks to snakes'
    ],
    [
        'Commune',
        'Create food',
        'Dispel evil',
        'Insect plague',
        'Quest (Rev.: Remove quest)',
        'Raise dead (Rev.: Finger of death)'
    ]
];

export { classes, language_list, weapon_list, auto_weapon_list, armor_list, auto_armor_list, equipment_list, auto_equipment_extra_list, magicuser_spell_list, cleric_spell_list }
