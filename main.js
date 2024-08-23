import chalk from 'chalk'
import { select, expand, Separator, input, checkbox } from '@inquirer/prompts';

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
    { value: 1, name: 'Club (blunt, 1d4)', blunt: true, smallnormal: true },
    { value: 2, name: 'Crossbow (slow, reload, 2-h, 1d6, 80/160/240)', smallnormal: true, needs_bolts: true },
    { value: 3, name: 'Dagger (1d4, 10/20/30 as missile)', dagger: true, smallnormal: true },
    { value: 4, name: 'Hand axe (1d6, 10/20/30 as missile)', smallnormal: true },
    { value: 5, name: 'Javelin (1d4, 30/60/90)', smallnormal: true },
    { value: 6, name: 'Lance (charge, 1d6)' },
    { value: 7, name: 'Longbow (2-h, 1d6, 70/140/210)', needs_arrows: true },
    { value: 8, name: 'Mace (blunt, 1d6)', blunt: true, smallnormal: true },
    { value: 9, name: 'Polearm (brace, slow, 2-h, 1d10)' },
    { value: 10, name: 'Shortbow (2-h, 1d6, 50/100/150)', smallnormal: true, needs_arrows: true },
    { value: 11, name: 'Shortsword (1d6)', smallnormal: true },
    { value: 12, name: 'Silver dagger (1d4, 10/20/30 as missile)', dagger: true, smallnormal: true },
    { value: 13, name: 'Sling (blunt, 1d4, 40/80/160)', blunt: true, smallnormal: true, needs_slingstones: true },
    { value: 14, name: 'Spear (brace, 1d6, 20/40/60 as missile)' },
    { value: 15, name: 'Staff (blunt, slow, 2-h, 1d4)', blunt: true },
    { value: 16, name: 'Sword (1d8)', smallnormal: true },
    { value: 17, name: 'Two-handed sword (slow, 2-h, 1d10)' },
    { value: 18, name: 'Warhammer (blunt, 1d6)', blunt: true, smallnormal: true }
];

