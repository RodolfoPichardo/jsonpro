import FixedSizeQueue from "./fixed-size-queue";

class RenderBuffer {
    constructor() {
        this.queue = new FixedSizeQueue(8);
    }
}