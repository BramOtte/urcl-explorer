export class Clock {
    wait_end = 0
    time_out?: any;
    wait_out(time: number){
        this.wait_end = Date.now() + time;
    }
    wait_in(callback: (value: number)=>void) {
        this.time_out = setTimeout(()=>callback(1), this.wait_end - Date.now());
    }
    reset(){
        this.wait_end = 0;
        if (this.time_out !== undefined){
            clearTimeout(this.time_out);
        }
    }
}
