import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser Literal Tests', () => {
    // Literals in arrays
    test('parses array with single true literal', () => {
        const result = parseJSON('[true]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with single false literal', () => {
        const result = parseJSON('[false]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'false' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with single null literal', () => {
        const result = parseJSON('[null]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'null' },
            { type: 'endArray' }
        ]);
    });

    // Literals with whitespace in arrays
    test('parses true with leading whitespace in array', () => {
        const result = parseJSON('[   true]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true' },
            { type: 'endArray' }
        ]);
    });

    test('parses false with trailing whitespace in array', () => {
        const result = parseJSON('[false   ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'false' },
            { type: 'endArray' }
        ]);
    });

    test('parses null with surrounding whitespace in array', () => {
        const result = parseJSON('[   null   ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'null' },
            { type: 'endArray' }
        ]);
    });

    // Multiple literals in arrays
    test('parses array with boolean literals', () => {
        const result = parseJSON('[true, false]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true' },
            { type: 'valueSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with all literals', () => {
        const result = parseJSON('[true, false, null]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true' },
            { type: 'valueSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'valueSeparator' },
            { type: 'literal', value: 'null' },
            { type: 'endArray' }
        ]);
    });

    // Literals in objects
    test('parses object with true literal value', () => {
        const result = parseJSON('{"success": true}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"success"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'true' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with false literal value', () => {
        const result = parseJSON('{"active": false}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"active"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with null literal value', () => {
        const result = parseJSON('{"data": null}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"data"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'null' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with multiple literal values', () => {
        const result = parseJSON('{"success": true, "active": false, "data": null}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"success"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'true' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"active"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"data"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'null' },
            { type: 'endObject' }
        ]);
    });

    // Invalid literals - incorrect casing
    test('detects error with incorrect casing - TRUE in array', () => {
        const result = parseJSON('[TRUE]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with incorrect casing - False in object', () => {
        const result = parseJSON('{"active": False}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"active"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 11 }
        ]);
    });

    test('detects error with incorrect casing - NULL in array', () => {
        const result = parseJSON('[NULL]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    // Invalid literals - similar words
    test('detects error with truee in array', () => {
        const result = parseJSON('[truee]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true'},
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with tru in object', () => {
        const result = parseJSON('{"valid": tru}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"valid"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 10 }
        ]);
    });

    test('detects error with truthy in array', () => {
        const result = parseJSON('[truthy]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with falsey in object', () => {
        const result = parseJSON('{"status": falsey}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"status"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'error', position: 16 }
        ]);
    });

    test('detects error with fals in array', () => {
        const result = parseJSON('[fals]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with nul in object', () => {
        const result = parseJSON('{"data": nul}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"data"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 9 }
        ]);
    });

    test('detects error with nulll in array', () => {
        const result = parseJSON('[nulll]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'null' },
            { type: 'error', position: 5 }
        ]);
    });

    test('detects error with nullable in object', () => {
        const result = parseJSON('{"property": nullable}');
        expect(result).toEqual([
            {  type: 'beginObject' },
            { type: 'attr', value: '"property"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'null' },
            { type: 'error', position: 17 }
        ]);
    });

    // Invalid literals in structures
    test('detects error with invalid literal in array', () => {
        const result = parseJSON('[true, tru, false]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'literal', value: 'true' },
            { type: 'valueSeparator' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with invalid literal in object', () => {
        const result = parseJSON('{"success": true, "error": falsee}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"success"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'true' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"error"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'false' },
            { type: 'error', position: 32 }
        ]);
    });

    // Edge cases with literals
    test('detects error with literal as object key', () => {
        const result = parseJSON('{true: "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('handles literal as string correctly in object', () => {
        const result = parseJSON('{"value": "true"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"value"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"true"' },
            { type: 'endObject' }
        ]);
    });

    test('handles literal as string correctly in array', () => {
        const result = parseJSON('["true", "false", "null"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"true"' },
            { type: 'valueSeparator' },
            { type: 'string', value: '"false"' },
            { type: 'valueSeparator' },
            { type: 'string', value: '"null"' },
            { type: 'endArray' }
        ]);
    });


    test('the parser cannot be fooled by special characters 1', () => {
        const result = parseJSON('[tr\u00FAe]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('the parser cannot be fooled by special characters 2', () => {
        const result = parseJSON('[tr\\u00FAe]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('the parser cannot be fooled by special characters 3 ', () => {
        const result = parseJSON('[trúe]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });


    // Combinations and complex cases
    test('parses complex structure with all literals', () => {
        const input = `{
      "active": true,
      "verified": false,
      "userData": null,
      "tags": ["important", true, null, false]
    }`;
        const result = parseJSON(input);

        // Just check for no errors and presence of literal values
        expect(result.filter(token => token.type === 'error').length).toBe(0);
        expect(result.filter(token => token.type === 'literal' && token.value === 'true').length).toBe(2);
        expect(result.filter(token => token.type === 'literal' && token.value === 'false').length).toBe(2);
        expect(result.filter(token => token.type === 'literal' && token.value === 'null').length).toBe(2);
    });
});