set -e

urcx-emu ${0%/*}/1.urcl --text-file ${0%/*}/1-e.txt --wasm
urcx-emu ${0%/*}/1.urcl --text-file ${0%/*}/1-i.txt --wasm