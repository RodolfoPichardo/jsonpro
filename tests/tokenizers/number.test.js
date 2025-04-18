import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser Number Format Tests', () => {

    // Integer numbers
    test('parses zero', () => {
        const result = parseJSON('[0]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0' },
            { type: 'endArray' }
        ]);
    });

    test('parses positive integer', () => {
        const result = parseJSON('[42]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '42' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative integer', () => {
        const result = parseJSON('[-42]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-42' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative zero', () => {
        const result = parseJSON('[-0]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-0' },
            { type: 'endArray' }
        ]);
    });

    // Large numbers
    test('parses large integer', () => {
        const result = parseJSON('[12345678901234567890]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '12345678901234567890' },
            { type: 'endArray' }
        ]);
    });

    test('parses max safe integer', () => {
        const result = parseJSON('[9007199254740991]'); // Number.MAX_SAFE_INTEGER
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '9007199254740991' },
            { type: 'endArray' }
        ]);
    });

    test('parses min safe integer', () => {
        const result = parseJSON('[-9007199254740991]'); // Number.MIN_SAFE_INTEGER
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-9007199254740991' },
            { type: 'endArray' }
        ]);
    });

    // Decimal numbers
    test('parses decimal number', () => {
        const result = parseJSON('[3.14159]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '3.14159' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative decimal number', () => {
        const result = parseJSON('[-3.14159]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-3.14159' },
            { type: 'endArray' }
        ]);
    });

    test('parses decimal less than 1', () => {
        const result = parseJSON('[0.123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0.123' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative decimal less than 1', () => {
        const result = parseJSON('[-0.123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-0.123' },
            { type: 'endArray' }
        ]);
    });

    // Scientific notation (e notation)
    test('parses positive exponent', () => {
        const result = parseJSON('[1e5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1e5' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative exponent', () => {
        const result = parseJSON('[1e-5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1e-5' },
            { type: 'endArray' }
        ]);
    });

    test('parses uppercase E exponent', () => {
        const result = parseJSON('[1E5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1E5' },
            { type: 'endArray' }
        ]);
    });

    test('parses positive exponent with plus sign', () => {
        const result = parseJSON('[1e+5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1e+5' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative number with exponent', () => {
        const result = parseJSON('[-1e5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-1e5' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative number with negative exponent', () => {
        const result = parseJSON('[-1e-5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-1e-5' },
            { type: 'endArray' }
        ]);
    });

    // Decimal numbers with exponents
    test('parses decimal with positive exponent', () => {
        const result = parseJSON('[3.14e2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '3.14e2' },
            { type: 'endArray' }
        ]);
    });

    test('parses decimal with negative exponent', () => {
        const result = parseJSON('[3.14e-2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '3.14e-2' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative decimal with exponent', () => {
        const result = parseJSON('[-3.14e2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-3.14e2' },
            { type: 'endArray' }
        ]);
    });

    test('parses decimal less than 1 with exponent', () => {
        const result = parseJSON('[0.5e2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0.5e2' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative decimal less than 1 with exponent', () => {
        const result = parseJSON('[-0.5e2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-0.5e2' },
            { type: 'endArray' }
        ]);
    });

    test('parses decimal less than 1 with negative exponent', () => {
        const result = parseJSON('[0.5e-2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0.5e-2' },
            { type: 'endArray' }
        ]);
    });

    // Very small and very large numbers
    test('parses very small number with exponent', () => {
        const result = parseJSON('[1.23e-10]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1.23e-10' },
            { type: 'endArray' }
        ]);
    });

    test('parses very large number with exponent', () => {
        const result = parseJSON('[1.23e+20]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1.23e+20' },
            { type: 'endArray' }
        ]);
    });

    // Zero with exponent
    test('parses zero with positive exponent', () => {
        const result = parseJSON('[0e5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0e5' },
            { type: 'endArray' }
        ]);
    });

    test('parses zero with negative exponent', () => {
        const result = parseJSON('[0e-5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0e-5' },
            { type: 'endArray' }
        ]);
    });

    test('parses negative zero with exponent', () => {
        const result = parseJSON('[-0e5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-0e5' },
            { type: 'endArray' }
        ]);
    });


    // Multiple numbers in arrays and objects
    test('parses array with various number formats', () => {
        const result = parseJSON('[0, 42, -42, 3.14, -3.14, 1e5, 1e-5, 3.14e2, -3.14e-2]');
        expect(result.length).toBe(19); // 9 numbers + 8 commas + 2 brackets
        expect(result[0]).toEqual({ type: 'beginArray' });
        expect(result[1]).toEqual({ type: 'number', value: '0' });
        expect(result[3]).toEqual({ type: 'number', value: '42' });
        expect(result[5]).toEqual({ type: 'number', value: '-42' });
        expect(result[7]).toEqual({ type: 'number', value: '3.14' });
        expect(result[9]).toEqual({ type: 'number', value: '-3.14' });
        expect(result[11]).toEqual({ type: 'number', value: '1e5' });
        expect(result[13]).toEqual({ type: 'number', value: '1e-5' });
        expect(result[15]).toEqual({ type: 'number', value: '3.14e2' });
        expect(result[17]).toEqual({ type: 'number', value: '-3.14e-2' });
        expect(result[18]).toEqual({ type: 'endArray' });
    });

    test('parses object with various number formats', () => {
        const input = `{
      "int": 42,
      "negative": -42,
      "decimal": 3.14,
      "negDecimal": -3.14,
      "exp": 1e5,
      "negExp": 1e-5,
      "decimalExp": 3.14e2,
      "negDecimalExp": -3.14e-2
    }`;
        const result = parseJSON(input);

        // Check for no errors
        expect(result.filter(token => token.type === 'error').length).toBe(0);

        // Check for all 8 number values
        const numbers = result.filter(token => token.type === 'number');
        expect(numbers.length).toBe(8);

        // Check specific values
        expect(numbers.find(n => n.value === '42')).toBeTruthy();
        expect(numbers.find(n => n.value === '-42')).toBeTruthy();
        expect(numbers.find(n => n.value === '3.14')).toBeTruthy();
        expect(numbers.find(n => n.value === '-3.14')).toBeTruthy();
        expect(numbers.find(n => n.value === '1e5')).toBeTruthy();
        expect(numbers.find(n => n.value === '1e-5')).toBeTruthy();
        expect(numbers.find(n => n.value === '3.14e2')).toBeTruthy();
        expect(numbers.find(n => n.value === '-3.14e-2')).toBeTruthy();
    });

    // Edge cases
    test('parses array with number followed by whitespace', () => {
        const result = parseJSON('[42   ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '42' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with whitespace before number', () => {
        const result = parseJSON('[   42]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '42' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with whitespace surrounding number', () => {
        const result = parseJSON('[   42   ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '42' },
            { type: 'endArray' }
        ]);
    });
});