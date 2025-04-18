import JSONTokenizer from '../tokenizers/json-tokenizer.js';
import Buffer from "../datastructures/buffer.js";

self.onmessage = (e) => {
    const text = e.data;
    const buffer = new Buffer();
    const parser = new JSONTokenizer(text, buffer);
    try {
        parser.run();
        buffer.sendBuffer();
    } catch (error) {
        console.error(error);
        buffer.sendBuffer();
    }
};
