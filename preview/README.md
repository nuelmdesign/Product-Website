# Standalone preview

`index.html` is a single-file, dependency-light preview of the homepage,
published at:

<https://claude.ai/code/artifact/0e71a5ae-d04e-4495-9961-d806679d7fd4>

It exists so the design and motion can be reviewed without running the Next
app. It mirrors the same tokens, the same W.01 shader, and the same six
motion primitives, but it is **not** the product — the app in `src/` is.
When the two diverge, `src/` wins.

Libraries load from CDN here (GSAP + ScrollTrigger from cdnjs, Lenis from
jsDelivr) rather than npm, because the page has to run standalone.