const auto_weapon_list = [
    0, 2, 4, 8, 9, 10, 11, 12, 13, 14, 16, 18
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
        'Protection from evil 10 ft',
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

function roll(sides, count, bonus) {
    var result = 0;
    for (var i = 0; i < (count ?? 1); ++i)
        result += Math.floor(Math.random() * sides) + 1;
    if (bonus)
        result += bonus;
    return result;
}

function apply_map(map, max_value, value) {
    for (var i in map) {
        if (value <= map[i].limit)
            return map[i].modifier;
    }
    return max_value;
}

function modifier(ability) {
    return apply_map([
        { limit: 3, modifier: -3 },
        { limit: 5, modifier: -2 },
        { limit: 8, modifier: -1 },
        { limit: 12, modifier: 0 },
        { limit: 15, modifier: 1 },
        { limit: 17, modifier: 2 }
    ], 3, ability);
}

function modifier_as_suffix(ability_modifier) {
    if (ability_modifier != 0) {
        return chalk.magenta(` (${ability_modifier > 0 ? '+' : ''}${ability_modifier})`);
    }
    return "";
}

function print_modifier_msg(ability_modifier, msg, extra_msg) {
    if (ability_modifier != 0) {
        var full_msg = `${ability_modifier > 0 ? '+' : ''}${ability_modifier}${msg}`;
        full_msg = ability_modifier > 0 ? chalk.green(full_msg) : chalk.red(full_msg);
        if (extra_msg)
            full_msg += ' ' + extra_msg;
        console.log(full_msg);
    }
}

function print_cha_msg(cha) {
    const r = npc_reactions(cha);
    var reactions_msg = "";
    var color_func = null;
    if (r != 0) {
        reactions_msg = `${r > 0 ? `+${r}` : `${r}`} to NPC reactions, `;
        color_func = r > 0 ? chalk.green : chalk.red;
    }
    const msg = `${reactions_msg}Max retainers ${max_retainers(cha)}, Retainer loyalty ${retainer_loyalty(cha)}`;
    console.log(color_func ? color_func(msg) : msg);
}

function open_doors_chance(str) {
    return apply_map([
        { limit: 8, modifier: 1 },
        { limit: 12, modifier: 2 },
        { limit: 15, modifier: 3 },
        { limit: 17, modifier: 4 }
    ], 5, str);
}

function npc_reactions(cha) {
    return apply_map([
        { limit: 3, modifier: -2 },
        { limit: 8, modifier: -1 },
        { limit: 12, modifier: 0 },
        { limit: 17, modifier: 1 }
    ], 2, cha);
}

function max_retainers(cha) {
    return apply_map([
        { limit: 3, modifier: 1 },
        { limit: 5, modifier: 2 },
        { limit: 8, modifier: 3 },
        { limit: 12, modifier: 4 },
        { limit: 15, modifier: 5 },
        { limit: 17, modifier: 6 }
    ], 7, cha);
}

function retainer_loyalty(cha) {
    return apply_map([
        { limit: 3, modifier: 4 },
        { limit: 5, modifier: 5 },
        { limit: 8, modifier: 6 },
        { limit: 12, modifier: 7 },
        { limit: 15, modifier: 8 },
        { limit: 17, modifier: 9 }
    ], 10, cha);
}

function xp_modifier_from_single_prime_req(value) {
    return apply_map([
        { limit: 5, modifier: -20 },
        { limit: 8, modifier: -10 },
        { limit: 12, modifier: 0 },
        { limit: 15, modifier: 5 }
    ], 10, value);
}

function saving_throws_for_level(saves_tab, level) {
    for (var i = 0; i < saves_tab.length; ++i) {
        if (level <= saves_tab[i].level)
            return saves_tab[i].values;
    }
    return [0, 0, 0, 0, 0];
}

function weapon_ok_for_class(char_class, weapon) {
    var ok = true;
    if (char_class.blunt_weapons_only && !weapon.blunt)
        ok = false;
    if (char_class.dagger_only && !weapon.dagger)
        ok = false;
    if (char_class.small_normal_weapons_only && !weapon.smallnormal)
        ok = false;
    return ok;
}

var level = 1;
var str, dex, con, int, wis, cha;
var mod_melee, mod_missile, mod_ac, mod_hp, mod_magicsave, mod_lang, mod_react;
var mod_missile_extra, mod_xp;
var chosen_class;

const print_abilities = (in_result) => {
    console.log(`STR ${chalk.bold(str)}${modifier_as_suffix(mod_melee)} ` +
                `DEX ${chalk.bold(dex)}${modifier_as_suffix(mod_missile)} ` +
                `CON ${chalk.bold(con)}${modifier_as_suffix(mod_hp)} ` +
                `INT ${chalk.bold(int)}${modifier_as_suffix(mod_lang)} ` +
                `WIS ${chalk.bold(wis)}${modifier_as_suffix(mod_magicsave)} ` +
                `CHA ${chalk.bold(cha)}${modifier_as_suffix(mod_react)}`)
    print_modifier_msg(mod_melee, " to melee attack and damage due to STR")
    if (mod_missile && !mod_missile_extra)
        print_modifier_msg(mod_missile, " to missile attack due to DEX")
    else if (!mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile_extra, " to missile attack due to class");
    else if (mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile + mod_missile_extra, " to missile attack due to DEX and class");
    print_modifier_msg(mod_ac, " to AC due to DEX", `${in_result ? '(included in AC below)' : ''}`);
    print_modifier_msg(mod_hp, " to hit dice due to CON");
    print_modifier_msg(mod_lang, " additional languages due to INT");
    print_modifier_msg(mod_magicsave, " to magic saves due to WIS");
    if (mod_xp)
        print_modifier_msg(mod_xp, "% XP due to prime requisite");
};

for ( ; ; ) {
    str = roll(6, 3);
    dex  = roll(6, 3);
    con = roll(6, 3);
    int = roll(6, 3);
    wis = roll(6, 3);
    cha = roll(6, 3);

    mod_melee = modifier(str);
    mod_missile = modifier(dex);
    mod_ac = modifier(dex);
    mod_hp = modifier(con);
    mod_magicsave = modifier(wis);
    mod_lang = Math.max(0, modifier(int));
    mod_react = npc_reactions(cha);

    print_abilities();

    var class_choices = [];
    for (var i in classes) {
        if (classes[i].allowed(str, dex, con, int, wis, cha))
            class_choices.push({ name: classes[i].name, value: i, description: classes[i].description });
        else
            console.log(chalk.dim(`Skipping ${classes[i].name} due to not meeting requirements`));
    }
    class_choices.push(new Separator());
    class_choices.push({ name: "Re-roll", value: -1 });
    class_choices.push({ name: "Quit", value: -2 });

    const class_answer = await select({
        message: "Select class",
        choices: class_choices,
        pageSize: class_choices.length
    });

    if (class_answer >= 0) {
        chosen_class = classes[class_answer];
        break;
    } else if (class_answer >= -1) {
        console.log("");
    } else {
        process.exit(0);
    }
}

if (chosen_class.missile_bonus) {
    mod_missile_extra = chosen_class.missile_bonus;
    print_modifier_msg(mod_missile_extra, " to missile attack due to class");
}

mod_xp = chosen_class.xp_mod(str, dex, con, int, wis, cha);
if (mod_xp)
    print_modifier_msg(mod_xp, "% XP due to prime requisite");

const level_answer = await input({
    message: `Level (1-${chosen_class.max_level})`,
    default: "1",
    validate: (value) => { const n = Number(value); return !isNaN(n) && n >= 1 && n <= chosen_class.max_level; }
});
level = Math.floor(Number(level_answer));

const auto_mode = await expand({
    message: "Automatic mode?",
    default: 'y',
    choices: [
        { key: "y", name: "Yes", value: true },
        { key: "n", name: "No", value: false }
    ]
});

var max_hp;
for ( ; ; ) {
    max_hp = 0;
    for (var level_hd = 0; level_hd < level; ++level_hd) {
        if (level_hd <= 8) {
            max_hp += Math.max(1, roll(chosen_class.hit_dice, 1, mod_hp));
        } else {
            // CON no longer applies from level 10
            max_hp += chosen_class.post_level_9_hd[level_hd - 9];
        }
    }
    console.log(chalk.bold(`Max HP ${max_hp} (Hit dice 1d${chosen_class.hit_dice})`));
    if (auto_mode) {
        break;
    } else {
        const hp_ok = await expand({
            message: "Accept HP?",
            default: 'y',
            choices: [
                { key: "y", name: "Yes", value: true },
                { key: "n", name: "No (re-roll)", value: false }
            ]
        });
        if (hp_ok)
            break;
    }
};

var chosen_armor = armor_list[0]; // None
var has_shield = false;
var equipment = [];
var weapon_indices = [];

if (auto_mode) {
    if (chosen_class.autoequip.armor.index !== undefined) {
        chosen_armor = armor_list[chosen_class.autoequip.armor.index];
    } else if (chosen_class.autoequip.armor.roll) {
        const a = auto_armor_list[roll(auto_armor_list.length, 1, 0) - 1];
        chosen_armor = armor_list[a.index];
        if (a.shield)
            has_shield = true;
    }

    if (chosen_class.autoequip.weapons.indices !== undefined) {
        weapon_indices = chosen_class.autoequip.weapons.indices;
    } else {
        for (var i = 0; i < 2; ++i) {
            for ( ; ; ) {
                const choice = weapon_list[auto_weapon_list[roll(auto_weapon_list.length, 1, 0) - 1]];
                if (weapon_ok_for_class(chosen_class, choice) && !weapon_indices.includes(choice.value)) {
                    weapon_indices.push(choice.value);
                    break;
                }
            }
        }
    }

    equipment.push({ name: 'Backpack', count: 1 });
    equipment.push({ name: 'Torch', count: roll(6, 1, 0) });
    equipment.push({ name: 'Tinderbox', count: 1 });
    equipment.push({ name: 'Waterskin', count: 1 });
    equipment.push({ name: 'Ration', count: roll(6, 1, 0) });
    equipment.push({ name: 'gp', count: roll(6, 1, 0) + roll(6, 1, 0) + roll(6, 1, 0) });

    for (var i = 0; i < 2; ++i) {
        var something_added = false;
        for ( ; ; ) {
            const choice = auto_equipment_extra_list[roll(auto_equipment_extra_list.length, 1, 0) - 1];
            for (var c in choice) {
                const thing = choice[c];
                const eqIdx = equipment.findIndex((element) => element.name == thing.name);
                if (eqIdx < 0) {
                    equipment.push(choice[c]);
                    something_added = true;
                }
            }
            if (something_added)
                break;
        }
    }
} else {
    var armor_choices = [];
    for (var i in armor_list) {
        var skip = i > 0;
        if (chosen_class.armor_allowed) {
            if (i == 1 || !chosen_class.leather_armor_only)
                skip = false;
        }
        if (skip)
            console.log(chalk.dim(`Skipping ${armor_list[i].name} due to not meeting requirements`));
        else
            armor_choices.push({ name: armor_list[i].name, value: i });
    }
    if (chosen_class.armor_allowed) {
        const armor_answer = await select({
            message: "Select armor",
            choices: armor_choices
        });
        chosen_armor = armor_list[armor_answer];
    }

    if (chosen_class.shield_allowed) {
        has_shield = await expand({
            message: "Shield?",
            default: 'y',
            choices: [
                { key: "y", name: "Yes", value: true },
                { key: "n", name: "No", value: false }
            ]
        });
    } else {
        console.log(chalk.dim("No shield allowed"));
    }

    var weapon_select_choices = [];
    for (var i in weapon_list) {
        if (weapon_ok_for_class(chosen_class, weapon_list[i]))
            weapon_select_choices.push(weapon_list[i]);
    }
    weapon_indices = await checkbox({
        message: "Select weapons",
        choices: weapon_select_choices,
        pageSize: 12,
        loop: false,
        validate: (choices) => {
            if (choices.length > 0)
                return true;
            return 'Select at least one weapon';
        }
    });

    for ( ; ; ) {
        var equipment_choices = [];
        equipment_choices.push({ name: "Done", value: -2 });
        equipment_choices.push({ name: "Reset", value: -1 });
        equipment_choices.push(new Separator());
        for (var i in equipment_list) {
            const thing = equipment_list[i];
            const str = `${thing.name}${thing.unit > 1 ? ' (' + thing.unit + ')' : ''}`;
            equipment_choices.push({ name: str , value: i });
        }
        const idx = await select({
            message: "Add more equipment",
            choices: equipment_choices,
            pageSize: 12,
            loop: false
        });
        if (idx >= 0) {
            const thing = equipment_list[idx];
            const eqIdx = equipment.findIndex((element) => element.name == thing.name);
            if (eqIdx >= 0)
                equipment[eqIdx].count += 1;
            else
                equipment.push({ name: thing.name, count: 1, unit: thing.unit, unit_str: thing.unit_str });
        } else if (idx == -1)
            equipment = [];
        else
            break;
    }
}

if (chosen_class.divine_magic)
    equipment.push({ name: 'Holy symbol', count: 1 });
if (chosen_class.thieves_tools)
    equipment.push({ name: "Thieves' tools", count: 1 });

var needs_arrows = false, needs_bolts = false, needs_slingstones = false;
weapon_indices.forEach((i) => {
    const w = weapon_list[i];
    if (w.needs_arrows)
        needs_arrows = true;
    if (w.needs_bolts)
        needs_bolts = true;
    if (w.needs_slingstones)
        needs_slingstones = true;
});

if (needs_arrows)
    equipment.push({ name: 'Arrow', count: 1, unit: 20});
if (needs_bolts)
    equipment.push({ name: 'Crossbow bolt', count: 1, unit: 30});
if (needs_slingstones)
    equipment.push({ name: 'Sling stones', count: 1 });

const ac_wo_shield = chosen_armor.ac - mod_ac; // descending AC, but modifier is like other mod_* hence the subtract
const ac = ac_wo_shield - (has_shield ? 1 : 0);
const print_ac = () => {
    console.log(chalk.bold(`AC ${ac}${ac_wo_shield != ac ? ` (${ac_wo_shield} without shield)` : ''}`));
    if (chosen_class.ac_bonus_against_large) {
        const large_ac_wo_shield = ac_wo_shield - chosen_class.ac_bonus_against_large;
        const large_ac = large_ac_wo_shield - (has_shield ? 1 : 0);
        console.log(chalk.bold(`AC ${large_ac} against large opponents${large_ac_wo_shield != large_ac ? ` (${large_ac_wo_shield} without shield)` : ''}`));
    }
};

var spell_book = [];
if (chosen_class.has_spell_book && chosen_class.spells && chosen_class.spells[level - 1].length > 0) {
    if (auto_mode) {
        spell_book.push(chalk.dim("Read magic (lv1)"));
        const spell_counts = chosen_class.spells[level - 1];
        for (var i = 0; i < spell_counts.length; ++i) {
            const spell_level = i + 1;
            var indices_generated = [];
            for (var j = 0; j < spell_counts[i]; ++j) {
                for ( ; ; ) {
                    const index = roll(magicuser_spell_list[i].length, 1, 0) - 1;
                    if (!indices_generated.includes(index)) {
                        spell_book.push(`${magicuser_spell_list[i][index]} (lv${spell_level})`);
                        indices_generated.push(index);
                        break;
                    }
                }
            }
        }
    } else if (await expand({
        message: "Define spell book?",
        default: 'y',
        choices: [
            { key: "y", name: "Yes", value: true },
            { key: "n", name: "No", value: false }
        ]
    })) {
        spell_book.push(chalk.dim("Read magic (lv1)"));
        const spell_counts = chosen_class.spells[level - 1];
        for (var i = 0; i < spell_counts.length; ++i) {
            const spell_level = i + 1;
            const count = spell_counts[i];
            var spell_choices = [];
            for (var s of magicuser_spell_list[i])
                spell_choices.push({ value: s });
            const choices = await checkbox({
                message: `Choose ${count} from level ${spell_level} spells`,
                choices: spell_choices,
                pageSize: 12,
                loop: false,
                validate: (choices) => {
                    if (choices.length === count)
                        return true;
                    return `Choose ${count} spells`;
                }
            });
            for (var s of choices)
                spell_book.push(`${s} (lv${spell_level})`);
        }
    }
}

var current_cleric_spells = [];
if (chosen_class.divine_magic && chosen_class.spells && chosen_class.spells[level - 1].length > 0) {
    if (auto_mode) {
        const spell_counts = chosen_class.spells[level - 1];
        for (var i = 0; i < spell_counts.length; ++i) {
            const spell_level = i + 1;
            var indices_generated = [];
            for (var j = 0; j < spell_counts[i]; ++j) {
                for ( ; ; ) {
                    const index = roll(cleric_spell_list[i].length, 1, 0) - 1;
                    if (!indices_generated.includes(index)) {
                        current_cleric_spells.push(`${cleric_spell_list[i][index]} (lv${spell_level})`);
                        indices_generated.push(index);
                        break;
                    }
                }
            }
        }
    }
}

var additional_languages = [];
if (mod_lang > 0) {
    const already_known = new Set(chosen_class.languages.split(', '));
    if (auto_mode) {
        var generated_indices = [];
        for (var i = 0; i < mod_lang; ++i) {
            for ( ; ; ) {
                const index = roll(language_list.length, 1, 0) - 1;
                const choice = language_list[index];
                if (!already_known.has(choice) && !generated_indices.includes(index)) {
                    additional_languages.push(choice);
                    generated_indices.push(index);
                    break;
                }
            }
        }
    } else {
        const lang_msg = `Choose ${mod_lang} additional language${mod_lang > 1 ? 's' : ''}`;
        var language_select_choices = [];
        language_list.forEach((lang) => language_select_choices.push(
            { value: lang, disabled: already_known.has(lang) }));
        additional_languages = await checkbox({
            message: lang_msg,
            choices: language_select_choices,
            pageSize: 12,
            loop: false,
            validate: (choices) => {
                if (choices.length === mod_lang)
                    return true;
                return lang_msg;
            }
        });
    }
}
var languages_set = new Set(chosen_class.languages.split(', '));
additional_languages.forEach((lang) => languages_set.add(lang));
const languages = [...languages_set.values()];

const alignment_list = [ "Lawful", "Neutral", "Chaotic" ];
var alignment;
if (auto_mode) {
    alignment = alignment_list[roll(3, 1, 0) - 1];
} else {
    alignment = await select({
        message: "Select alignment",
        choices: [
            { value: alignment_list[0] }, { value: alignment_list[1] }, { value: alignment_list[2] }
        ]
    });
}

console.log(chalk.underline("\n\nResult\n"));
console.log(chalk.cyan(`Level ${level} ${chosen_class.name}`));
print_abilities(true);
print_cha_msg(cha);
console.log(chalk.bold(`Max HP ${max_hp} (Hit dice 1d${chosen_class.hit_dice})`));
console.log(chalk.bold(`Armor ${chosen_armor.name}${has_shield ? ', Shield' : ''}`));
print_ac();
var thac0 = 19;
for (var i in chosen_class.thac0) {
    if (level <= chosen_class.thac0[i].level) {
        thac0 = chosen_class.thac0[i].value;
        break;
    }
}
console.log(chalk.bold(`THAC0 ${thac0}`));
console.log(chalk.bold(`Speed ${chosen_armor.speed} / ${chosen_armor.speed / 3}`));
var weapons = [];
weapon_indices.forEach((i) => { weapons.push(weapon_list[i].name); });
console.log(chalk.bold(`Weapons ${weapons.join(', ')}`));
if (chosen_class.spells) {
    var spells_msg = "";
    const spell_counts = chosen_class.spells[level - 1];
    const len = spell_counts.length;
    if (len == 0) {
        spells_msg += "None";
    } else {
        for (var i = 0; i < len; ++i) {
            const spell_level = i + 1;
            const count = spell_counts[i];
            spells_msg += `${i > 0 ? ', ' : ''}${count}lv${spell_level}`;
        }
    }
    console.log(chalk.bold(`Spells (${chosen_class.divine_magic ? 'divine' : 'arcane'}) ${spells_msg}`));
    if (spell_book.length > 0)
        console.log(chalk.bold(`Spell book ${spell_book.join(', ')}`));
    if (current_cleric_spells.length > 0)
        console.log(chalk.bold(`Currently memorized ${current_cleric_spells.join(', ')}`));
}
const saves = saving_throws_for_level(chosen_class.saves, level);
console.log(`${chalk.bold('Saving throws')} D ${chalk.bold(saves[0])} W ${chalk.bold(saves[1])} P ${chalk.bold(saves[2])} ` +
            `B ${chalk.bold(saves[3])} S ${chalk.bold(saves[4])}`);
const level_dep_info = chosen_class.level_dep_info ? chosen_class.level_dep_info(level) : null;
console.log(`Open doors ${open_doors_chance(str)}-in-6` +
            `${chosen_class.other_info ? `, ${chosen_class.other_info}` : ''}` +
            `${level_dep_info ? `, ${level_dep_info}` : ''}`);
console.log(`Alignment ${alignment}`);
console.log(`Languages ${languages.join(', ')}`);
var equipment_arr = [];
equipment.forEach((thing) => {
    var str = `${thing.name}`;
    const count = thing.unit !== undefined ? thing.count * thing.unit : thing.count;
    if (count > 1) {
        str += ` (${count}`;
        if (thing.unit_str)
            str += ` ${thing.unit_str}`;
        str += ')';
    }
    equipment_arr.push(str);
});
if (equipment_arr.length > 0)
    console.log(`Equipment ${equipment_arr.join(', ')}`);
console.log(`XP ${chosen_class.base_xp[level - 1]}`);
console.log(`HP ${max_hp}`);
