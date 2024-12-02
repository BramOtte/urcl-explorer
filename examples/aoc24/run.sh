set -e

urcx-emu ${0%/*}/1.urcl --text-file ${0%/*}/1-e.txt --wasm
urcx-emu ${0%/*}/1.urcl --text-file ${0%/*}/1-i.txt --wasm

urcx-emu ${0%/*}/2.urcl --text-file ${0%/*}/2-e.txt --wasm
urcx-emu ${0%/*}/2.urcl --text-file ${0%/*}/2-i.txt --wasm