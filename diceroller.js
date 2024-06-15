import chalk from 'chalk'
import { select, input, Separator } from '@inquirer/prompts';

function roll(sides, count, bonus) {
    var result = 0;
    for (var i = 0; i < (count ?? 1); ++i)
        result += Math.floor(Math.random() * sides) + 1;
    if (bonus)
        result += bonus;
    return result;
}

for ( ; ; ) {
    const sides = await select({
        message: "Dice (kbd shortcuts: 1-9, Q)",
        choices: [
            { name: "d2", value: 2 },
            { name: "d3", value: 3 },
            { name: "d4", value: 4 },
            { name: "d6", value: 6 },
            { name: "d8", value: 8 },
            { name: "d10", value: 10 },
            { name: "d12", value: 12 },
            { name: "d20", value: 20 },
            { name: "d100", value: 100 },
            new Separator(),
            { name: "Quit", value: 0 }
        ],
        pageSize: 12
    });
    if (sides === 0)
        break;

    const count = Number(await input({
        message: "How many",
        default: "1",
        validate: (value) => { const n = Number(value); return !isNaN(n) && n >= 1 && n <= 20; }
    }));

    const bonus = Number(await input({
        message: "Add",
        default: "0",
        validate: (value) => { const n = Number(value); return !isNaN(n) && n >= -100 && n <= 100; }
    }));

    const result = roll(sides, count, bonus);

    console.log(`\n${count}d${sides}${bonus > 0 ? '+' + bonus : bonus < 0 ? bonus : ''} -> `
        + chalk.bold(chalk.magentaBright(`${result}\n`)));
}
