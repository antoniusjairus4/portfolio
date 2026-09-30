module.exports = [
"[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.29.7_supports-color@8.1.1__react@19.3.0/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.r("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)");
var React = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {
        'default': e
    };
}
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/ function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var isProd = typeof process !== "undefined" && process.env && ("TURBOPACK compile-time value", "development") === "production";
var isString = function(o) {
    return Object.prototype.toString.call(o) === "[object String]";
};
var StyleSheet = /*#__PURE__*/ function() {
    function StyleSheet(param) {
        var ref = param === void 0 ? {} : param, _name = ref.name, name = _name === void 0 ? "stylesheet" : _name, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? isProd : _optimizeForSpeed;
        invariant$1(isString(name), "`name` must be a string");
        this._name = name;
        this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
        invariant$1(typeof optimizeForSpeed === "boolean", "`optimizeForSpeed` must be a boolean");
        this._optimizeForSpeed = optimizeForSpeed;
        this._serverSheet = undefined;
        this._tags = [];
        this._injected = false;
        this._rulesCount = 0;
        var node = ("TURBOPACK compile-time value", "undefined") !== "undefined" && document.querySelector('meta[property="csp-nonce"]');
        this._nonce = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    }
    var _proto = StyleSheet.prototype;
    _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
        invariant$1(typeof bool === "boolean", "`setOptimizeForSpeed` accepts a boolean");
        invariant$1(this._rulesCount === 0, "optimizeForSpeed cannot be when rules have already been inserted");
        this.flush();
        this._optimizeForSpeed = bool;
        this.inject();
    };
    _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
        return this._optimizeForSpeed;
    };
    _proto.inject = function inject() {
        var _this = this;
        invariant$1(!this._injected, "sheet already injected");
        this._injected = true;
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && this._optimizeForSpeed) //TURBOPACK unreachable
        ;
        this._serverSheet = {
            cssRules: [],
            insertRule: function(rule, index) {
                if (typeof index === "number") {
                    _this._serverSheet.cssRules[index] = {
                        cssText: rule
                    };
                } else {
                    _this._serverSheet.cssRules.push({
                        cssText: rule
                    });
                }
                return index;
            },
            deleteRule: function(index) {
                _this._serverSheet.cssRules[index] = null;
            }
        };
    };
    _proto.getSheetForTag = function getSheetForTag(tag) {
        if (tag.sheet) {
            return tag.sheet;
        }
        // this weirdness brought to you by firefox
        for(var i = 0; i < document.styleSheets.length; i++){
            if (document.styleSheets[i].ownerNode === tag) {
                return document.styleSheets[i];
            }
        }
    };
    _proto.getSheet = function getSheet() {
        return this.getSheetForTag(this._tags[this._tags.length - 1]);
    };
    _proto.insertRule = function insertRule(rule, index) {
        invariant$1(isString(rule), "`insertRule` accepts only strings");
        if ("TURBOPACK compile-time truthy", 1) {
            if (typeof index !== "number") {
                index = this._serverSheet.cssRules.length;
            }
            this._serverSheet.insertRule(rule, index);
            return this._rulesCount++;
        }
        //TURBOPACK unreachable
        ;
        var sheet;
        var insertionPoint;
    };
    _proto.replaceRule = function replaceRule(index, rule) {
        if (this._optimizeForSpeed || ("TURBOPACK compile-time value", "undefined") === "undefined") {
            var sheet = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : this._serverSheet;
            if (!rule.trim()) {
                rule = this._deletedRulePlaceholder;
            }
            if (!sheet.cssRules[index]) {
                // @TBD Should we throw an error?
                return index;
            }
            sheet.deleteRule(index);
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                // In order to preserve the indices we insert a deleteRulePlaceholder
                sheet.insertRule(this._deletedRulePlaceholder, index);
            }
        } else //TURBOPACK unreachable
        {
            var tag;
        }
        return index;
    };
    _proto.deleteRule = function deleteRule(index) {
        if ("TURBOPACK compile-time truthy", 1) {
            this._serverSheet.deleteRule(index);
            return;
        }
        //TURBOPACK unreachable
        ;
        var tag;
    };
    _proto.flush = function flush() {
        this._injected = false;
        this._rulesCount = 0;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            // simpler on server
            this._serverSheet.cssRules = [];
        }
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        if ("TURBOPACK compile-time truthy", 1) {
            return this._serverSheet.cssRules;
        }
        //TURBOPACK unreachable
        ;
    };
    _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
        if (cssString) {
            invariant$1(isString(cssString), "makeStyleTag accepts only strings as second parameter");
        }
        var tag = document.createElement("style");
        if (this._nonce) tag.setAttribute("nonce", this._nonce);
        tag.type = "text/css";
        tag.setAttribute("data-" + name, "");
        if (cssString) {
            tag.appendChild(document.createTextNode(cssString));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        if (relativeToTag) {
            head.insertBefore(tag, relativeToTag);
        } else {
            head.appendChild(tag);
        }
        return tag;
    };
    _createClass(StyleSheet, [
        {
            key: "length",
            get: function get() {
                return this._rulesCount;
            }
        }
    ]);
    return StyleSheet;
}();
function invariant$1(condition, message) {
    if (!condition) {
        throw new Error("StyleSheet: " + message + ".");
    }
}
function hash(str) {
    var _$hash = 5381, i = str.length;
    while(i){
        _$hash = _$hash * 33 ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */ return _$hash >>> 0;
}
var stringHash = hash;
var sanitize = function(rule) {
    return rule.replace(/\/style/gi, "\\/style");
};
var cache = {};
/**
 * computeId
 *
 * Compute and memoize a jsx id from a basedId and optionally props.
 */ function computeId(baseId, props) {
    if (!props) {
        return "jsx-" + baseId;
    }
    var propsToString = String(props);
    var key = baseId + propsToString;
    if (!cache[key]) {
        cache[key] = "jsx-" + stringHash(baseId + "-" + propsToString);
    }
    return cache[key];
}
/**
 * computeSelector
 *
 * Compute and memoize dynamic selectors.
 */ function computeSelector(id, css) {
    var selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    // Sanitize SSR-ed CSS.
    // Client side code doesn't need to be sanitized since we use
    // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
    if ("TURBOPACK compile-time truthy", 1) {
        css = sanitize(css);
    }
    var idcss = id + css;
    if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
    }
    return cache[idcss];
}
function mapRulesToStyle(cssRules, options) {
    if (options === void 0) options = {};
    return cssRules.map(function(args) {
        var id = args[0];
        var css = args[1];
        return /*#__PURE__*/ React__default["default"].createElement("style", {
            id: "__" + id,
            // Avoid warnings upon render with a key
            key: "__" + id,
            nonce: options.nonce ? options.nonce : undefined,
            dangerouslySetInnerHTML: {
                __html: css
            }
        });
    });
}
var StyleSheetRegistry = /*#__PURE__*/ function() {
    function StyleSheetRegistry(param) {
        var ref = param === void 0 ? {} : param, _styleSheet = ref.styleSheet, styleSheet = _styleSheet === void 0 ? null : _styleSheet, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? false : _optimizeForSpeed;
        this._sheet = styleSheet || new StyleSheet({
            name: "styled-jsx",
            optimizeForSpeed: optimizeForSpeed
        });
        this._sheet.inject();
        if (styleSheet && typeof optimizeForSpeed === "boolean") {
            this._sheet.setOptimizeForSpeed(optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    }
    var _proto = StyleSheetRegistry.prototype;
    _proto.add = function add(props) {
        var _this = this;
        if (undefined === this._optimizeForSpeed) {
            this._optimizeForSpeed = Array.isArray(props.children);
            this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && !this._fromServer) //TURBOPACK unreachable
        ;
        var ref = this.getIdAndRules(props), styleId = ref.styleId, rules = ref.rules;
        // Deduping: just increase the instances count.
        if (styleId in this._instancesCounts) {
            this._instancesCounts[styleId] += 1;
            return;
        }
        var indices = rules.map(function(rule) {
            return _this._sheet.insertRule(rule);
        }) // Filter out invalid rules
        .filter(function(index) {
            return index !== -1;
        });
        this._indices[styleId] = indices;
        this._instancesCounts[styleId] = 1;
    };
    _proto.remove = function remove(props) {
        var _this = this;
        var styleId = this.getIdAndRules(props).styleId;
        invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
        this._instancesCounts[styleId] -= 1;
        if (this._instancesCounts[styleId] < 1) {
            var tagFromServer = this._fromServer && this._fromServer[styleId];
            if (tagFromServer) {
                tagFromServer.parentNode.removeChild(tagFromServer);
                delete this._fromServer[styleId];
            } else {
                this._indices[styleId].forEach(function(index) {
                    return _this._sheet.deleteRule(index);
                });
                delete this._indices[styleId];
            }
            delete this._instancesCounts[styleId];
        }
    };
    _proto.update = function update(props, nextProps) {
        this.add(nextProps);
        this.remove(props);
    };
    _proto.flush = function flush() {
        this._sheet.flush();
        this._sheet.inject();
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function(styleId) {
            return [
                styleId,
                _this._fromServer[styleId]
            ];
        }) : [];
        var cssRules = this._sheet.cssRules();
        return fromServer.concat(Object.keys(this._indices).map(function(styleId) {
            return [
                styleId,
                _this._indices[styleId].map(function(index) {
                    return cssRules[index].cssText;
                }).join(_this._optimizeForSpeed ? "" : "\n")
            ];
        }) // filter out empty rules
        .filter(function(rule) {
            return Boolean(rule[1]);
        }));
    };
    _proto.styles = function styles(options) {
        return mapRulesToStyle(this.cssRules(), options);
    };
    _proto.getIdAndRules = function getIdAndRules(props) {
        var css = props.children, dynamic = props.dynamic, id = props.id;
        if (dynamic) {
            var styleId = computeId(id, dynamic);
            return {
                styleId: styleId,
                rules: Array.isArray(css) ? css.map(function(rule) {
                    return computeSelector(styleId, rule);
                }) : [
                    computeSelector(styleId, css)
                ]
            };
        }
        return {
            styleId: computeId(id),
            rules: Array.isArray(css) ? css : [
                css
            ]
        };
    };
    /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */ _proto.selectFromServer = function selectFromServer() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
        return elements.reduce(function(acc, element) {
            var id = element.id.slice(2);
            acc[id] = element;
            return acc;
        }, {});
    };
    return StyleSheetRegistry;
}();
function invariant(condition, message) {
    if (!condition) {
        throw new Error("StyleSheetRegistry: " + message + ".");
    }
}
var StyleSheetContext = /*#__PURE__*/ React.createContext(null);
StyleSheetContext.displayName = "StyleSheetContext";
function createStyleRegistry() {
    return new StyleSheetRegistry();
}
function StyleRegistry(param) {
    var configuredRegistry = param.registry, children = param.children;
    var rootRegistry = React.useContext(StyleSheetContext);
    var ref = React.useState(function() {
        return rootRegistry || configuredRegistry || createStyleRegistry();
    }), registry = ref[0];
    return /*#__PURE__*/ React__default["default"].createElement(StyleSheetContext.Provider, {
        value: registry
    }, children);
}
function useStyleRegistry() {
    return React.useContext(StyleSheetContext);
}
// Opt-into the new `useInsertionEffect` API in React 18, fallback to `useLayoutEffect`.
// https://github.com/reactwg/react-18/discussions/110
var useInsertionEffect = React__default["default"].useInsertionEffect || React__default["default"].useLayoutEffect;
var defaultRegistry = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined;
function JSXStyle(props) {
    var registry = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : useStyleRegistry();
    // If `registry` does not exist, we do nothing here.
    if (!registry) {
        return null;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        registry.add(props);
        return null;
    }
    //TURBOPACK unreachable
    ;
}
JSXStyle.dynamic = function(info) {
    return info.map(function(tagInfo) {
        var baseId = tagInfo[0];
        var props = tagInfo[1];
        return computeId(baseId, props);
    }).join(" ");
};
exports.StyleRegistry = StyleRegistry;
exports.createStyleRegistry = createStyleRegistry;
exports.style = JSXStyle;
exports.useStyleRegistry = useStyleRegistry;
}),
"[project]/node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.29.7_supports-color@8.1.1__react@19.3.0/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.29.7_supports-color@8.1.1__react@19.3.0/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)").style;
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$PhotoCoverSplit$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/PhotoCoverSplit.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$preloader$2f$Preloader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/preloader/Preloader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$motion$2f$lenis$2f$LenisProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/motion/lenis/LenisProvider.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function Home() {
    const { stop, start } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$motion$2f$lenis$2f$LenisProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLenis"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "relative w-full bg-[#0C0907]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$preloader$2f$Preloader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Preloader"], {
                onComplete: ()=>start()
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$PhotoCoverSplit$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PhotoCoverSplit"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "page-1-placeholder",
                className: "w-full min-h-screen bg-[#0C0907] flex items-center justify-center p-8 select-none",
                "aria-hidden": "true",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-4xl h-96 rounded-2xl border border-[#E0A93B]/10 bg-[#17110C]/50 backdrop-blur-sm flex items-center justify-center shadow-2xl",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-32 h-1 bg-gradient-to-r from-transparent via-[#E0A93B]/30 to-transparent animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/layout/PhotoCoverSplit.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PhotoCoverSplit",
    ()=>PhotoCoverSplit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/ScrollTrigger.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollTrigger"]);
const PhotoCoverSplit = ()=>{
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const leftHalfRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rightHalfRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const placeholderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isReducedMotion, setIsReducedMotion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setIsReducedMotion(mediaQuery.matches);
        } catch  {
        // Fallback
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!containerRef.current || isReducedMotion) return;
        const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].context(()=>{
            const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=100%',
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1
                }
            });
            // Split reveal animation: Left half moves left, right half moves right
            tl.to(leftHalfRef.current, {
                xPercent: -100,
                ease: 'power2.inOut'
            }, 0).to(rightHalfRef.current, {
                xPercent: 100,
                ease: 'power2.inOut'
            }, 0).fromTo(placeholderRef.current, {
                scale: 0.94,
                opacity: 0.8
            }, {
                scale: 1,
                opacity: 1,
                ease: 'power2.out'
            }, 0);
        }, containerRef);
        return ()=>ctx.revert();
    }, [
        isReducedMotion
    ]);
    // Keyboard navigation to trigger split reveal
    const handleKeyDown = (e)=>{
        if ([
            'Enter',
            ' ',
            'ArrowDown'
        ].includes(e.key)) {
            e.preventDefault();
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: containerRef,
        tabIndex: 0,
        onKeyDown: handleKeyDown,
        className: "relative w-full h-[100svh] overflow-hidden bg-[#0C0907] outline-none select-none",
        "aria-label": "Full-screen photo cover. Use arrow down, space, or scroll to open portfolio.",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: placeholderRef,
                className: "absolute inset-0 w-full h-full bg-[#0C0907] flex items-center justify-center z-0",
                style: {
                    background: 'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.12) 0%, rgba(12, 9, 7, 1) 70%)'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: leftHalfRef,
                className: "absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none",
                style: {
                    clipPath: 'inset(0 50% 0 0)',
                    willChange: 'transform'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("picture", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                            srcSet: "/images/cover-1536.avif 1536w, /images/cover-1280.avif 1280w",
                            type: "image/avif"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                            srcSet: "/images/cover-1536.webp 1536w, /images/cover-1280.webp 1280w",
                            type: "image/webp"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/images/cover-1536.jpeg",
                            alt: "Jairus Portfolio Cover",
                            className: "w-full h-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]",
                            loading: "eager",
                            fetchPriority: "high"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: rightHalfRef,
                "aria-hidden": "true",
                className: "absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none",
                style: {
                    clipPath: 'inset(0 0 0 50%)',
                    willChange: 'transform'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("picture", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                            srcSet: "/images/cover-1536.avif 1536w, /images/cover-1280.avif 1280w",
                            type: "image/avif"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 136,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                            srcSet: "/images/cover-1536.webp 1536w, /images/cover-1280.webp 1280w",
                            type: "image/webp"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 140,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/images/cover-1536.jpeg",
                            alt: "",
                            className: "w-full h-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]",
                            loading: "eager"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-[1px] h-10 bg-gradient-to-b from-[#E0A93B] to-transparent animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/PhotoCoverSplit.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/components/preloader/Preloader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Preloader",
    ()=>Preloader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$styled$2d$jsx$40$5$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.29.7_supports-color@8.1.1__react@19.3.0/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$preloader$2f$usePreloaderProgress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/preloader/usePreloaderProgress.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const Preloader = ({ onComplete })=>{
    const [skipped, setSkipped] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isServing, setIsServing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDismissed, setIsDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isReducedMotion, setIsReducedMotion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Check reduced motion & session storage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setIsReducedMotion(mediaQuery.matches);
            const hasVisited = sessionStorage.getItem('jairus_portfolio_visited');
            if (hasVisited) {
                setSkipped(true);
                onComplete();
                setIsDismissed(true);
            }
        } catch  {
        // Fallback if sessionStorage is disabled/blocked
        }
    }, [
        onComplete
    ]);
    const { progress, isDone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$preloader$2f$usePreloaderProgress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePreloaderProgress"])({
        minDurationMs: 2400,
        maxDurationMs: 3800
    });
    const handleFinish = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        try {
            sessionStorage.setItem('jairus_portfolio_visited', 'true');
        } catch  {
        // Ignore storage error
        }
        onComplete();
        if (isReducedMotion) {
            setIsDismissed(true);
            return;
        }
        // Trigger serve animation & wipe
        setIsServing(true);
        setTimeout(()=>{
            setIsDismissed(true);
        }, 600);
    }, [
        isReducedMotion,
        onComplete
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isDone && !isServing && !isDismissed && !skipped) {
            handleFinish();
        }
    }, [
        isDone,
        isServing,
        isDismissed,
        skipped,
        handleFinish
    ]);
    const handleSkip = ()=>{
        setSkipped(true);
        handleFinish();
    };
    if (isDismissed || skipped) return null;
    const formattedCounter = String(progress).padStart(2, '0');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "progressbar",
        "aria-valuenow": progress,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-label": "Site preloader",
        style: {
            willChange: 'transform'
        },
        className: "jsx-7c1ba338fb3b36a5" + " " + `fixed inset-0 z-50 flex flex-col justify-between p-8 bg-[#0C0907] select-none pointer-events-auto transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${isServing ? '-translate-y-full' : 'translate-y-0'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-live": "polite",
                className: "jsx-7c1ba338fb3b36a5" + " " + "sr-only",
                children: progress < 100 ? `Loading ${progress}%` : 'Loaded'
            }, void 0, false, {
                fileName: "[project]/src/components/preloader/Preloader.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-7c1ba338fb3b36a5" + " " + "flex justify-end w-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: handleSkip,
                    className: "jsx-7c1ba338fb3b36a5" + " " + "text-xs uppercase tracking-widest text-[#A89880] hover:text-[#E0A93B] focus-visible:ring-2 focus-visible:ring-[#E0A93B] transition-colors py-2 px-3 rounded",
                    children: "Skip"
                }, void 0, false, {
                    fileName: "[project]/src/components/preloader/Preloader.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/preloader/Preloader.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-7c1ba338fb3b36a5" + " " + "flex flex-col items-center justify-center flex-1 my-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "jsx-7c1ba338fb3b36a5" + " " + "font-display-enormous text-[#F2E9D8] tracking-tighter tabular-nums",
                    children: formattedCounter
                }, void 0, false, {
                    fileName: "[project]/src/components/preloader/Preloader.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/preloader/Preloader.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-7c1ba338fb3b36a5" + " " + "relative w-full h-32 overflow-hidden flex items-end justify-center pb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-7c1ba338fb3b36a5" + " " + "absolute bottom-8 left-0 right-0 h-[1px] bg-[#E0A93B]/40"
                    }, void 0, false, {
                        fileName: "[project]/src/components/preloader/Preloader.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    !isReducedMotion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-7c1ba338fb3b36a5" + " " + `w-6 h-6 rounded-full bg-[#E8481F] shadow-[0_0_20px_rgba(232,72,31,0.6)] transition-all duration-500 ${isServing ? 'animate-ball-serve' : 'animate-ball-bounce'}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/preloader/Preloader.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/preloader/Preloader.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$styled$2d$jsx$40$5$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "7c1ba338fb3b36a5",
                children: "@keyframes ballBounce{0%,to{animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(0)}50%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:translateY(-60px)}}@keyframes ballServe{0%{transform:translateY(0)scale(1)}to{opacity:.8;transform:translateY(-120vh)scale(.6)}}.animate-ball-bounce.jsx-7c1ba338fb3b36a5{animation:.6s infinite ballBounce}.animate-ball-serve.jsx-7c1ba338fb3b36a5{animation:.6s cubic-bezier(.16,1,.3,1) forwards ballServe}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/preloader/Preloader.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/components/preloader/usePreloaderProgress.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeSmoothedProgress",
    ()=>computeSmoothedProgress,
    "usePreloaderProgress",
    ()=>usePreloaderProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.7_@babel+core@7.29.7_supports-color@8.1.1__@playwright+test@1.63.0_@types+nod_cbefbe8824f99cce227469bc1d9ca8ba/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function computeSmoothedProgress(elapsedMs, assetLoaded, minDurationMs = 2400, maxDurationMs = 3800) {
    if (elapsedMs <= 0) return 0;
    // Hard maximum constraint
    if (elapsedMs >= maxDurationMs) return 100;
    // Base progress based on elapsed time vs max duration
    const timeProgress = elapsedMs / maxDurationMs * 100;
    if (assetLoaded) {
        // If assets are ready, scale progress so it reaches 100% at minDurationMs
        const assetProgress = Math.min(100, elapsedMs / minDurationMs * 100);
        return Math.max(timeProgress, assetProgress);
    }
    // Cap at 95% if assets are still loading before maxDurationMs
    return Math.min(95, timeProgress);
}
function usePreloaderProgress({ minDurationMs = 2400, maxDurationMs = 3800, onComplete } = {}) {
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isDone, setIsDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [assetLoaded, setAssetLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check asset loading status
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$7_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$8$2e$1$2e$1_$5f40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$nod_cbefbe8824f99cce227469bc1d9ca8ba$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const startTime = performance.now();
        let animationFrameId;
        const update = ()=>{
            const elapsed = performance.now() - startTime;
            const currentProgress = computeSmoothedProgress(elapsed, assetLoaded, minDurationMs, maxDurationMs);
            setProgress(Math.floor(currentProgress));
            if (currentProgress >= 100) {
                setIsDone(true);
                if (onComplete) onComplete();
            } else {
                animationFrameId = requestAnimationFrame(update);
            }
        };
        animationFrameId = requestAnimationFrame(update);
        return ()=>cancelAnimationFrame(animationFrameId);
    }, [
        assetLoaded,
        minDurationMs,
        maxDurationMs,
        onComplete
    ]);
    return {
        progress,
        isDone
    };
}
}),
];

//# sourceMappingURL=_1pv7ou0._.js.map