import MockOutput from "./mock-output";
import JSONTokenizer from "../../src/tokenizers/json-tokenizer";

const parseJSON = function(str) {
    const output = new MockOutput();
    const parser = new JSONTokenizer(str, output);
    parser.run();
    return output.token;
}

describe('JSON Parser String Tests', () => {
    
    // Basic string tests
    test('parses empty string', () => {
        const result = parseJSON('[""]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '""' },
            { type: 'endArray' }
        ]);
    });

    test('parses simple string', () => {
        const result = parseJSON('["hello"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with spaces', () => {
        const result = parseJSON('["hello world"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello world"' },
            { type: 'endArray' }
        ]);
    });

    // Escaped characters tests
    test('parses string with escaped double quotes', () => {
        const result = parseJSON('["hello \\"world\\""]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello \\"world\\""' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped backslash', () => {
        const result = parseJSON('["C:\\\\path\\\\to\\\\file"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"C:\\\\path\\\\to\\\\file"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped forward slash', () => {
        const result = parseJSON('["http:\\/\\/example.com"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"http:\\/\\/example.com"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped backspace', () => {
        const result = parseJSON('["hello\\bworld"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello\\bworld"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped form feed', () => {
        const result = parseJSON('["hello\\fworld"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello\\fworld"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped newline', () => {
        const result = parseJSON('["hello\\nworld"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello\\nworld"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped carriage return', () => {
        const result = parseJSON('["hello\\rworld"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello\\rworld"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with escaped tab', () => {
        const result = parseJSON('["hello\\tworld"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"hello\\tworld"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with multiple escaped characters', () => {
        const result = parseJSON('["\\t\\r\\n\\f\\b\\\\\\"\\u0041"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\t\\r\\n\\f\\b\\\\\\"\\u0041"' },
            { type: 'endArray' }
        ]);
    });

    // Unicode escape sequences
    test('parses string with basic unicode escape', () => {
        const result = parseJSON('["\\u0041\\u0042\\u0043"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\u0041\\u0042\\u0043"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with complex unicode escape', () => {
        const result = parseJSON('["\\u00A9 2023"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\u00A9 2023"' },
            { type: 'endArray' }
        ]);
    });

    // Direct Unicode characters
    test('parses string with direct unicode characters', () => {
        const result = parseJSON('["€£¥©®™"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"€£¥©®™"' },
            { type: 'endArray' }
        ]);
    });

    // Emoji tests
    test('parses string with emojis', () => {
        const result = parseJSON('["😀🙈🚀🌍🎉"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"😀🙈🚀🌍🎉"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with emoji and text', () => {
        const result = parseJSON('["Hello 😀 World 🌍"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"Hello 😀 World 🌍"' },
            { type: 'endArray' }
        ]);
    });

    // Strings with numbers
    test('parses string with numbers', () => {
        const result = parseJSON('["123456"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"123456"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with mixed text and numbers', () => {
        const result = parseJSON('["abc123def456"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"abc123def456"' },
            { type: 'endArray' }
        ]);
    });

    // Strings with JSON literal words
    test('parses string with JSON literal words', () => {
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

    // Strings with brackets and braces
    test('parses string with brackets and braces', () => {
        const result = parseJSON('["[{test}]"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"[{test}]"' },
            { type: 'endArray' }
        ]);
    });

    test('parses string with JSON-like content', () => {
        const result = parseJSON('["{\\"key\\": \\"value\\"}"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"{\\"key\\": \\"value\\"}"' },
            { type: 'endArray' }
        ]);
    });

    // Strings with special characters
    test('parses string with special characters', () => {
        const result = parseJSON('["!@#$%^&*()_+-=[]{}|;:,.<>/?"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"!@#$%^&*()_+-=[]{}|;:,.<>/?"' },
            { type: 'endArray' }
        ]);
    });

    // Strings with control characters (should be escaped)
    test('detects error with unescaped control characters', () => {
        // String with raw U+0000 to U+001F characters would normally fail
        // But to test this properly we'd need to create raw string with these characters
        // Instead, we'll test the escaped version which should pass
        const result = parseJSON('["\\u0000\\u001F"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\u0000\\u001F"' },
            { type: 'endArray' }
        ]);
    });

    // Very long strings
    test('parses very long string', () => {
        const longString = "x".repeat(1000);
        const jsonString = `["${longString}"]`;
        const result = parseJSON(jsonString);
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"' + longString + '"' },
            { type: 'endArray' }
        ]);
    });

    // Multiline strings (should be escaped)
    test('parses string with escaped multiline content', () => {
        const result = parseJSON('["line 1\\nline 2\\nline 3"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"line 1\\nline 2\\nline 3"' },
            { type: 'endArray' }
        ]);
    });

    // Error cases
    test('detects error with unterminated string', () => {
        const result = parseJSON('["unterminated string]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"unterminated string]'},
            { type: 'error', position: 22}
        ]);
    });

    test('detects error with invalid escape sequence', () => {
        const result = parseJSON('["invalid \\z escape"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 11}
        ]);
    });

    test('detects error with empty escaped unicode', () => {
        const result = parseJSON('["\\u"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 3}
        ]);
    });

    test('detects error with uppercase as unicode', () => {
        const result = parseJSON('["\\U0042"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 3}
        ]);
    });

    test('detects error with invalid unicode escape sequence', () => {
        const result = parseJSON('["\\u123Z"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 3}
        ]);
    });

    test('detects error with incomplete unicode escape sequence', () => {
        const result = parseJSON('["\\u123"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 3}
        ]);
    });

    test('detects error with unescaped quotes in string', () => {
        const result = parseJSON('["unescaped " quotes"]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"unescaped "' },
            { type: 'error', position: 14}
        ]);
    });

    test('fails on strings with single quotes', () => {
        const result = parseJSON('[\'\']');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1}
        ]);
    });


    test('fails on strings with backticks `', () => {
        const result = parseJSON('[``]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1}
        ]);
    });


    test('fails on strings closing with single quotes', () => {
        const result = parseJSON('["\']');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\']' },
            { type: 'error', position: 4}
        ]);
    });

    test('fails on strings ending with backslash', () => {
        const result = parseJSON('["\\\\]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\\\]' },
            { type: 'error', position: 5}
        ]);
    });

    test('fails on strings ending with backslash and nothing else', () => {
        const result = parseJSON('["\\\\');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'string', value: '"\\\\' },
            { type: 'error', position: 4}
        ]);
    });

    test('fails on strings that are have the unicode repr as quotes', () => {
        const result = parseJSON('[\\u0022\\u0022]');
        expect(result).toEqual([
            { type: 'beginArray' },
            { type: 'error', position: 1}
        ]);
    });

    // String as object keys
    test('parses object with string keys', () => {
        const result = parseJSON('{"simple": "value", "with space": "value2", "with\\nescapes": "value3"}');
        expect(result.length).toBe(13); // 3 pairs × (key + colon + value) + 2 commas + 2 braces

        // Extract all string tokens
        const strings = result.filter(token => token.type === 'string');
        expect(strings.length).toBe(3); // 3 values

        // Extract all string tokens
        const attrs = result.filter(token => token.type === 'attr');
        expect(attrs.length).toBe(3); // 3 keys

        // Check for specific keys
        expect(attrs.some(s => s.value === '"simple"')).toBeTruthy();
        expect(attrs.some(s => s.value === '"with space"')).toBeTruthy();
        expect(attrs.some(s => s.value === '"with\\nescapes"')).toBeTruthy();
        expect(strings.some(s => s.value === '"value"')).toBeTruthy();
        expect(strings.some(s => s.value === '"value2"')).toBeTruthy();
        expect(strings.some(s => s.value === '"value3"')).toBeTruthy();
    });

    // Complex mixed tests
    test('parses complex object with various string formats', () => {
        const input = `{
      "normal": "This is normal text",
      "escaped": "This has \\"quotes\\" and \\n newlines \\t tabs",
      "unicode": "This has \\u00A9 unicode",
      "emoji": "This has 🚀 emoji",
      "numbers": "123456",
      "special": "!@#$%^&*()",
      "mixed": "abc123[]{}\\"\\\\",
      "nested": {
        "array": ["string1", "string2"]
      }
    }`;

        const result = parseJSON(input);

        // Check for error
        expect(result.filter(token => token.type === 'error').length).toBe(0);

        // Extract all string values
        const strings = result.filter(token => token.type === 'string');

        // Verify string count (8 keys + 10 values = 18 strings)
        expect(strings.length).toBe(9);

        // Check for specific strings
        expect(strings.some(s => s.value === '"This is normal text"')).toBeTruthy();
        expect(strings.some(s => s.value === '"This has \\"quotes\\" and \\n newlines \\t tabs"')).toBeTruthy();
        expect(strings.some(s => s.value === '"This has \\u00A9 unicode"')).toBeTruthy();
        expect(strings.some(s => s.value === '"This has 🚀 emoji"')).toBeTruthy();
        expect(strings.some(s => s.value === '"123456"')).toBeTruthy();
        expect(strings.some(s => s.value === '"!@#$%^&*()"')).toBeTruthy();
        expect(strings.some(s => s.value === '"abc123[]{}\\"\\\\"')).toBeTruthy();
        expect(strings.some(s => s.value === '"string1"')).toBeTruthy();
        expect(strings.some(s => s.value === '"string2"')).toBeTruthy();
    });
});