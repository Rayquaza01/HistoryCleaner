parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"StmK":[function(require,module,exports) {
"use strict";var e=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.clean=void 0;const t=e(require("make-dir")),i=e(require("del"));async function r(){await t.default("dist"),await i.default("dist/*")}exports.clean=r;
},{}],"ikUz":[function(require,module,exports) {
"use strict";var e=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.bundle=void 0;const t=e(require("parcel-bundler")),r=["src/**/*.html","src/background.ts"],a={outDir:"./dist",watch:!0,cache:!0,cacheDir:".cache",minify:!1,target:"browser",logLevel:3,hmr:!1,sourceMaps:!0,detailedReport:!1,autoInstall:!1};async function c(e){e&&(a.watch=!1,a.detailedReport=!0,a.minify=!0);const c=new t.default(r,a);await c.bundle()}exports.bundle=c;
},{}],"SLDe":[function(require,module,exports) {
"use strict";var e=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.assets=void 0;const t=e(require("cpx")),s="src/**/*.{json,png}",o="dist";function c(e){if(e)t.default.copySync(s,o);else{t.default.watch(s,o).on("copy",e=>console.log(e.srcPath,"copied to",e.dstPath))}}exports.assets=c;
},{}],"PmsN":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const e=require("./clean"),s=require("./parcel"),o=require("./assets");async function n(){const n="prod"===process.argv[2];console.log("Cleaning..."),await e.clean(),console.log("Copying assets..."),o.assets(n),console.log("Building bundle..."),await s.bundle(n)}n();
},{"./clean":"StmK","./parcel":"ikUz","./assets":"SLDe"}]},{},["PmsN"], null)
//# sourceMappingURL=/build.js.map