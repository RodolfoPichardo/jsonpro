const MAX_ARRAY_LENGTH = 32;

class Token {
    constructor() {

    }

    getValue() {
        throw new Error('Get value was not implemented');
    }

    getValueExpanded() {
        return this.getValue();
    }

    indentable() {
        return true;
    }
}

class OpenBracket extends Token {
    constructor() {
        super();
    }

    getValue() {
        return '[';
    }

    getValueExpanded() {
        return '[\n';
    }
}


class CloseBracket extends Token {
    constructor() {
        super();
    }

    getValue() {
        return ']';
    }

    getValueExpanded() {
        return '\n]';
    }
}


class NonBracketToken extends Token {}

class Comma extends NonBracketToken {
    constructor() {
        super();
    }

    getValue() {
        return ', ';
    }

    getValueExpanded() {
        return ',\n';
    }

    indentable() {
        return false;
    }
}



class Value extends NonBracketToken {
    constructor(str) {
        super();
        this.str = str;
    }

    getValue() {
        return this.str;
    }
}

class JString extends Value {

}

class Number extends Value {

}

class Literal extends Token {

}




class Beautifier {
    constructor() {
        this.queue = [];
        this.indent_level = 0;
        this.open_arrays = 0;
        this.output = '';
    }

    beginArray() {
        this.queue.push(new OpenBracket());
        this.open_arrays++;
        this._check_queue();
        return this;
    }

    endArray() {
        this.queue.push(new CloseBracket());
        this._check_queue();

        if (this.open_arrays <= 1) {
            this._print_queue_collapsed();
        }

        this.open_arrays--;
        return this;
    }

    comma() {
        this.queue.push(new Comma());
        this._check_queue(this.queue.length === 1);
        return this;
    }

    token(str) {
        this.queue.push(new JString(str));
        this._check_queue(this.queue.length === 1);
        return this;
    }

    _collapsedLength() {
        return this.queue.reduce((len, token) => len + token.getValue().length, 0);
    }

    _check_queue(force = false) {
        if (force || this._collapsedLength() > MAX_ARRAY_LENGTH) {
            if (this.queue.length > 0 && this.queue[0] instanceof OpenBracket) {
                let token = this.queue.shift();
                this._add_output(token.getValueExpanded());
                this.open_arrays--;
                this.indent_level++;
            }

            while (this.queue.length > 0 && this.queue[0] instanceof NonBracketToken) {
                let next_token = this.queue.shift();
                this._add_output(next_token.getValueExpanded(), next_token.indentable());
            }

            this._check_queue();
        }
    }

    _print_queue_collapsed() {
        let open_arrays = 0;
        let text = '';
        while (this.queue.length > 0) {
            let token = this.queue.shift();
            if (token instanceof OpenBracket) {
                text += token.getValue();
                open_arrays++;
            } else if (token instanceof NonBracketToken) {
                text += token.getValue();
            } else if (token instanceof CloseBracket) {
                if (open_arrays > 0) {
                    text += token.getValue();
                    open_arrays--;
                } else {
                    this.indent_level--;
                    text += '\n';
                    for (let i = 0; i < this.indent_level; i++) {
                        text += '\t';
                    }
                    text += token.getValue();
                }
            }
        }
        this._add_output(text);
    }

    _add_output(str, indentable = true) {
        if (indentable) {
            for (let i = 0; i < this.indent_level; i++) {
                this.output += '\t';
            }
        }
        this.output += str;
    }
}

export default Beautifier;