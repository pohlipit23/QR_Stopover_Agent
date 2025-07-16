globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as renderers } from './chunks/_@astro-renderers_BLpMnkWN.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BO6ucBAR.mjs';
import { manifest } from './manifest_DNEowwKV.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/chat-test.astro.mjs');
const _page2 = () => import('./pages/design-system.astro.mjs');
const _page3 = () => import('./pages/email-template.astro.mjs');
const _page4 = () => import('./pages/mmb.astro.mjs');
const _page5 = () => import('./pages/mmb-test.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/chat-test.astro", _page1],
    ["src/pages/design-system.astro", _page2],
    ["src/pages/email-template.astro", _page3],
    ["src/pages/mmb.astro", _page4],
    ["src/pages/mmb-test.astro", _page5],
    ["src/pages/index.astro", _page6]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
