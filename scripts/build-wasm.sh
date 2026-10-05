#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ZIG="${ZIG:-zig}"
[[ "$("$ZIG" version)" == "0.16.0" ]] || { echo 'Zig 0.16.0 is required' >&2; exit 1; }
git submodule update --init ghostty
(cd ghostty && "$ZIG" build -Demit-lib-vt -Dtarget=wasm32-freestanding -Doptimize=ReleaseSmall)
cp ghostty/zig-out/bin/ghostty-vt.wasm ghostty-vt.wasm
