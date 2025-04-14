class Buffer{
    constructor() {
        this.success = true;
        this.error = null;
        this.indent_level = 0;
        this.line_number = 0;
        this.position = 0;
        this.basic_size = 0;
        this.emptyResponse();
        this.last_modified = {
            punctuation: -1,
            attr: -1,
            string: -1,
            number: -1,
            literal: -1
        }
    }

    beginObject() {
        this.addNewLine('{', 'punctuation', true);
    }

    endObject() {
        this.addNewLineBefore('}', 'punctuation');
    }

    beginArray() {
        this.add('[', 'punctuation');
    }

    endArray() {
        this.add(']', 'punctuation');
    }

    valueSeparator() {
        this.addNewLine(',', 'punctuation');
    }

    nameSeparator() {
        this.add(': ', 'punctuation');
    }

    string(str) {
        this.add(str, 'string');
    }

    literal(str) {
        this.add(str, 'literal');
    }

    number(str) {
        this.add(str, 'number');
    }

    attr(str) {
        this.add(str, 'attr');
    }

    add(text, target) {
        if (this.last_modified[target] !== this.line_number) {
            this.response[target] += '\t'.repeat(this.indent_level) + ' '.repeat(this.position);
            this.last_modified[target] = this.line_number;
        }
        if (this.last_modified.code !== this.line_number) { // New line detected
            this.response.code += '\t'.repeat(this.indent_level);
            this.last_modified.code = this.line_number;
        }
        if (target !== 'punctuation' && this.last_modified.punctuation === this.line_number) {
            this.response.punctuation += ' '.repeat(text.length);
        }

        this.response[target] += text;
        this.response.code += text;
        this.position += text.length;
        this.basic_size += text.length;
    }

    addNewLine(text, target, indent = false) {
        this.add(text, target);
        if (indent) this.indent_level++;
        this._addNewLine();
    }

    addNewLineBefore(text, target) {
        this.indent_level--;
        this._addNewLine();
        this.add(text, target);
    }

    _addNewLine() {
        this.line_number++;
        for (const prop in this.response) {
            this.response[prop] += '\n';
        }
        this.position = 0;
    }

    flush() {
        this.sendBuffer();
        this.emptyResponse();
        this.basic_size = 0;
    }

    isFull() {
        return this.basic_size > 4096;
    }

    addError(position, expecting, actual) {
        this.success = false;
        this.error = {
            position: this.position + this.indent_level * 4,
            expected: expecting,
            actual: actual.replaceAll('\n', '')
        }

        throw Error(`Error parsing JSON at position ${position}, expecting: "${expecting}", actual: "${actual}"`)
    }

    sendBuffer() {
        postMessage({
            success: this.success,
            lines: this.line_number + 1,
            data: this.response,
            error: this.error
        });
    }

    emptyResponse() {
        this.response = {
            punctuation: '',
            attr: '',
            string: '',
            number: '',
            literal: '',
            code: '',
        };
    }

}

export default Buffer;