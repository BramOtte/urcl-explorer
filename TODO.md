# TODO
## URCL standart
* &values (aka imm macros) 
    * &BITS = bit count
    * &UHALF = upper half of bits (in 8 bits it would be 0b11110000)
    * &LHALF = lower half of bits (in 8 bits it would be 0b00001111)
    * &MSB = most significant bit (8 bits it would be 0b10000000)
    * &SMAX = max signed value (so 127 in 8 bits)
    * &SMSB = the second to highest bit (so 0b01000000 in 8 bits)
* multiline commments
* marcos
* DW


## Misc
* Fix freezing when there is a lot of IO
* add fixed clock speed
* check if all array access is bounds checked
* exclude general purpose registers from MINREG
* v-sync
* fix view of memory and registers in html
* add line numbers to source code
* visualize PC in source code
* sound device
* string litterals
* document emulator
* add something for automated testing either a port or an instruction
* Option to list examples

## Low Priority
* syntax highlighting
* hot code reloading
* save and load code from file
* save and load code from localstorage
* 3d device
* integrate existing tools into urcl explorer with python runtime
* compile URCL code to js for greater speed
* compile URCL code to wasm for maximum speed
* add new cool things to this TODO list
* support URCL binary format

# DONE
* Refactor out parser code from emulator
* put stack into memory
* Headers and multiple word lengths 8-32
* Display with Buffer
