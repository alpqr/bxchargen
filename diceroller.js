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
        message: "Dice",
        choices: [
            { name: "1) d2", value: 2 },
            { name: "2) d3", value: 3 },
            { name: "3) d4", value: 4 },
            { name: "4) d6", value: 6 },
            { name: "5) d8", value: 8 },
            { name: "6) d10", value: 10 },
            { name: "7) d12", value: 12 },
            { name: "8) d20", value: 20 },
            { name: "9) d100", value: 100 },
            new Separator(),
            { name: "Q) Quit", value: 0 }
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
