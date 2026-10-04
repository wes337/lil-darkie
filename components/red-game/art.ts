// Art ships in two sizes: `name.webp` for desktop and `name-mobile.webp` (long edge 800px) for
// screens up to 700px wide, the game's mobile breakpoint. Spread the result onto an <img>.
//
// The srcSet/sizes values are chosen so the browser picks by viewport width, not pixel density:
// on mobile the tiny `sizes` makes the mobile file dense enough for any screen, so the smaller
// candidate wins; on desktop the huge `sizes` leaves only the full file acceptable. Every image
// using this has explicit CSS width and height, so the odd `sizes` never affects layout.
export function artSources(src: string) {
  return {
    src,
    srcSet: `${src.replace(/\.webp$/, "-mobile.webp")} 800w, ${src} 4000w`,
    sizes: "(max-width: 700px) 200px, 4000px",
  };
}
