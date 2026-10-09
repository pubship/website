# Final logo rollout

Owner-supplied final assets, 9 October 2026. Tracking: [website #13](https://github.com/pubship/website/issues/13) and [repository #4](https://github.com/pubship/pubship/issues/4).

## Asset mapping

- `site/assets/mark.svg`: supplied transparent SVG, unchanged. Used by the homepage diagram and as the source for the shared lockup. Dark surfaces retain the existing monochrome inversion for contrast.
- `site/assets/logo.svg`: supplied white-background SVG, unchanged. Primary SVG favicon and Apple-icon rendering source.
- `site/assets/logo-1024.png`: supplied white-background PNG, unchanged. Ready for GitHub organization and directory-avatar uploads.
- `site/assets/logo-transparent.png`: supplied transparent PNG, unchanged.
- `site/assets/favicon-32.png` and `favicon-16.png`: supplied 32 px and 16 px PNGs, unchanged. The asset renderer must not overwrite them.
- `site/assets/apple-touch-icon.png`: 180 x 180 rendering of the white-background SVG, preserving the artwork's own padding.
- `site/assets/social.svg` and `social.png`: existing 1200 x 630 card with the final transparent mark. Its viewBox comes from the source so 512-unit artwork is not clipped by the former 32-unit viewport.

The header/footer use `lockup-mark.svg`, a presentation derivative with a tight `119 86 277 352` viewBox. Its paths, strokes and proportions are unchanged. Following owner visual review, CSS retains the symbol's previous visible size (20.625 px total height from the original 30 px square canvas) and vertically centers the wordmark beside it. The 8 px visible gap is retained. Removing the source canvas padding aligns the visible mark with nearby content. Footer navigation headings use the same 44 px row height as the brand link.

## Source provenance

- `pubship-logo.svg`: `42cb3931916f9ef4d03706af0ede81b053c7d89bc25b6e1658f0e77ca44f8269`
- `pubship-logo.png`: `028da696680bdcb41aa3c6a460857b089bfebdc87543d0336f79675acfbdac90`
- `pubship-logo-transparent.svg`: `b72a2427148b086c30a7c00993a016f826bb77c43b5cc596e2de09a4c62f38ab`
- `pubship-logo-transparent.png`: `5f32fdd840a558c92afe377bb9944c8bc0df5c4c7c1cc4c1c358aa556363bd22`
- `favicon.png`: `a1d7ca37b07bf2b69416a172805dbf8f9cb0f9a40c2cba0afafa3a087ce71393`
- `favicon-16.png`: `96ebd115e297dfa5b83899b567fd981b80c36c83bc18d254cd3a5971ee02ec17`

The original supplied files remain untouched outside the tracked asset paths. No provisional charcoal backing remains in the final repository artwork. No new external assets, scripts, tracking or CSP exceptions were added.

## Repository and directory synchronization

`pubship/pubship` branch `feat/final-branding` replaces the README/plugin asset, retains all six source files and updates the self-host page mark in source. The published Python package and historical release assets remain unchanged until a separate release.

The organization avatar requires a GitHub Settings upload. Computer-use permission was unavailable at the start of this task; do not call that upload complete until the new public avatar is verified. Glama, MCP.so, MCP Servers, SourceWeft, MCPLookup and Cursor Directory may cache or manage images independently. Record their actual image sources and update routes in the rollout issue; a source-file change alone is not proof of directory refresh.

## Verification

Run `npm run assets:social`, `npm run sync:chrome`, `npm run check` and `npm test`. Check light/dark lockups, no clipping, 16/32 px icons, 180 px Apple icon and 1200 x 630 social output. Preserve both supplied favicon hashes after rendering. Confirm the seven-page shared metadata, all viewport layouts and public served asset hashes after an owner-reviewed merge and deployment.
