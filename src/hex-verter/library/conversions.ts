export function dec_to_binary(number : number) : String {
    var digits : String[] = [];

    while (number > 0) {
        var digit : String = String(number % 2);
        number = (number - (number % 2))/ 2;
        digits.push(digit);
    }

    return digits.reverse().join("");
}

export function binary_to_hex(number : String) : number {
    var result : number = 0;

    for (let i : number = 0; i < 4; i++) {
        result += Number(number[i]) * 2**(3 - i);
    }

    return result;
}