# UI is built from shadcn components, themed only through tokens

The UI redo (mockups in `docs/design/ui/`) uses the Claude Design "Organic" look. We get that look by re-theming shadcn's CSS variables in `globals.css` with the Organic values (colors, the accent ramps, fonts, radii, shadows) on the rounded `radix-maia` preset. We don't port the Organic `.btn` / `.tag` / `.seg` classes, and we don't fork shadcn component internals. Beyond the tokens, the only component changes allowed are `cva` variants on Badge (for the accent tags) and Button (for the pill shape).

There are only two custom compositions: the **Step trail** and the **Sentence block** (Sentence, kana reading and translation), because shadcn has no equivalent for either. Both are still put together from shadcn parts. Any other UI need is met with a shadcn component or plain markup. The old hand-rolled wrappers in `src/components/app/` get deleted as each surface is redone.

We chose this so that changing the look stays a token edit and new screens don't grow a parallel component library. We accepted that some mockup details get approximated by what shadcn can express. The rejected alternative was building on the Organic classes directly, which would have matched the mockups more exactly but left us maintaining two component systems.
