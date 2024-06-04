import chalk from 'chalk'
import { select, expand } from '@inquirer/prompts';

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

function print_modifier_msg(ability_modifier, msg) {
    if (ability_modifier != 0) {
        const full_msg = `${ability_modifier > 0 ? '+' : ''}${ability_modifier}${msg}`;
        console.log(ability_modifier > 0 ? chalk.green(full_msg) : chalk.red(full_msg));
    }
}

function open_doors_chance(str) {
    return apply_map([
        { limit: 8, modifier: 1 },
        { limit: 12, modifier: 2 },
        { limit: 15, modifier: 3 },
        { limit: 17, modifier: 4 }
    ], 5, str);
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
        allowed: () => true,
        hit_dice: 6,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(wis)
    },
    {
        name: "Dwarf",
        allowed: (str, dex, con, int, wis, cha) => con >= 9,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str)
    },
    {
        name: "Elf",
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
        }
    },
    {
        name: "Fighter",
        allowed: () => true,
        hit_dice: 8,
        armor_allowed: true,
        shield_allowed: true,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(str)
    },
    {
        name: "Halfling",
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
        }
    },
    {
        name: "Magic-user",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: false,
        shield_allowed: false,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(int)
    },
    {
        name: "Thief",
        allowed: () => true,
        hit_dice: 4,
        armor_allowed: true,
        leather_armor_only: true,
        shield_allowed: false,
        xp_mod: (str, dex, con, int, wis, cha) => xp_modifier_from_single_prime_req(dex)
    }
];

var str, dex, con, int, wis, cha;
var mod_melee, mod_missile, mod_ac, mod_hp, mod_magicsave;
var mod_missile_extra, mod_xp;
var chosen_class;

const print_abilities = () => {
    console.log(`STR ${chalk.bold(str)}${modifier_as_suffix(mod_melee)} ` +
                `DEX ${chalk.bold(dex)}${modifier_as_suffix(mod_missile)} ` +
                `CON ${chalk.bold(con)}${modifier_as_suffix(mod_hp)} ` +
                `INT ${chalk.bold(int)} ` +
                `WIS ${chalk.bold(wis)}${modifier_as_suffix(mod_magicsave)} ` +
                `CHA ${chalk.bold(cha)}`)
    print_modifier_msg(mod_melee, " to melee attack and damage due to STR")
    if (mod_missile && !mod_missile_extra)
        print_modifier_msg(mod_missile, " to missile attack due to DEX")
    else if (!mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile_extra, " to missile attack due to class");
    else if (mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile + mod_missile_extra, " to missile attack due to DEX and class");
    print_modifier_msg(mod_ac, " to AC due to DEX");
    print_modifier_msg(mod_hp, " to hit dice due to CON");
    print_modifier_msg(mod_magicsave, " to magic saves due to WIS");
    console.log(`Open doors ${open_doors_chance(str)}-in-6`);
    if (mod_xp)
        print_modifier_msg(mod_xp, "% XP due to prime requisite for class");
};

for (; ; ) {
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

    print_abilities();

    var class_choices = [];
    for (var i in classes) {
        if (classes[i].allowed(str, dex, con, int, wis, cha))
            class_choices.push({ name: classes[i].name, value: i });
        else
            console.log(chalk.dim(`Skipping ${classes[i].name} due to not meeting requirements`));
    }
    class_choices.push({ name: "Re-roll", value: -1 });

    const class_answer = await select({
        message: "Select class",
        choices: class_choices,
        pageSize: 10
    });

    if (class_answer >= 0) {
        chosen_class = classes[class_answer];
        break;
    } else {
        console.log("");
    }
}

if (chosen_class.missile_bonus) {
    mod_missile_extra = chosen_class.missile_bonus;
    print_modifier_msg(mod_missile_extra, " to missile attack due to class");
}

mod_xp = chosen_class.xp_mod(str, dex, con, int, wis, cha);
if (mod_xp)
    print_modifier_msg(mod_xp, "% XP due to prime requisite for class");

var max_hp = 0;
for ( ; ; ) {
    max_hp = Math.max(1, roll(chosen_class.hit_dice, 1, mod_hp));
    console.log(chalk.bold(`Max HP ${max_hp}`));
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

console.log(chalk.underline("\n\nSummary\n"));
console.log(chalk.cyan(`Class: ${chosen_class.name}`));
print_abilities();
console.log(chalk.bold(`Max HP ${max_hp} (Hit Dice 1d${chosen_class.hit_dice})`));
console.log(chalk.bold(`Armor: ${chosen_armor.name}${has_shield ? ', Shield' : ''}`));
print_ac();
console.log(chalk.bold(`Speed: ${chosen_armor.speed} / ${chosen_armor.speed / 3}`));
