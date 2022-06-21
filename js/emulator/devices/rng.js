import { IO_Port } from "../instructions.js";
export class RNG {
    constructor(bits = 8) {
        this.bits = bits;
        this.inputs = {
            [IO_Port.RNG]: () => 0 | Math.random() * (4294967295 >>> (32 - this.bits))
        };
    }
}
//# sourceMappingURL=rng.js.map