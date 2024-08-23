import chalk from 'chalk'
import { select, input, Separator } from '@inquirer/prompts'
import { roll } from './funcs.js'

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
            { name: "d66", value: 66 },
            { name: "d666", value: 666 },
            new Separator(),
            { name: "Q) Quit", value: 0 }
        ],
        pageSize: 14
    });
    if (sides === 0)
        break;

    var count = 1, bonus = 0, result = 0;

    if (sides == 66) {
        const a = roll(6, 1, 0);
        const b = roll(6, 1, 0);
        result = a * 10 + b;
    } else if (sides == 666) {
        const a = roll(6, 1, 0);
        const b = roll(6, 1, 0);
        const c = roll(6, 1, 0);
        result = a * 100 + b * 10 + c;
    } else {
        count = Number(await input({
            message: "How many",
            default: "1",
            validate: (value) => { const n = Number(value); return !isNaN(n) && n >= 1 && n <= 20; }
        }));

        bonus = Number(await input({
            message: "Add",
            default: "0",
            validate: (value) => { const n = Number(value); return !isNaN(n) && n >= -100 && n <= 100; }
        }));

        result = roll(sides, count, bonus);
    }

    console.log(`\n${count}d${sides}${bonus > 0 ? '+' + bonus : bonus < 0 ? bonus : ''} -> `
        + chalk.bold(chalk.magentaBright(`${result}\n`)));
}
