import { Cr as inject, U as InjectionToken, ca as ɵɵdefineInjectable } from "./_resource-chunk-cHyxXqZV.js";
import { Ai as setClassMetadata, xn as Injectable } from "./core-DhnrSFht.js";
import { Lt as catchError, cn as forkJoin, jn as of, vn as map } from "./esm5-DYNb5pjm.js";
import { c as HttpBackend, l as HttpClient } from "./http-C9NMynpL.js";
import { TranslateLoader, mergeDeep } from "./@ngx-translate_core.js";
//#region node_modules/@ngx-translate/http-loader/fesm2022/ngx-translate-http-loader.mjs
var TRANSLATE_HTTP_LOADER_CONFIG = new InjectionToken("TRANSLATE_HTTP_LOADER_CONFIG");
var TranslateHttpLoader = class TranslateHttpLoader {
	http;
	config;
	constructor() {
		this.config = {
			resources: [],
			enforceLoading: false,
			useHttpBackend: false,
			...inject(TRANSLATE_HTTP_LOADER_CONFIG)
		};
		this.http = this.config.useHttpBackend ? new HttpClient(inject(HttpBackend)) : inject(HttpClient);
	}
	/**
	* Gets the translations from the server
	*/
	getTranslation(lang) {
		const cacheBuster = this.config.enforceLoading ? `?enforceLoading=${Date.now()}` : "";
		const requests = this.config.resources.map((resource) => {
			const path = typeof resource === "string" ? `${resource}${lang}.json` : `${resource.prefix}${lang}${resource.suffix ?? ".json"}`;
			const request$ = this.http.get(`${path}${cacheBuster}`);
			if (this.config.failOnError) return request$;
			return request$.pipe(catchError((err) => {
				console.warn(`@ngx-translate/http-loader: error loading translation for ${lang}:`, err);
				return of({});
			}));
		});
		if (requests.length === 0) return of({});
		return forkJoin(requests).pipe(map((response) => response.reduce((acc, curr) => mergeDeep(acc, curr), {})));
	}
	static ɵfac = function TranslateHttpLoader_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TranslateHttpLoader)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: TranslateHttpLoader,
		factory: TranslateHttpLoader.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TranslateHttpLoader, [{ type: Injectable }], () => [], null);
})();
function provideTranslateHttpLoader(config = {}) {
	if ("resources" in config && config.resources) return provideTranslateMultiHttpLoader(config);
	const singleConfig = config;
	return provideTranslateMultiHttpLoader({
		enforceLoading: singleConfig.enforceLoading ?? false,
		useHttpBackend: singleConfig.useHttpBackend ?? false,
		failOnError: singleConfig.failOnError ?? false,
		resources: [{
			prefix: singleConfig.prefix ?? "/assets/i18n/",
			suffix: singleConfig.suffix ?? ".json"
		}]
	});
}
function provideTranslateMultiHttpLoader(config = {}) {
	return [{
		provide: TRANSLATE_HTTP_LOADER_CONFIG,
		useValue: {
			resources: ["/assets/i18n/"],
			...config
		}
	}, {
		provide: TranslateLoader,
		useClass: TranslateHttpLoader
	}];
}
//#endregion
export { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader, provideTranslateHttpLoader, provideTranslateMultiHttpLoader };
