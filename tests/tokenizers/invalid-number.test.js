import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser Invalid Number Format Tests', () => {

    // Numbers ending with a dot
    test('detects error with integer ending with a dot', () => {
        const result = parseJSON('[123.]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with negative integer ending with a dot', () => {
        const result = parseJSON('[-123.]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 6 }
        ]);
    });

    // Numbers starting with multiple zeros
    test('detects error with number starting with multiple zeros', () => {
        const result = parseJSON('[00123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with number starting with zero followed by digits', () => {
        const result = parseJSON('[0123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with negative number starting with multiple zeros', () => {
        const result = parseJSON('[-00123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '-0' },
            { type: 'error', position: 3 }
        ]);
    });

    // Numbers with type suffixes
    test('detects error with integer followed by L suffix', () => {
        const result = parseJSON('[123L]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123' },
            { type: 'error', position: 4 }
        ]);
    });

    test('detects error with integer followed by f suffix', () => {
        const result = parseJSON('[123f]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123' },
            { type: 'error', position: 4 }
        ]);
    });

    test('detects error with integer followed by d suffix', () => {
        const result = parseJSON('[123d]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123' },
            { type: 'error', position: 4 }
        ]);
    });

    // Numbers with garbage characters
    test('detects error with number containing division symbol', () => {
        const result = parseJSON('[1/2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with number containing underscore', () => {
        const result = parseJSON('[1_000_000]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with number containing mathematical symbols', () => {
        const result = parseJSON('[1+2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'error', position: 2 }
        ]);
    });

    // Invalid exponent formats
    test('detects error with number ending with e', () => {
        const result = parseJSON('[123e]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with number ending with e+', () => {
        const result = parseJSON('[123e+]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 6 }
        ]);
    });

    test('detects error with number ending with e-', () => {
        const result = parseJSON('[123e-]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 6 }
        ]);
    });

    test('detects error with e as prefix', () => {
        const result = parseJSON('[e10]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with E as prefix', () => {
        const result = parseJSON('[E10]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with e+ as prefix', () => {
        const result = parseJSON('[e+10]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    // Invalid decimal formats
    test('detects error with number starting with a dot', () => {
        const result = parseJSON('[.123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with negative number starting with a dot', () => {
        const result = parseJSON('[-.123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with multiple decimal points', () => {
        const result = parseJSON('[123.456.789]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123.456'}, // TODO is this what we want?
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with decimal point in exponent', () => {
        const result = parseJSON('[123e4.5]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123e4'},
            { type: 'error', position: 6 }
        ]);
    });

    // Spaces within numbers
    test('detects error with space in middle of integer', () => {
        const result = parseJSON('[123 456]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123'},
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with space after decimal point', () => {
        const result = parseJSON('[123. 456]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with space before decimal point', () => {
        const result = parseJSON('[123 .456]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '123'},
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with space after e', () => {
        const result = parseJSON('[123e 4]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with space after e-', () => {
        const result = parseJSON('[123e- 4]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 6 }
        ]);
    });

    // Hexadecimal, octal, and binary formats
    test('detects error with hexadecimal format', () => {
        const result = parseJSON('[0x123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0'},
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with octal format', () => {
        const result = parseJSON('[0o123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0'},
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with binary format', () => {
        const result = parseJSON('[0b1010]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0'},
            { type: 'error', position: 2 }
        ]);
    });

    // Empty exponents
    test('detects error with decimal followed by e with no exponent digits', () => {
        const result = parseJSON('[3.14e]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 6 }
        ]);
    });

    // Numeric identifiers/constants
    test('detects error with Infinity', () => {
        const result = parseJSON('[Infinity]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with -Infinity', () => {
        const result = parseJSON('[-Infinity]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with NaN', () => {
        const result = parseJSON('[NaN]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    // Invalid plus sign usage
    test('detects error with plus sign before number', () => {
        const result = parseJSON('[+123]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with plus sign before decimal', () => {
        const result = parseJSON('[+3.14]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    // Invalid number combinations in objectssrc/parser.js
    test('detects error with multiple invalid number formats in object', () => {
        const result = parseJSON('{"a": 01, "b": 123., "c": .5, "d": 1e, "e": 4.5.6}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"'},
            { type: 'nameSeparator' },
            { type: 'number', value: '0'},
            { type: 'error', position: 7 }
        ]);
    });

    // Invalid number combinations in arrays
    test('detects error with multiple invalid number formats in array', () => {
        const result = parseJSON('[01, 123., .5, 1e, 4.5.6]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '0' },
            { type: 'error', position: 2 }
        ]);
    });

    // Numbers with invalid trailing characters in nesting
    test('detects error with invalid number in nested structure', () => {
        const result = parseJSON('{"array": [123L, 456f], "object": {"value": 0123}}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"array"'},
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '123'},
            { type: 'error', position: 14 }
        ]);
    });
});