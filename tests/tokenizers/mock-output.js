class MockOutput {
    constructor() {
        this.token = [];
    }

    beginObject() {
        this.token.push({
            'type': 'beginObject'
        });
    }

    endObject() {
        this.token.push({
            'type': 'endObject'
        });
    }

    beginArray() {
        this.token.push({
            'type': 'beginArray'
        });
    }

    endArray() {
        this.token.push({
            'type': 'endArray'
        });

    }

    valueSeparator() {
        this.token.push({
            'type': 'valueSeparator'
        });
    }

    nameSeparator() {
        this.token.push({
            'type': 'nameSeparator'
        });
    }

    string(str) {
        this.token.push({
            'type': 'string',
            'value': str
        });

    }

    literal(str) {
        this.token.push({
            'type': 'literal',
            'value': str
        });

    }

    number(str) {
        this.token.push({
                        'type': 'number',
                        'value': str
                    });
    }

    attr(str) {
        this.token.push({
            'type': 'attr',
            'value': str
        });
    }

    addError(str, error, snippet) {
        console.log(error, snippet);
        this.token.push({
            'type': 'error',
            'position': str
        });
    }
}

export default MockOutput;