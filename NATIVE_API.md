# Native Ghostty browser bridge

This branch adapts the native-C-API integration from
`diegosouzapw/ghostty-web` at `faf6fbd055f5768923b3df659f3968c2abbab4a1` to
`ghostty-org/ghostty` at `35a81a980bb9fce09a1ea762a68b55f8eb3477ed`.
The engine submodule pins a downstream build that enables freestanding Kitty
graphics and the native Wuffs PNG decoder.

Build the engine with Zig 0.16.0, then bundle the standard public entry point
with Bun (no package install required):

```sh
ZIG=/path/to/zig bash scripts/build-wasm.sh
bun build lib/index.ts --target=browser --format=esm --outdir=dist
cp ghostty-vt.wasm dist/
```

Serve `dist/index.js` and `dist/ghostty-vt.wasm` together. Call `await init()`
before opening a terminal, or `await init('/assets/custom.wasm')` to select a
different asset location. `Ghostty.load(path)` also accepts local paths and
file URLs in Node/Bun. Hosts can pass a `Ghostty` instance to a terminal for
independent engine ownership.

The bridge follows the current constructor, aligned allocator, and MODE API.
Terminal colors and protocol replies come from native state. An optional
`terminal.onLinkActivate = uri => { ... }` callback lets any embedding host
handle URL navigation; the default still opens a browser tab.

The canvas renderer supports direct Kitty RGB/RGBA/PNG images, chunking,
queries, replacement, deletion, scrolling, cropping, offsets, and z layers.
Cache keys include native image generations. Frames with images are repainted
before compositing to preserve transparency. File/shared-memory transports and
animation playback are not supported in this build.
