import chalk from 'chalk'
import { select, expand, Separator, input } from '@inquirer/prompts';

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
    const reactions_msg = r != 0 ? `NPC reactions ${r > 0 ? `+${r}` : `${r}`}, ` : "";
    console.log(`${reactions_msg}Max retainers ${max_retainers(cha)}, Retainer loyalty ${retainer_loyalty(cha)}`)
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

var classes = [
    {
        name: "Cleric",
        description: "Cleric (prime requisite WIS)",
        allowed: () => true,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(wis),
        other_info: "Blunt weapons only",
        languages: "Alignment, Common",
        spells: [
            [], [1], [2], [2, 1],
            [2, 2], [2, 2, 1, 1], [2, 2, 2, 1, 1], [3, 3, 2, 2, 1],
            [3, 3, 3, 2, 2], [4, 4, 3, 3, 2], [4, 4, 4, 3, 3], [5, 5, 4, 4, 3],
            [5, 5, 5, 4, 4], [6, 5, 5, 5, 4]
        ]
    },
    {
        name: "Dwarf",
        description: "Dwarf (prime requisite STR)",
        allowed: (str, dex, con, int, wis, cha) => con >= 9,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str),
        other_info: "Infravision 60 ft, Listening at doors 2-in-6, Detect room traps 2-in-6, Detect construction tricks 2-in-6, Weapons small/normal sized only",
        languages: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
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
        other_info: "Infravision 60 ft, Listening at doors 2-in-6, Detect secret doors 2-in-6, Immune to ghoul paralysis",
        languages: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish",
        spells: [
            [1], [2], [2, 1], [2, 2],
            [2, 2, 1], [2, 2, 2], [3, 2, 2, 1], [3, 3, 2, 2],
            [3, 3, 3, 2, 1], [3, 3, 3, 3, 2]
        ]
    },
    {
        name: "Fighter",
        description: "Fighter (prime requisite STR)",
        allowed: () => true,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str),
        languages: "Alignment, Common"
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
        languages: "Alignment, Common, Halfling"
    },
    {
        name: "Magic-user",
        description: "Magic-user (prime requisite INT)",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: false,
        shield_allowed: false,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(int),
        other_info: "Dagger only",
        languages: "Alignment, Common",
        spells: [
            [1], [2], [2, 1], [2, 2],
            [2, 2, 1], [2, 2, 2], [3, 2, 2, 1], [3, 3, 2, 2],
            [3, 3, 3, 2, 1], [3, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 4, 3, 3, 3, 2],
            [4, 4, 4, 3, 3, 3], [4, 4, 4, 4, 3, 3]
        ]
    },
    {
        name: "Thief",
        description: "Thief (prime requisite DEX)",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: true,
        leather_armor_only: true,
        shield_allowed: false,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(dex),
        other_info: "Back-stab",
        languages: "Alignment, Common"
    }
];

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
        pageSize: 10
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
    message: "Level (1-8)",
    default: "1",
    validate: (value) => { const n = Number(value); return !isNaN(n) && n >= 1 && n <= 8; }
});
level = Math.ceil(Number(level_answer));

var max_hp;
for ( ; ; ) {
    max_hp = 0;
    for (var level_hd = 0; level_hd < level; ++level_hd)
        max_hp += Math.max(1, roll(chosen_class.hit_dice, 1, mod_hp));
    console.log(chalk.bold(`Max HP ${max_hp} (Hit Dice 1d${chosen_class.hit_dice})`));
    const hp_ok = await expand({
        message: "Accept HP?",
        default: 'y',
        choices: [
            { key: "y", name: "Yes", value: "y" },
            { key: "n", name: "No (re-roll)", value: "n" }
        ]
    }) == "y";
    if (hp_ok)
        break;
};

const armor = [
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

var armor_choices = [];
for (var i in armor) {
    var skip = i > 0;
    if (chosen_class.armor_allowed) {
        if (i == 1 || !chosen_class.leather_armor_only)
            skip = false;
    }
    if (skip)
        console.log(chalk.dim(`Skipping ${armor[i].name} due to not meeting requirements`));
    else
        armor_choices.push({ name: armor[i].name, value: i });
}

const armor_answer = await select({
    message: "Select armor",
    choices: armor_choices
});
const chosen_armor = armor[armor_answer];

var has_shield = false;
if (chosen_class.shield_allowed) {
    has_shield = await expand({
        message: "Shield?",
        default: 'y',
        choices: [
            { key: "y", name: "Yes", value: "y" },
            { key: "n", name: "No", value: "n" }
        ]
    }) == "y";
} else {
    console.log(chalk.dim("No shield allowed"));
}
const ac_wo_shield = chosen_armor.ac - mod_ac; // descending AC, but modifier is like other mod_* hence the subtract
const ac = ac_wo_shield - (has_shield ? 1 : 0);
const print_ac = () => {
    console.log(chalk.bold(`AC ${ac}${ac_wo_shield != ac ? ` (${ac_wo_shield} when no shield)` : ''}`));
    if (chosen_class.ac_bonus_against_large) {
        const large_ac_wo_shield = ac_wo_shield - chosen_class.ac_bonus_against_large;
        const large_ac = large_ac_wo_shield - (has_shield ? 1 : 0);
        console.log(chalk.bold(`AC against large opponents ${large_ac}${large_ac_wo_shield != large_ac ? ` (${large_ac_wo_shield} when no shield)` : ''}`));
    }
};

console.log(chalk.underline("\n\nResult\n"));
console.log(chalk.cyan(`Level ${level} ${chosen_class.name}`));
print_abilities(true);
console.log(chalk.bold(`Max HP ${max_hp} (Hit Dice 1d${chosen_class.hit_dice})`));
console.log(chalk.bold(`Armor: ${chosen_armor.name}${has_shield ? ', Shield' : ''}`));
print_ac();
console.log(chalk.bold(`Speed: ${chosen_armor.speed} / ${chosen_armor.speed / 3}`));
console.log(`Open doors ${open_doors_chance(str)}-in-6${chosen_class.other_info ? `, ${chosen_class.other_info}` : ''}`);
print_cha_msg(cha);
console.log(`Languages: ${chosen_class.languages}`);
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
    console.log(chalk.bold(`Spells: ${spells_msg}`));
}
