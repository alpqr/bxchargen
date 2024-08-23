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

export { roll, apply_map }
