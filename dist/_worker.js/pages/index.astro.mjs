globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, a as createAstro, b as addAttribute, r as renderHead, d as renderTemplate } from '../chunks/astro/server_HuJYnJaO.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Qatar Airways Stopover AI Agent</title>${renderHead()}</head> <body data-astro-cid-j7pv25f6> <div class="container-qa min-h-screen flex items-center justify-center" data-astro-cid-j7pv25f6> <div class="text-center" data-astro-cid-j7pv25f6> <h1 class="mb-6" data-astro-cid-j7pv25f6>Qatar Airways Stopover AI Agent</h1> <p class="text-lg mb-8" data-astro-cid-j7pv25f6>Project structure successfully set up with Cloudflare Pages architecture</p> <div class="space-y-4" data-astro-cid-j7pv25f6> <button class="btn-primary mr-4" data-astro-cid-j7pv25f6>Primary Button</button> <button class="btn-secondary mr-4" data-astro-cid-j7pv25f6>Secondary Button</button> <button class="btn-ghost" data-astro-cid-j7pv25f6>Ghost Button</button> </div> <div class="card mt-8 max-w-md mx-auto" data-astro-cid-j7pv25f6> <h3 class="mb-4" data-astro-cid-j7pv25f6>Setup Complete</h3> <ul class="text-left space-y-2" data-astro-cid-j7pv25f6> <li data-astro-cid-j7pv25f6>✅ Astro with React integration</li> <li data-astro-cid-j7pv25f6>✅ TypeScript configuration</li> <li data-astro-cid-j7pv25f6>✅ Cloudflare Pages adapter</li> <li data-astro-cid-j7pv25f6>✅ Tailwind CSS with Qatar Airways design tokens</li> <li data-astro-cid-j7pv25f6>✅ Directory structure created</li> <li data-astro-cid-j7pv25f6>✅ Design system integration</li> </ul> </div> </div> </div> </body></html>`;
}, "C:/Users/Pete/Sites/Stopover Agent/src/pages/index.astro", void 0);

const $$file = "C:/Users/Pete/Sites/Stopover Agent/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
