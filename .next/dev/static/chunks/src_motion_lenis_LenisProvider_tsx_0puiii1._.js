(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/motion/lenis/LenisProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LenisProvider",
    ()=>LenisProvider,
    "useLenis",
    ()=>useLenis
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lenis$40$1$2e$3$2e$26_react$40$19$2e$3$2e$0$2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lenis@1.3.26_react@19.3.0/node_modules/lenis/dist/lenis.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"]);
const LenisContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    lenis: null,
    stop: ()=>{},
    start: ()=>{}
});
const useLenis = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LenisContext);
};
_s(useLenis, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
const LenisProvider = ({ children })=>{
    _s1();
    const lenisRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LenisProvider.useEffect": ()=>{
            // Reset scroll to top on page load/refresh
            if ("TURBOPACK compile-time truthy", 1) {
                if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
            }
            const lenis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lenis$40$1$2e$3$2e$26_react$40$19$2e$3$2e$0$2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                duration: 1.2,
                easing: {
                    "LenisProvider.useEffect": (t)=>Math.min(1, 1.001 - 2 ** (-10 * t))
                }["LenisProvider.useEffect"],
                smoothWheel: true,
                touchMultiplier: 2
            });
            lenisRef.current = lenis;
            // Connect Lenis to GSAP ScrollTrigger
            lenis.on('scroll', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].update);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].ticker.add({
                "LenisProvider.useEffect": (time)=>{
                    lenis.raf(time * 1000);
                }
            }["LenisProvider.useEffect"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].ticker.lagSmoothing(0);
            return ({
                "LenisProvider.useEffect": ()=>{
                    lenis.destroy();
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].ticker.remove(lenis.raf);
                }
            })["LenisProvider.useEffect"];
        }
    }["LenisProvider.useEffect"], []);
    const stop = ()=>lenisRef.current?.stop();
    const start = ()=>lenisRef.current?.start();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LenisContext.Provider, {
        value: {
            lenis: lenisRef.current,
            stop,
            start
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/motion/lenis/LenisProvider.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(LenisProvider, "EGg8JqRqiLdZLNuaMV97MRehwwE=");
_c = LenisProvider;
var _c;
__turbopack_context__.k.register(_c, "LenisProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_motion_lenis_LenisProvider_tsx_0puiii1._.js.map