import JSONTokenizer from '../../src/tokenizers/json-tokenizer';
import MockOutput from "./mock-output";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}


describe('JSON Parser Basic Tests', () => {
    // Empty structures
    test('parses an empty object', () => {
        const result = parseJSON('{}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'endObject' }
        ]);
    });

    test('parses an empty array', () => {
        const result = parseJSON('[]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'endArray' }
        ]);
    });

    // Simple arrays
    test('parses an array with one number', () => {
        const result = parseJSON('[42]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: "42" },
            { type: 'endArray' }
        ]);
    });

    test('parses an array with two numbers', () => {
        const result = parseJSON('[1, 2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: "1" },
            { type: 'valueSeparator' },
            { type: 'number', value: "2" },
            { type: 'endArray' }
        ]);
    });

    test('parses an array with one string', () => {
        const result = parseJSON('["test"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"test"' },
            { type: 'endArray' }
        ]);
    });

    // Simple objects
    test('parses object with one property', () => {
        const result = parseJSON('{"key": "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"value"' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with two properties', () => {
        const result = parseJSON('{"a": 1, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'endObject' }
        ]);
    });

    // Basic error cases
    test('handles empty input', () => {
        const result = parseJSON('');
        expect(result).toEqual([
            { type: 'error', position: 0 }
        ]);
    });

    test('handles whitespace-only input', () => {
        const result = parseJSON('   \n\t   ');
        expect(result).toEqual([
            { type: 'error', position: 8 }
        ]);
    });

    test('detects unclosed object', () => {
        const result = parseJSON('{');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects unclosed array', () => {
        const result = parseJSON('[');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects missing valueSeparator in array', () => {
        const result = parseJSON('[1 2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: "1" },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects missing valueSeparator in object', () => {
        const result = parseJSON('{"a": 1 "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects invalid property name (unquoted)', () => {
        const result = parseJSON('{key: "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects missing nameSeparator in object', () => {
        const result = parseJSON('{"key" "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects trailing valueSeparator in array', () => {
        const result = parseJSON('[1, 2, 3,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: "1" },
            { type: 'valueSeparator' },
            { type: 'number', value: "2" },
            { type: 'valueSeparator' },
            { type: 'number', value: "3" },
            { type: 'valueSeparator' },
            { type: 'error', position: 9 }
        ]);
    });

    test('detects trailing valueSeparator in object', () => {
        const result = parseJSON('{"a": 1, "b": 2,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: "2" },
            { type: 'valueSeparator' },
            { type: 'error', position: 16 }
        ]);
    });

});