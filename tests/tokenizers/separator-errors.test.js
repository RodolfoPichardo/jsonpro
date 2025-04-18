import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser Leading Separator Tests', () => {
    // Leading comma tests in arrays
    test('detects error with leading comma in array', () => {
        const result = parseJSON('[, 1, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma after whitespace in array', () => {
        const result = parseJSON('[  , 1, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with leading comma and whitespace in array', () => {
        const result = parseJSON('[ ,  1, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with multiple leading commas in array', () => {
        const result = parseJSON('[,, 1, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma in empty array', () => {
        const result = parseJSON('[,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma in multi-line array', () => {
        const input = `[
      , 1
      , 2
      , 3
    ]`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 8 }
        ]);
    });

    // Leading comma tests in objects
    test('detects error with leading comma in object', () => {
        const result = parseJSON('{, "a": 1, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma after whitespace in object', () => {
        const result = parseJSON('{  , "a": 1, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with leading comma and whitespace in object', () => {
        const result = parseJSON('{ ,  "a": 1, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with multiple leading commas in object', () => {
        const result = parseJSON('{,, "a": 1, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma in empty object', () => {
        const result = parseJSON('{,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading comma in multi-line object', () => {
        const input = `{
      , "a": 1
      , "b": 2
      , "c": 3
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 8 }
        ]);
    });

    // Leading colon tests in objects
    test('detects error with leading colon in object', () => {
        const result = parseJSON('{: "value", "key2": "value2"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading colon after whitespace in object', () => {
        const result = parseJSON('{  : "value", "key2": "value2"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with leading colon and whitespace in object', () => {
        const result = parseJSON('{ :  "value", "key2": "value2"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with multiple leading colons in object', () => {
        const result = parseJSON('{:: "value", "key2": "value2"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading colon in empty object', () => {
        const result = parseJSON('{:}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading colon in multi-line object', () => {
        const input = `{
      : "value1"
      , "key2": "value2"
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 8 }
        ]);
    });

    // Mixed leading separators
    test('detects error with leading colon and comma in object', () => {
        const result = parseJSON('{:, "key": "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with leading separators with whitespace', () => {
        const result = parseJSON('{ : , "key": "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 2 }
        ]);
    });

    // Leading separator in nested structures
    test('detects error with leading comma in nested array', () => {
        const result = parseJSON('{"array": [, 1, 2, 3]}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"array"'},
            { type: 'nameSeparator'},
            { type: 'beginArray' },
            { type: 'error', position: 11 }
        ]);
    });

    test('detects error with leading comma in nested object', () => {
        const result = parseJSON('{"object": {, "a": 1, "b": 2}}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"object"'},
            { type: 'nameSeparator'},
            { type: 'beginObject' },
            { type: 'error', position: 12 }
        ]);
    });

    test('detects error with leading colon in nested object', () => {
        const result = parseJSON('{"object": {: "value", "key2": "value2"}}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"object"'},
            { type: 'nameSeparator' },
            { type: 'beginObject' },
            { type: 'error', position: 12 }
        ]);
    });

    // Combination of leading and trailing separators
    test('detects error with both leading and trailing comma in array', () => {
        const result = parseJSON('[, 1, 2, 3, ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with both leading and trailing comma in object', () => {
        const result = parseJSON('{, "a": 1, "b": 2, }');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });
});

describe('JSON Parser Invalid Separator Tests', () => {

    // Double comma tests in arrays
    test('detects error with double comma in array', () => {
        const result = parseJSON('[1,, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with double comma and whitespace in array', () => {
        const result = parseJSON('[1, , 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 4 }
        ]);
    });

    test('detects error with multiple double commas in array', () => {
        const result = parseJSON('[1,, 2,, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with triple commas in array', () => {
        const result = parseJSON('[1,,, 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with double comma at end of array', () => {
        const result = parseJSON('[1, 2, 3,,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'valueSeparator' },
            { type: 'error', position: 9 }
        ]);
    });

    // Double comma tests in objects
    test('detects error with double comma in object', () => {
        const result = parseJSON('{"a": 1,, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with double comma and whitespace in object', () => {
        const result = parseJSON('{"a": 1, , "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 9 }
        ]);
    });

    test('detects error with multiple double commas in object', () => {
        const result = parseJSON('{"a": 1,, "b": 2,, "c": 3}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with triple commas in object', () => {
        const result = parseJSON('{"a": 1,,, "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with double comma at end of object', () => {
        const result = parseJSON('{"a": 1, "b": 2,,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 16 }
        ]);
    });

    // Double colon tests in objects
    test('detects error with double colon in object pair', () => {
        const result = parseJSON('{"key":: "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with double colon and whitespace in object pair', () => {
        const result = parseJSON('{"key": : "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with multiple double colons in object', () => {
        const result = parseJSON('{"a":: 1, "b":: 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 5 }
        ]);
    });

    // Comma instead of colon in object
    test('detects error with comma instead of colon in object', () => {
        const result = parseJSON('{"key", "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 6 }
        ]);
    });

    test('detects error with comma instead of colon with whitespace', () => {
        const result = parseJSON('{"key" , "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with some proper pairs and some using comma instead of colon', () => {
        const result = parseJSON('{"a": 1, "b", 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'error', position: 12 }
        ]);
    });

    // Colon instead of comma in objects
    test('detects error with colon instead of comma between pairs', () => {
        const result = parseJSON('{"a": 1: "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with colon instead of comma with whitespace', () => {
        const result = parseJSON('{"a": 1 : "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'error', position: 8 }
        ]);
    });

    // Colon in array (invalid)
    test('detects error with colon in array', () => {
        const result = parseJSON('[1: 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with colon instead of comma in array', () => {
        const result = parseJSON('[1: 2: 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'error', position: 2 }
        ]);
    });

    test('detects error with mixed valid and invalid separators in array', () => {
        const result = parseJSON('[1, 2: 3, 4]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'valueSeparator' },
            { type: 'number', value: '2'},
            { type: 'error', position: 5 }
        ]);
    });

    // Missing separators
    test('detects error with missing comma in array', () => {
        const result = parseJSON('[1 2, 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with missing comma between multiple elements in array', () => {
        const result = parseJSON('[1 2 3]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with missing comma in object', () => {
        const result = parseJSON('{"a": 1 "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1'},
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with missing comma between multiple pairs in object', () => {
        const result = parseJSON('{"a": 1 "b": 2 "c": 3}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1'},
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with missing colon in object pair', () => {
        const result = parseJSON('{"key" "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 7 }
        ]);
    });

    // Nested structures with invalid separators
    test('detects error with double comma in nested array', () => {
        const result = parseJSON('{"arr": [1,, 2]}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"arr"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'valueSeparator' },
            { type: 'error', position: 11 }
        ]);
    });

    test('detects error with double colon in nested object', () => {
        const result = parseJSON('[{"key":: "value"}]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with comma instead of colon in nested object', () => {
        const result = parseJSON('{"obj": {"key", "value"}}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"obj"' },
            { type: 'nameSeparator' },
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 14 }
        ]);
    });

    test('detects error with colon in nested array', () => {
        const result = parseJSON('{"arr": [1: 2, 3]}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"arr"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '1'},
            { type: 'error', position: 10 }
        ]);
    });

    // Complex invalid separator combinations
    test('detects error with multiple separator errors in complex structure', () => {
        const result = parseJSON('{"a": 1,, "b": [1, 2,, 3], "c": {"d",, "e"}}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1'},
            { type: 'valueSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with comma after object property but no value', () => {
        const result = parseJSON('{"key",}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 6 }
        ]);
    });

    test('detects error with object property followed by neither comma nor colon', () => {
        const result = parseJSON('{"key" "next-key": "value"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with malformed separators in deeply nested structure', () => {
        const input = `{
      "level1": {
        "level2": [
          {"a": 1,, "b": 2},
          [1, 2: 3]
        ]
      }
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"level1"' },
            { type: 'nameSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"level2"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 58 }
        ]);
    });
});




describe('JSON Parser Trailing Separator Tests', () => {

    // Trailing comma tests in arrays
    test('detects error with trailing comma in array', () => {
        const result = parseJSON('[1, 2, 3,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'valueSeparator' },
            { type: 'error', position: 9 }
        ]);
    });

    test('detects error with trailing comma and whitespace in array', () => {
        const result = parseJSON('[1, 2, 3, ]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'valueSeparator' },
            { type: 'error', position: 10 }
        ]);
    });

    test('detects error with trailing comma in single-item array', () => {
        const result = parseJSON('[1,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 3 }
        ]);
    });

    test('detects error with trailing comma in empty array', () => {
        const result = parseJSON('[,]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with trailing comma in multi-line array', () => {
        const input = `[
      1,
      2,
      3,
    ]`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'valueSeparator' },
            { type: 'error', position: 33 }
        ]);
    });

    test('detects error with trailing comma in nested array', () => {
        const result = parseJSON('{"array": [1, 2, 3,]}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"array"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'valueSeparator' },
            { type: 'error', position: 19 }
        ]);
    });

    // Trailing comma tests in objects
    test('detects error with trailing comma in object', () => {
        const result = parseJSON('{"a": 1, "b": 2,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 16 }
        ]);
    });

    test('detects error with trailing comma and whitespace in object', () => {
        const result = parseJSON('{"a": 1, "b": 2, }');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 17 }
        ]);
    });

    test('detects error with trailing comma in single-pair object', () => {
        const result = parseJSON('{"a": 1,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 8 }
        ]);
    });

    test('detects error with trailing comma in empty object', () => {
        const result = parseJSON('{,}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with trailing comma in multi-line object', () => {
        const input = `{
      "a": 1,
      "b": 2,
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 34 }
        ]);
    });

    test('detects error with trailing comma in nested object', () => {
        const result = parseJSON('[{"a": 1, "b": 2,}]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 17 }
        ]);
    });

    // Trailing colon tests
    test('detects error with trailing colon in object', () => {
        const result = parseJSON('{"a": 1, "b":}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 13 }
        ]);
    });

    test('detects error with trailing colon and whitespace in object', () => {
        const result = parseJSON('{"a": 1, "b": }');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 14 }
        ]);
    });

    test('detects error with trailing colon in empty object', () => {
        const result = parseJSON('{:}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'error', position: 1 }
        ]);
    });

    test('detects error with trailing colon in single-property object', () => {
        const result = parseJSON('{"key":}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 7 }
        ]);
    });

    test('detects error with trailing colon in multi-line object', () => {
        const input = `{
      "a": 1,
      "b":
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 31 }
        ]);
    });

    test('detects error with trailing colon in nested object', () => {
        const result = parseJSON('{"obj": {"key":}}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"obj"' },
            { type: 'nameSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"key"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 15 }

        ]);
    });

    // Complex trailing separator scenarios
    test('detects error with multiple trailing separators', () => {
        const result = parseJSON('{"a": 1, "b":,}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 13 }
        ]);
    });

    test('detects error with trailing separators in complex structure', () => {
        const input = `{
      "array": [1, 2,],
      "object": {"a": 1,}
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"array"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 23 }
        ]);
    });

    test('detects error with only property name and trailing comma', () => {
        const result = parseJSON('{"key",}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"key"' },
            { type: 'error', position: 6 }
        ]);
    });

    test('detects error with trailing separators at multiple levels', () => {
        const result = parseJSON('{"a": [1,], "b": {"c":,},}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'error', position: 9 }
        ]);
    });
});