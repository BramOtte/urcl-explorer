import { Device, Device_Host } from "./devices/device";

export abstract class Base_Emu implements Device_Host {
    add_io_device(device: Device): void {
        throw new Error("Method not implemented.");
    }
    
}