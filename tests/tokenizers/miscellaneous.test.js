import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser Suite of Miscellaneous Tests', () => {

    // TODO test escaped string as literal (e.g [\/] or [\u00E1] or [😊] or [tr\u00FAe] or [trúe])
    test('fails on slash as literal', () => {
        const result = parseJSON('[\/]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('fails on escaped slash as literal', () => {
        const result = parseJSON('[\\/]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('fails on special character as literal', () => {
        const result = parseJSON('[\u00E1]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('fails on escaped special character as literal', () => {
        const result = parseJSON('[\\u00E1]');
        expect(result).toEqual([
            {type: 'beginArray'},
            {type: 'error', position: 1}
        ]);
    });

    test('fails on emoji as literal', () => {
        const result = parseJSON('[😊]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1 }
        ]);
    });

    test('fails on object without value or separators', () => {
        const result = parseJSON('{"abc"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'attr', value: '"abc"' },
            { type: 'error', position: 6 }
        ]);
    });

    test('fails on object with number as key', () => {
        const result = parseJSON('{2:"abc"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ])
    });


    test('fails on object with literal as key', () => {
        const result = parseJSON('{true:"abc"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ])
    });


    test('fails on object with array as key', () => {
        const result = parseJSON('{[]:"abc"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ])
    });


    test('fails on object with object as key', () => {
        const result = parseJSON('{{}:"abc"}');
        expect(result).toEqual([
            { type: 'beginObject' },
            { type: 'error', position: 1 }
        ])
    });



});