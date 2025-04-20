import FixedSizeQueue from "../datastructures/fixed-size-queue.js";

const MAX_ARRAY_TOKENS = 8;
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
        this.queue = new FixedSizeQueue(MAX_ARRAY_TOKENS + 2); // beginArray + max_tokens + 1 extra token
        this.indent_level = 0;
        this.open_arrays = 0;
        this.output = '';
    }

    beginArray() {
        // Add the square bracket to the queue
        this.queue.enqueue(new OpenBracket());
        this.open_arrays++;
        // Adding a new array may overextend the furthest array, check if it does
        this._check_queue();
        return this;
    }

    endArray() {
        // If there is one array open, it can be printed collapsed
        this.queue.enqueue(new CloseBracket());
        this._check_queue();

        if(this.open_arrays <= 1) {
            this._print_queue_collapsed();
        }

        // If there are more than one array, then it may be nested, and we cannot might not be able to print the outer array, do nothing

        // TODO If there is no array open, then, it has been printed already, print a new line and then print this symbol

        this.open_arrays--;
        return this;
    }

    comma() {
        this.queue.enqueue(new Comma());
        // Adding a new array may overextend the furthest array, check if it does
        this._check_queue(this.queue.getSize() === 1);
        return this;
    }

    // Represents all other tokens, for brevity
    token(str) {
        this.queue.enqueue(new JString(str));
        // Adding a new array may overextend the furthest array, check if it does
        this._check_queue(this.queue.getSize() === 1);
        return this;
    }

    _check_queue(force = false) {
        // TODO check also that the char length has not been exceeded
        if(force|| this.queue.getSize() >= MAX_ARRAY_TOKENS + 1) {
            if(this.queue.peek() instanceof OpenBracket) {
                let token = this.queue.dequeue();
                this._add_output(token.getValueExpanded());
                this.open_arrays--;
                this.indent_level++;
            }

            while(!this.queue.isEmpty() &&
            this.queue.peek() instanceof NonBracketToken) {
                let next_token = this.queue.dequeue();
                this._add_output(next_token.getValueExpanded(), next_token.indentable());
            }

            this._check_queue(); // May have been overextended on more than one level
        }
    }

    _print_queue_collapsed() {
        let open_arrays = 0;
        let text = '';
        //this._add_output(this.queue.toArray(););
        while(!this.queue.isEmpty()) {
            let token = this.queue.dequeue();
            if(token instanceof OpenBracket) {
                text += token.getValue();
                open_arrays++;
            } else if(token instanceof NonBracketToken) {
                text += token.getValue();
                /*if(this.queue.peek().type === 'token') {
                    text += ' ';
                }*/
            } else if(token instanceof CloseBracket) {
                if(open_arrays > 0) {
                    text += token.getValue();
                    open_arrays--;
                } else {

                    this.indent_level--;

                    text += '\n';
                    for(let i = 0; i < this.indent_level; i++) {
                        text += '\t';
                    }

                    text += token.getValue();

                }
            }
        }
        this._add_output(text);
    }

    _add_output(str, indentable=true) {
        if (indentable) {
            for (let i = 0; i < this.indent_level; i++) {
                this.output += '\t';
            }
        }
        this.output += str;
    }
}

export default Beautifier;