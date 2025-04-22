import FixedSizeQueue from "./fixed-size-queue";

class JSONRenderBuffer {
    constructor() {
        this.queue = new FixedSizeQueue(8);
    }
}