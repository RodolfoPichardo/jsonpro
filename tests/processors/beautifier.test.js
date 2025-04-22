import Beautifier from '../../src/processors/beautifier.js';

describe('Beautifier', () => {
    let buffer;

    beforeEach(() => {
        buffer = new Beautifier();
    });

    describe('empty arrays', () => {
        test('creates an empty array', () => {
            buffer.beginArray().endArray();
            expect(buffer.output).toBe('[]');
        });

        test('creates multiple consecutive empty arrays', () => {
            buffer.beginArray().endArray().beginArray().endArray();
            expect(buffer.output).toBe('[][]');
        });
    });

    describe('simple arrays with strings', () => {
        test('creates a single-element array', () => {
            buffer.beginArray().token('"hello"').endArray();
            expect(buffer.output).toBe('["hello"]');
        });

        test('creates a multi-element array', () => {
            buffer.beginArray()
                .token('"hello"')
                .comma()
                .token('"world"')
                .endArray();
            expect(buffer.output).toBe('["hello", "world"]');
        });

        test('creates an array with multiple elements that stays collapsed', () => {
            buffer.beginArray()
                .token('"one"')
                .comma()
                .token('"two"')
                .comma()
                .token('"three"')
                .endArray();
            expect(buffer.output).toBe('["one", "two", "three"]');
        });
    });

    describe('nested arrays', () => {
        test('creates nested arrays that stay collapsed', () => {
            buffer.beginArray()
                .beginArray()
                .token('"inner"')
                .endArray()
                .endArray();
            expect(buffer.output).toBe('[["inner"]]');
        });

        test.only('creates nested arrays with multiple elements', () => {
            buffer.beginArray()
                .beginArray()
                .token('"a"')
                .comma()
                .token('"b"')
                .endArray()
                .comma()
                .beginArray()
                .token('"c"')
                .comma()
                .token('"d"')
                .endArray()
                .endArray();
            expect(buffer.output).toBe('[["a", "b"], ["c", "d"]]');
        });
    });

    describe('array expansion', () => {
        test('expands array when it exceeds MAX_ARRAY_TOKENS', () => {
            buffer.beginArray();
            for (let i = 0; i < 8; i++) {
                if (i > 0) buffer.comma();
                buffer.token(`"item${i}"`);
            }
            // Exceeding the limit should cause expansion
            buffer.comma().token('"overflow"');

            // The array should be formatted with newlines and indentation
            expect(buffer.output).toMatch(/\[\n\t"item0"/);
            expect(buffer.output).toMatch(/,\n\t"item1"/);
            expect(buffer.output).toMatch(/,\n\t"overflow"/);
        });

        test('handles nested arrays that cause expansion', () => {
            buffer.beginArray()
                .beginArray();

            // Fill the inner array to the point of expansion
            for (let i = 0; i < 9; i++) {
                if (i > 0) buffer.comma();
                buffer.token(`"nested${i}"`);
            }
            buffer.endArray().endArray();

            // Check that the output is expanded with proper indentation
            expect(buffer.output).toMatch(/\[\n\s*\[/);
            expect(buffer.output).toMatch(/\n\t\t"nested0"/);
        });
    });

    describe('mixed collapsed and expanded arrays', () => {
        test('creates a mix of collapsed inner arrays within an expanded outer array', () => {
            buffer.beginArray();

            // Add multiple short inner arrays
            for (let i = 0; i < 9; i++) {
                if (i > 0) buffer.comma();
                buffer.beginArray()
                    .token(`"short${i}"`)
                    .endArray();
            }
            buffer.endArray();

            // The outer array should be expanded but inner arrays should stay collapsed
            expect(buffer.output).toMatch(/\[\n\t\["short0"\]/);
            expect(buffer.output).toMatch(/,\n\t\["short1"\]/);
            expect(buffer.output).toMatch(/\n\]/);
        });
    });

    describe('complex structures', () => {
        test('handles deeply nested arrays with mixed expansion', () => {
            buffer.beginArray()  // Outer array
                .beginArray()  // First inner array
                .beginArray()  // Deeply nested array
                .token('"deep"');

            // Fill to cause expansion
            for (let i = 1; i < 9; i++) {
                buffer.comma().token(`"deep${i}"`);
            }

            buffer.endArray()
                .endArray()
                .comma()
                .beginArray()  // Second inner array
                .token('"simple"')
                .endArray()
                .endArray();

            // Check proper nesting and indentation
            expect(buffer.output).toMatch(/\[\n\t\[\n\t\t\[/);
            expect(buffer.output).toMatch(/\n\t\t\t"deep"/);
            expect(buffer.output).toMatch(/\["simple"\]/);
        });
    });

    describe('edge cases', () => {
        test('handles arrays with only commas', () => {
            buffer.beginArray().comma().endArray();
            expect(buffer.output).toBe('[, ]');
        });

        test('handles empty strings as array elements', () => {
            buffer.beginArray()
                .token('""')
                .comma()
                .token('""')
                .endArray();
            expect(buffer.output).toBe('["", ""]');
        });

        test('handles commas without preceding or following elements', () => {
            buffer.beginArray()
                .comma()
                .comma()
                .token('"only_value"')
                .comma()
                .comma()
                .endArray();
            expect(buffer.output).toBe('[, , "only_value", , ]');
        });

        test('handles immediate expansion due to force parameter', () => {
            buffer.beginArray()
                .token('"forced"')
                .comma();  // This forces expansion immediately

            expect(buffer.output).toMatch(/\[\n\t"forced",\n/);
        });
    });

    describe('queue behavior', () => {
        test('checks queue size limits', () => {
            const maxTokens = 8;

            buffer.beginArray();
            for (let i = 0; i < maxTokens; i++) {
                if (i > 0) buffer.comma();
                buffer.token(`"item${i}"`);
            }

            // Should still be collapsed
            expect(buffer.output).toBe('');

            // Adding one more should trigger expansion
            buffer.comma().token('"overflow"');
            expect(buffer.output).not.toBe('');
        });
    });
});