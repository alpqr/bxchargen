import chalk from 'chalk'
import { select, expand, Separator, input, checkbox } from '@inquirer/prompts'
import { roll, apply_map } from './funcs.js'
import { classes, language_list, weapon_list, auto_weapon_list, armor_list, auto_armor_list, equipment_list, auto_equipment_extra_list, magicuser_spell_list, cleric_spell_list } from './data.js'

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

function print_modifier_msg(ability_modifier, msg_prefix, msg, extra_msg) {
    if (ability_modifier != 0) {
        var full_msg = `${msg_prefix}${ability_modifier > 0 ? '+' : ''}${ability_modifier}${msg}`;
        full_msg = ability_modifier > 0 ? chalk.green(full_msg) : chalk.red(full_msg);
        if (extra_msg)
            full_msg += ' ' + extra_msg;
        console.log(full_msg);
    }
}

function print_cha_msg(cha, msg_prefix) {
    const r = npc_reactions(cha);
    var reactions_msg = "";
    var color_func = null;
    if (r != 0) {
        reactions_msg = `${r > 0 ? `+${r}` : `${r}`} to NPC reactions, `;
        color_func = r > 0 ? chalk.green : chalk.red;
    }
    const msg = `${msg_prefix}${reactions_msg}Max retainers ${max_retainers(cha)}, Retainer loyalty ${retainer_loyalty(cha)}`;
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

const markdown = process.argv.includes("--md");

function header(text) {
    if (markdown)
        return chalk.cyan('**' + text + '**');
    else
        return chalk.cyan(text);
}

var level = 1;
var str, dex, con, int, wis, cha;
var mod_melee, mod_missile, mod_ac, mod_hp, mod_magicsave, mod_lang, mod_react;
var mod_missile_extra, mod_xp;
var chosen_class;

const print_abilities = (in_result) => {
    const decorate = (ability) => {
        if (in_result && markdown)
            return `**${ability}**`;
        else
            return ability;
    };
    console.log(`${decorate('STR')} ${chalk.bold(str)}${modifier_as_suffix(mod_melee)} ` +
                `${decorate('DEX')} ${chalk.bold(dex)}${modifier_as_suffix(mod_missile)} ` +
                `${decorate('CON')} ${chalk.bold(con)}${modifier_as_suffix(mod_hp)} ` +
                `${decorate('INT')} ${chalk.bold(int)}${modifier_as_suffix(mod_lang)} ` +
                `${decorate('WIS')} ${chalk.bold(wis)}${modifier_as_suffix(mod_magicsave)} ` +
                `${decorate('CHA')} ${chalk.bold(cha)}${modifier_as_suffix(mod_react)}`)
    const msg_prefix = in_result && markdown ? "- " : "";
    print_modifier_msg(mod_melee, msg_prefix, " to melee attack and damage due to STR")
    if (mod_missile && !mod_missile_extra)
        print_modifier_msg(mod_missile, msg_prefix, " to missile attack due to DEX")
    else if (!mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile_extra, msg_prefix, " to missile attack due to class");
    else if (mod_missile && mod_missile_extra)
        print_modifier_msg(mod_missile + mod_missile_extra, msg_prefix, " to missile attack due to DEX and class");
    print_modifier_msg(mod_ac, msg_prefix, " to AC due to DEX", `${in_result ? '(included in AC below)' : ''}`);
    print_modifier_msg(mod_hp, msg_prefix, " to hit dice due to CON");
    print_modifier_msg(mod_lang, msg_prefix, " additional languages due to INT");
    print_modifier_msg(mod_magicsave, msg_prefix, " to magic saves due to WIS");
    if (mod_xp)
        print_modifier_msg(mod_xp, msg_prefix, "% XP due to prime requisite");
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
    print_modifier_msg(mod_missile_extra, "", " to missile attack due to class");
}

mod_xp = chosen_class.xp_mod(str, dex, con, int, wis, cha);
if (mod_xp)
    print_modifier_msg(mod_xp, "", "% XP due to prime requisite");

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

for ( ; ; ) {
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
        if (auto_mode) {
            break;
        } else {
            console.log(chalk.bold(`Max HP ${max_hp} (Hit dice 1d${chosen_class.hit_dice})`));
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
                        var add = true;
                        const this_missile_only = weapon_list[choice.value].missile_only;
                        for (var j = 0; j < weapon_indices.length; ++j) {
                            const missile_only = weapon_list[weapon_indices[j]].missile_only;
                            if (missile_only && this_missile_only) {
                                add = false;
                                break;
                            }
                        }
                        if (add) {
                            weapon_indices.push(choice.value);
                            break;
                        }
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
        console.log(`${header('AC')} ${chalk.bold(ac)}${ac_wo_shield != ac ? ` (${chalk.bold(ac_wo_shield)} without shield)` : ''}`);
        if (chosen_class.ac_bonus_against_large) {
            const large_ac_wo_shield = ac_wo_shield - chosen_class.ac_bonus_against_large;
            const large_ac = large_ac_wo_shield - (has_shield ? 1 : 0);
            console.log(`${header('AC')} ${chalk.bold(large_ac)} against large opponents${large_ac_wo_shield != large_ac ? ` (${chalk.bold(large_ac_wo_shield)} without shield)` : ''}`);
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
                const fixed_spells = chosen_class.autoequip.fixed_spell_indices ? chosen_class.autoequip.fixed_spell_indices(level) : [];
                if (fixed_spells.length > 0) {
                    for (var j = 0; j < fixed_spells.length; ++j)
                        current_cleric_spells.push(`${cleric_spell_list[i][fixed_spells[j]]} (lv${spell_level})`);
                    continue;
                }
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
    console.log(header(`Level ${level} ${chosen_class.name}`));
    print_abilities(true);
    print_cha_msg(cha, markdown ? "- " : "");
    console.log(`${header('XP')} ${chalk.bold(chosen_class.base_xp[level - 1])}`);
    console.log(`${header('HP')} ${chalk.bold(max_hp)} / ${chalk.bold(max_hp)} (Hit dice 1d${chosen_class.hit_dice})`);
    console.log(`${header('Armor')} ${chosen_armor.name}${has_shield ? ', Shield' : ''}`);
    print_ac();
    var thac0 = 19;
    for (var i in chosen_class.thac0) {
        if (level <= chosen_class.thac0[i].level) {
            thac0 = chosen_class.thac0[i].value;
            break;
        }
    }
    console.log(`${header('THAC0')} ${chalk.bold(thac0)}`);
    console.log(`${header('Speed')} ${chalk.bold(chosen_armor.speed)} / ${chalk.bold(chosen_armor.speed / 3)}`);
    var weapons = [];
    weapon_indices.forEach((i) => { weapons.push(weapon_list[i].name); });
    console.log(`${header('Weapons')} ${weapons.join(', ')}`);
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
        console.log(`${header('Spells')} (${chosen_class.divine_magic ? 'divine' : 'arcane'}) ${spells_msg}`);
        if (spell_book.length > 0)
            console.log(`${header('Spell book')} ${spell_book.join(', ')}`);
        if (current_cleric_spells.length > 0)
            console.log(`${header('Currently memorized')} ${current_cleric_spells.join(', ')}`);
    }
    const saves = saving_throws_for_level(chosen_class.saves, level);
    console.log(`${header('Saving throws')} D ${chalk.bold(saves[0])} W ${chalk.bold(saves[1])} P ${chalk.bold(saves[2])} ` +
                `B ${chalk.bold(saves[3])} S ${chalk.bold(saves[4])}`);
    const level_dep_info = chosen_class.level_dep_info ? chosen_class.level_dep_info(level) : null;
    console.log(`${header('Details')} Open doors ${open_doors_chance(str)}-in-6` +
                `${chosen_class.other_info ? `, ${chosen_class.other_info}` : ''}` +
                `${level_dep_info ? `, ${level_dep_info}` : ''}`);
    console.log(`${header('Alignment')} ${alignment}`);
    console.log(`${header('Languages')} ${languages.join(', ')}`);
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
        console.log(`${header('Equipment')} ${equipment_arr.join(', ')}`);

    if (auto_mode) {
        console.log('\n');
        const repeat = await expand({
            message: "Re-generate?",
            default: 'y',
            choices: [
                { key: "y", name: "Yes", value: true },
                { key: "n", name: "No (quit)", value: false },
                { key: "q", name: "Quit", value: false }
            ]
        });
        if (!repeat)
            break;
    } else {
        break;
    }
}
