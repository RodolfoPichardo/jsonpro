import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser test spaces and new lines', () => {
    // Tests with trailing spaces
    test('parses empty object with trailing spaces', () => {
        const result = parseJSON('{}   ');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'endObject' }
        ]);
    });

    test('parses empty array with trailing spaces', () => {
        const result = parseJSON('[]   ');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'endArray' }
        ]);
    });

    // Tests with leading spaces
    test('parses empty object with leading spaces', () => {
        const result = parseJSON('   {}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'endObject' }
        ]);
    });

    test('parses empty array with leading spaces', () => {
        const result = parseJSON('   []');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'endArray' }
        ]);
    });

    // Tests with surrounding spaces
    test('parses empty object with surrounding spaces', () => {
        const result = parseJSON('   {}   ');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'endObject' }
        ]);
    });

    test('parses empty array with surrounding spaces', () => {
        const result = parseJSON('   []   ');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'endArray' }
        ]);
    });

    // Spaces inside objects
    test('parses object with spaces after opening brace', () => {
        const result = parseJSON('{  "a": 1}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with spaces before closing brace', () => {
        const result = parseJSON('{"a": 1  }');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with spaces around nameSeparator', () => {
        const result = parseJSON('{"a"  :  1}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with spaces around valueSeparator', () => {
        const result = parseJSON('{"a": 1  ,  "b": 2}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator'},
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'endObject' }
        ]);
    });

    test('parses object with excessive whitespace everywhere', () => {
        const result = parseJSON('{  "a"  :  1  ,  "b"  :  2  }');
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

    // Spaces inside arrays
    test('parses array with spaces after opening bracket', () => {
        const result = parseJSON('[  1, 2]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'endArray' }
        ]);
    });

    test('parses array with spaces before closing bracket', () => {
        const result = parseJSON('[1, 2  ]');
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'endArray'}
        ]);
    });

    test('parses array with spaces around valueSeparator', () => {
        const result = parseJSON('[1  ,  2]');
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'endArray'}
        ]);
    });

    test('parses array with excessive whitespace everywhere', () => {
        const result = parseJSON('[  1  ,  2  ,  3  ]');
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'endArray'}
        ]);
    });

    // Tests with newlines and tabs
    test('parses object with newlines between properties', () => {
        const input = `{
      "a": 1,
      "b": 2
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
            { type: 'number', value: '2' },
            { type: 'endObject'}
        ]);
    });

    test('parses array with newlines between items', () => {
        const input = `[
      1,
      2,
      3
    ]`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'endArray'}
        ]);
    });

    test('parses object with tabs between properties', () => {
        const input = `{\t"a":\t1,\t"b":\t2\t}`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'endObject'}
        ]);
    });

    test('parses array with tabs between items', () => {
        const input = `[\t1,\t2,\t3\t]`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'number', value: '3' },
            { type: 'endArray'}
        ]);
    });

    test('parses mixed whitespace characters in object', () => {
        const input = `{
      "key1":\t"value1",
      "key2":  "value2",
    \t"key3":   "value3"
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"key1"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"value1"' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"key2"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"value2"' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"key3"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"value3"' },
            { type: 'endObject'}
        ]);
    });

    test('parses nested structures with varied whitespace', () => {
        const input = `{
      "array":   [
        { "id": 1 },
    \t\t{ "id"  :  2 },
        {   "id":\t3   }
      ],
      "object":  {
        "a"  :  "value",
    \t\t"b":\t{
          "nested": true
        }
      }
    }`;
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"array"' },
            { type: 'nameSeparator' },
            { type: 'beginArray'},
            { type: 'beginObject'},
            { type: 'attr', value: '"id"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'endObject'},
            { type: 'valueSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"id"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '2' },
            { type: 'endObject'},
            { type: 'valueSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"id"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '3' },
            { type: 'endObject'},
            { type: 'endArray'},
            { type: 'valueSeparator' },
            { type: 'attr', value: '"object"' },
            { type: 'nameSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'string', value: '"value"' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'beginObject'},
            { type: 'attr', value: '"nested"' },
            { type: 'nameSeparator' },
            { type: 'literal', value: 'true' },
            { type: 'endObject'},
            { type: 'endObject'},
            { type: 'endObject'}
        ]);
    });

    // Error cases with whitespace
    test('handles error with trailing whitespace after invalid syntax', () => {
        const result = parseJSON('[1, 2,]   ');
        expect(result).toEqual([
            { type: 'beginArray'},
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'number', value: '2' },
            { type: 'valueSeparator' },
            { type: 'error', position: 6 }
        ]);
    });

    test('handles error with leading whitespace before invalid syntax', () => {
        const result = parseJSON('   {key: "value"}');
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'error', position: 4 }
        ]);
    });

    test('handles error with newlines in invalid places', () => {
        const input = '{\n"a"\n:\n 1\n,\n"b"\n:\n\n}';
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'number', value: '1' },
            { type: 'valueSeparator' },
            { type: 'attr', value: '"b"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 20 }
        ]);
    });

    test('handles error with excessive whitespace in invalid places', () => {
        const input = '{\n\t"a":: 1\n}';
        const result = parseJSON(input);
        expect(result).toEqual([
            { type: 'beginObject'},
            { type: 'attr', value: '"a"' },
            { type: 'nameSeparator' },
            { type: 'error', position: 7 }
        ]);
    });
});
