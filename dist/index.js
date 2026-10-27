import React, { createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
// src/components/SEO.tsx
/**
* SEO Component
*
* A comprehensive SEO component for managing meta tags, Open Graph,
* Twitter cards, and structured data using react-helmet-async.
*
* @example
* ```tsx
* const seoConfig: SEOConfig = {
*   appName: 'MyApp',
*   baseUrl: 'https://myapp.com',
*   defaultDescription: 'My awesome application',
*   defaultOgImage: 'https://myapp.com/og-image.png',
* };
*
* <SEO
*   config={seoConfig}
*   title="Dashboard"
*   description="Manage your account"
*   canonical="/dashboard"
* />
* ```
*/
var SEO = ({ title, description, keywords, canonical, ogType = "website", ogImage, noIndex = false, structuredData, twitterCard = "summary_large_image", twitterSite, config, meta = [], links = [] }) => {
	const { appName, baseUrl, defaultDescription, defaultOgImage, defaultTwitterSite } = config;
	const fullTitle = title ? `${title} | ${appName}` : appName;
	const metaDescription = description || defaultDescription;
	const metaOgImage = ogImage || defaultOgImage || `${baseUrl}/og-image.png`;
	const metaTwitterSite = twitterSite || defaultTwitterSite;
	const canonicalUrl = canonical ? `${baseUrl}${canonical}` : void 0;
	const keywordsString = Array.isArray(keywords) ? keywords.join(", ") : keywords;
	const structuredDataArray = structuredData ? Array.isArray(structuredData) ? structuredData : [structuredData] : [];
	return /* @__PURE__ */ jsxs(Helmet, { children: [
		/* @__PURE__ */ jsx("title", { children: fullTitle }),
		/* @__PURE__ */ jsx("meta", {
			name: "title",
			content: fullTitle
		}),
		metaDescription && /* @__PURE__ */ jsx("meta", {
			name: "description",
			content: metaDescription
		}),
		keywordsString && /* @__PURE__ */ jsx("meta", {
			name: "keywords",
			content: keywordsString
		}),
		noIndex && /* @__PURE__ */ jsx("meta", {
			name: "robots",
			content: "noindex, nofollow"
		}),
		canonicalUrl && /* @__PURE__ */ jsx("link", {
			rel: "canonical",
			href: canonicalUrl
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:type",
			content: ogType
		}),
		canonicalUrl && /* @__PURE__ */ jsx("meta", {
			property: "og:url",
			content: canonicalUrl
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:title",
			content: fullTitle
		}),
		metaDescription && /* @__PURE__ */ jsx("meta", {
			property: "og:description",
			content: metaDescription
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:image",
			content: metaOgImage
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:site_name",
			content: appName
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:card",
			content: twitterCard
		}),
		metaTwitterSite && /* @__PURE__ */ jsx("meta", {
			name: "twitter:site",
			content: metaTwitterSite
		}),
		canonicalUrl && /* @__PURE__ */ jsx("meta", {
			name: "twitter:url",
			content: canonicalUrl
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:title",
			content: fullTitle
		}),
		metaDescription && /* @__PURE__ */ jsx("meta", {
			name: "twitter:description",
			content: metaDescription
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:image",
			content: metaOgImage
		}),
		meta.map((tag, index) => /* @__PURE__ */ jsx("meta", { ...tag }, index)),
		links.map((link, index) => /* @__PURE__ */ jsx("link", { ...link }, index)),
		structuredDataArray.map((data, index) => /* @__PURE__ */ jsx("script", {
			type: "application/ld+json",
			children: JSON.stringify(data)
		}, index))
	] });
};
// src/hooks/usePageSEO.ts
/**
* Comprehensive SEO hook for page components.
*
* Pages provide localized content (title, description, keywords, structured data).
* This hook handles all DOM manipulation: document.title, meta tags, canonical,
* og:*, twitter:*, hreflang, and structured data scripts.
*
* Replaces the need for pages to call useSEOUpdate, manage useEffects for
* canonical/og:url, or worry about react-helmet-async v2 + React 19 issues.
*
* @example
* ```tsx
* usePageSEO({
*   title: t('seo.detail.title', { name: localizedName }),
*   description: t('seo.detail.description', { name: localizedName }),
*   keywords: ['keyword1', 'keyword2'],
*   canonical: `https://example.com/en/items/${itemPath}`,
*   lang: 'en',
*   ogType: 'article',
*   structuredData: [articleSchema, breadcrumbSchema],
* }, {
*   appName: 'MyApp',
*   baseUrl: 'https://example.com',
*   defaultOgImage: 'https://example.com/logo.png',
*   supportedLanguages: ['en', 'zh', 'ja'],
*   defaultLanguage: 'en',
* });
* ```
*/
function setMeta(attr, key, content) {
	const matches = Array.from(document.querySelectorAll(`meta[${attr}="${key}"]`));
	let el = matches.find((match) => match.getAttribute("data-rh") === "true") || matches[0] || null;
	for (const duplicate of matches) if (duplicate !== el) duplicate.remove();
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(attr, key);
		document.head.appendChild(el);
	}
	el.setAttribute("content", content);
	el.setAttribute("data-rh", "true");
}
function setLink(rel, href, attrs) {
	const selector = attrs ? `link[rel="${rel}"][${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join("][")}]` : `link[rel="${rel}"]`;
	const matches = Array.from(document.querySelectorAll(selector));
	let el = matches.find((match) => match.getAttribute("data-rh") === "true") || matches[0] || null;
	for (const duplicate of matches) if (duplicate !== el) duplicate.remove();
	if (!el) {
		el = document.createElement("link");
		el.rel = rel;
		if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
		document.head.appendChild(el);
	}
	el.href = href;
	el.setAttribute("data-rh", "true");
	return el;
}
/**
* Manages all SEO meta tags, canonical, hreflang, and structured data via direct DOM manipulation.
* Works around react-helmet-async v2 + React 19 compatibility issues.
*/
function usePageSEO(data, config) {
	const { title, description, keywords, canonical, lang, pathWithoutLang, ogImage, ogType = "website", noIndex = false, structuredData } = data;
	const { appName, baseUrl, defaultOgImage, twitterHandle, supportedLanguages, languageHreflangMap, defaultLanguage } = config;
	const hreflangRef = useRef([]);
	const cleanedUpRef = useRef(false);
	useEffect(() => {
		if (cleanedUpRef.current) return;
		cleanedUpRef.current = true;
		document.querySelectorAll([
			"meta[name=\"title\"]:not([data-rh])",
			"meta[name=\"description\"]:not([data-rh])",
			"meta[name=\"keywords\"]:not([data-rh])",
			"meta[name=\"robots\"]:not([data-rh])",
			"meta[property^=\"og:\"]:not([data-rh])"
		].join(",")).forEach((el) => el.remove());
		document.querySelectorAll("meta[property^=\"twitter:\"],meta[name^=\"twitter:\"]:not([data-rh])").forEach((el) => el.remove());
		document.querySelectorAll("link[rel=\"alternate\"][hreflang]:not([data-rh])").forEach((el) => el.remove());
		document.querySelectorAll("script[type=\"application/ld+json\"]:not([data-seo-managed])").forEach((el) => el.remove());
	}, []);
	useEffect(() => {
		document.title = title;
		setMeta("name", "title", title);
		setMeta("name", "description", description);
		setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
		if (keywords && keywords.length > 0) setMeta("name", "keywords", keywords.join(", "));
		const image = ogImage || defaultOgImage;
		setMeta("property", "og:type", ogType);
		setMeta("property", "og:site_name", appName);
		setMeta("property", "og:title", title);
		setMeta("property", "og:description", description);
		setMeta("property", "og:url", canonical);
		setMeta("property", "og:image", image);
		setMeta("property", "og:image:alt", title);
		setMeta("property", "og:locale", lang);
		setMeta("name", "twitter:card", "summary_large_image");
		setMeta("name", "twitter:title", title);
		setMeta("name", "twitter:description", description);
		setMeta("name", "twitter:image", image);
		if (twitterHandle) setMeta("name", "twitter:site", `@${twitterHandle}`);
	}, [
		title,
		description,
		keywords,
		canonical,
		lang,
		ogImage,
		ogType,
		noIndex,
		appName,
		defaultOgImage,
		twitterHandle
	]);
	useEffect(() => {
		setLink("canonical", canonical);
	}, [canonical]);
	useEffect(() => {
		document.querySelectorAll("link[rel=\"alternate\"][hreflang]").forEach((el) => el.remove());
		hreflangRef.current = [];
		const elements = [];
		for (const lng of supportedLanguages) {
			const href = `${baseUrl}/${lng}${pathWithoutLang}`;
			const el = document.createElement("link");
			el.rel = "alternate";
			el.hreflang = languageHreflangMap?.[lng] || lng;
			el.href = href;
			el.setAttribute("data-rh", "true");
			document.head.appendChild(el);
			elements.push(el);
		}
		const xDefault = document.createElement("link");
		xDefault.rel = "alternate";
		xDefault.hreflang = "x-default";
		xDefault.href = `${baseUrl}/${defaultLanguage}${pathWithoutLang}`;
		xDefault.setAttribute("data-rh", "true");
		document.head.appendChild(xDefault);
		elements.push(xDefault);
		hreflangRef.current = elements;
		return () => {
			for (const el of elements) el.remove();
		};
	}, [
		baseUrl,
		pathWithoutLang,
		supportedLanguages,
		languageHreflangMap,
		defaultLanguage
	]);
	const schemasJson = JSON.stringify(structuredData ?? []);
	useEffect(() => {
		document.querySelectorAll("script[data-seo-managed]").forEach((el) => el.remove());
		if (!structuredData || structuredData.length === 0) return;
		for (const schema of structuredData) {
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.setAttribute("data-seo-managed", "true");
			script.textContent = JSON.stringify(schema);
			document.head.appendChild(script);
		}
	}, [schemasJson]);
}
// src/utils/schemas.ts
/**
* Build a Schema.org Organization JSON-LD object.
*
* @example
* ```ts
* const schema = buildOrganizationSchema({
*   name: 'Acme Inc.',
*   url: 'https://acme.com',
*   logoUrl: 'https://acme.com/logo.png',
*   description: t('organization.description'),
*   supportEmail: 'support@acme.com',
*   foundingDate: '2024',
* });
* ```
*/
function buildOrganizationSchema(config) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${config.url}/#organization`,
		name: config.name,
		url: config.url,
		logo: {
			"@type": "ImageObject",
			url: config.logoUrl,
			width: 512,
			height: 512
		},
		description: config.description
	};
	if (config.foundingDate) schema.foundingDate = config.foundingDate;
	if (config.supportEmail || config.supportedLanguages) {
		const contactPoint = {
			"@type": "ContactPoint",
			contactType: "customer support"
		};
		if (config.supportEmail) contactPoint.email = config.supportEmail;
		if (config.supportedLanguages && config.supportedLanguages.length > 0) contactPoint.availableLanguage = [...config.supportedLanguages];
		schema.contactPoint = contactPoint;
	}
	return schema;
}
/**
* Build a Schema.org SoftwareApplication JSON-LD object.
*
* @example
* ```ts
* const schema = buildSoftwareApplicationSchema({
*   name: 'MyApp',
*   url: 'https://myapp.com',
*   description: t('app.description'),
*   applicationCategory: 'DeveloperApplication',
*   featureList: t('app.features', { returnObjects: true }),
* });
* ```
*/
function buildSoftwareApplicationSchema(config) {
	const orgName = config.organizationName || config.name;
	const orgUrl = config.organizationUrl || config.url;
	const schema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: config.name,
		applicationCategory: config.applicationCategory,
		operatingSystem: "Web",
		description: config.description,
		url: config.url,
		author: {
			"@type": "Organization",
			name: orgName,
			url: orgUrl
		},
		publisher: {
			"@type": "Organization",
			name: orgName,
			url: orgUrl
		},
		dateModified: config.dateModified || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
	};
	if (config.applicationSubCategory) schema.applicationSubCategory = config.applicationSubCategory;
	if (config.offers) schema.offers = {
		"@type": "AggregateOffer",
		lowPrice: config.offers.lowPrice || "0",
		highPrice: config.offers.highPrice || "0",
		priceCurrency: config.offers.priceCurrency || "USD",
		offerCount: config.offers.offerCount || "1"
	};
	if (config.featureList && config.featureList.length > 0) schema.featureList = config.featureList;
	schema.softwareRequirements = "Modern web browser";
	return schema;
}
// src/utils/seoHost.ts
/**
* Returns true when the current hostname indicates a non-production environment
* (localhost, preview deployments, staging). SEOHead uses this to auto-set
* `noindex` so dev/staging pages are never accidentally indexed.
*/
function isNonProductionHost() {
	if (typeof window === "undefined") return false;
	const hostname = window.location.hostname;
	return hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("preview") || hostname.includes("staging") || hostname.includes("dev") || hostname.endsWith(".pages.dev") || hostname.endsWith(".vercel.app");
}
// src/components/SEOHeadContext.tsx
var SEOHeadConfigContext = createContext(null);
function useSEOHeadConfig() {
	const config = useContext(SEOHeadConfigContext);
	if (!config) throw new Error("SEOHead must be used within a <SEOHeadProvider>");
	return config;
}
function SEOHeadProvider({ config, children }) {
	return /* @__PURE__ */ jsx(SEOHeadConfigContext.Provider, {
		value: config,
		children
	});
}
// src/components/SEOHead.tsx
/**
* Per-route SEO component.
*
* Reads app-level config from `SEOHeadProvider`, derives canonical URL and
* language from the current route, builds the WebApplication schema, and
* delegates all DOM manipulation to `usePageSEO`.
*
* Pages provide localized title, description, keywords, and structured data.
* This component handles everything else automatically.
*/
function SEOHead({ title, description, keywords, ogImage, ogType = "website", noIndex = false, structuredData }) {
	const config = useSEOHeadConfig();
	const { i18n } = useTranslation();
	const location = useLocation();
	const lang = i18n.language || "en";
	const { baseUrl, appName, defaultOgImage, twitterHandle, supportedLanguages, languageHreflangMap, defaultLanguage, applicationCategory, applicationSubCategory, howtoNamespace = "howto", organizationName, supportEmail, foundingDate } = config;
	const urlLangMatch = location.pathname.match(/^\/([a-z]{2}(-[a-z]+)?)(\/|$)/);
	const urlLang = urlLangMatch ? urlLangMatch[1] : lang;
	const rawPathWithoutLang = location.pathname.replace(/^\/[a-z]{2}(-[a-z]+)?(\/|$)/, "/");
	const pathWithoutLang = rawPathWithoutLang === "/" ? "" : rawPathWithoutLang.replace(/\/+$/, "");
	const canonical = `${baseUrl}/${urlLang}${pathWithoutLang}`;
	const shouldNoIndex = noIndex || isNonProductionHost();
	const { t: tHowTo } = useTranslation(howtoNamespace);
	const webAppSchema = useMemo(() => ({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: appName,
		url: baseUrl,
		applicationCategory,
		...applicationSubCategory ? { applicationSubCategory } : {},
		description: tHowTo("webApp.description"),
		operatingSystem: "Web",
		dateModified: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD"
		},
		featureList: (() => {
			const raw = tHowTo("webApp.features", { returnObjects: true });
			return Array.isArray(raw) ? raw : [];
		})()
	}), [
		appName,
		baseUrl,
		applicationCategory,
		applicationSubCategory,
		tHowTo
	]);
	const orgSchema = useMemo(() => buildOrganizationSchema({
		name: organizationName || appName,
		url: baseUrl,
		logoUrl: defaultOgImage,
		description: tHowTo("webApp.description"),
		supportEmail,
		foundingDate,
		supportedLanguages
	}), [
		organizationName,
		appName,
		baseUrl,
		defaultOgImage,
		tHowTo,
		supportEmail,
		foundingDate,
		supportedLanguages
	]);
	const pageSchemas = structuredData ? Array.isArray(structuredData) ? structuredData : [structuredData] : [];
	const schemas = useMemo(() => [
		webAppSchema,
		orgSchema,
		...pageSchemas
	], [
		webAppSchema,
		orgSchema,
		JSON.stringify(pageSchemas)
	]);
	usePageSEO({
		title,
		description,
		keywords: Array.isArray(keywords) ? keywords : void 0,
		canonical,
		lang: urlLang,
		pathWithoutLang,
		ogImage,
		ogType,
		noIndex: shouldNoIndex,
		structuredData: schemas
	}, {
		appName,
		baseUrl,
		defaultOgImage,
		twitterHandle,
		supportedLanguages,
		languageHreflangMap,
		defaultLanguage
	});
	return null;
}
// src/components/AIMeta.tsx
/**
* AIMeta component that renders AI-specific meta tags into the document head.
*
* Renders meta tags for all provided props: `ai:content-type`, `ai:summary`,
* `ai:complexity`, `ai:blockchain-networks`, `ai:token-support`,
* `ai:wallet-requirements`, `ai:use-case`, `ai:audience`, `ai:integrations`,
* `ai:features`, `ai:data-flow`, `ai:business-value`,
* `ai:security-considerations`, and `ai:learning-outcomes`.
*
* @param props - The AIMeta component props
* @returns A Helmet component containing AI meta tags
*/
var AIMeta = ({ contentType, aiSummary, technicalComplexity = "intermediate", blockchainNetworks, tokenSupported, walletRequired, useCase, targetAudience, integrations, features, dataFlow, businessValue, securityConsiderations, learningOutcomes }) => {
	return /* @__PURE__ */ jsxs(Helmet, { children: [
		/* @__PURE__ */ jsx("meta", {
			name: "ai:content-type",
			content: contentType
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "ai:summary",
			content: aiSummary
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "ai:complexity",
			content: technicalComplexity
		}),
		blockchainNetworks && blockchainNetworks.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:blockchain-networks",
			content: blockchainNetworks.join(",")
		}),
		tokenSupported != null && /* @__PURE__ */ jsx("meta", {
			name: "ai:token-support",
			content: String(tokenSupported)
		}),
		walletRequired != null && /* @__PURE__ */ jsx("meta", {
			name: "ai:wallet-requirements",
			content: String(walletRequired)
		}),
		useCase && useCase.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:use-case",
			content: useCase.join(",")
		}),
		targetAudience && targetAudience.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:audience",
			content: targetAudience.join(",")
		}),
		integrations && integrations.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:integrations",
			content: integrations.join(",")
		}),
		features && features.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:features",
			content: features.join(",")
		}),
		dataFlow && dataFlow.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:data-flow",
			content: dataFlow.join(",")
		}),
		businessValue && businessValue.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:business-value",
			content: businessValue.join(",")
		}),
		securityConsiderations && securityConsiderations.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:security-considerations",
			content: securityConsiderations.join(",")
		}),
		learningOutcomes && learningOutcomes.length > 0 && /* @__PURE__ */ jsx("meta", {
			name: "ai:learning-outcomes",
			content: learningOutcomes.join(",")
		})
	] });
};
// src/components/SemanticHTML.tsx
/**
* @fileoverview Semantic HTML Enhancement Components.
*
* Provides a collection of 20+ React components that wrap standard HTML elements
* with proper ARIA roles, accessibility attributes, and Tailwind CSS styling.
* Designed to enforce semantic HTML best practices for improved SEO and accessibility.
*/
/**
* Main content section component.
* Renders a `<main>` element with `role="main"`.
*
* @param props - Semantic section props
* @returns A main landmark element
*/
var Main = ({ children, className, ...props }) => /* @__PURE__ */ jsx("main", {
	className,
	...props,
	role: "main",
	children
});
/**
* Article content component.
* Renders an `<article>` element for self-contained content.
*
* @param props - Semantic section props
* @returns An article element
*/
var Article = ({ children, className, ...props }) => /* @__PURE__ */ jsx("article", {
	className,
	...props,
	children
});
/**
* Section component for thematic grouping of content.
* Renders a `<section>` element.
*
* @param props - Semantic section props
* @returns A section element
*/
var Section = ({ children, className, ...props }) => /* @__PURE__ */ jsx("section", {
	className,
	...props,
	children
});
/**
* Navigation landmark component.
* Renders a `<nav>` element with `role="navigation"`.
*
* @param props - Nav props (aria-label is required)
* @returns A nav landmark element
*/
var Nav = ({ children, className, ...props }) => /* @__PURE__ */ jsx("nav", {
	className,
	...props,
	role: "navigation",
	children
});
/**
* Header/banner component.
* Renders a `<header>` element with `role="banner"`.
*
* @param props - Semantic section props
* @returns A header element
*/
var Header = ({ children, className, ...props }) => /* @__PURE__ */ jsx("header", {
	className,
	...props,
	role: "banner",
	children
});
/**
* Footer/content info component.
* Renders a `<footer>` element with `role="contentinfo"`.
*
* @param props - Semantic section props
* @returns A footer element
*/
var Footer = ({ children, className, ...props }) => /* @__PURE__ */ jsx("footer", {
	className,
	...props,
	role: "contentinfo",
	children
});
/**
* Aside/complementary content component (sidebars, related content).
* Renders an `<aside>` element with `role="complementary"`.
*
* @param props - Semantic section props
* @returns An aside element
*/
var Aside = ({ children, className, ...props }) => /* @__PURE__ */ jsx("aside", {
	className,
	...props,
	role: "complementary",
	children
});
/**
* Figure component with optional caption.
* Renders a `<figure>` element with an optional `<figcaption>`.
*
* @param props - Figure props including optional caption
* @returns A figure element with optional figcaption
*/
var Figure = ({ children, caption, className, ...props }) => /* @__PURE__ */ jsxs("figure", {
	className,
	...props,
	children: [children, caption && /* @__PURE__ */ jsx("figcaption", { children: caption })]
});
var H1 = ({ children, className, ...props }) => /* @__PURE__ */ jsx("h1", {
	className,
	...props,
	children
});
var H2 = ({ children, className, ...props }) => /* @__PURE__ */ jsx("h2", {
	className,
	...props,
	children
});
var H3 = ({ children, className, ...props }) => /* @__PURE__ */ jsx("h3", {
	className,
	...props,
	children
});
var H4 = ({ children, className, ...props }) => /* @__PURE__ */ jsx("h4", {
	className,
	...props,
	children
});
var OrderedList = ({ children, className, ...props }) => /* @__PURE__ */ jsx("ol", {
	className,
	...props,
	children
});
var UnorderedList = ({ children, className, ...props }) => /* @__PURE__ */ jsx("ul", {
	className,
	...props,
	children
});
/**
* Semantically enhanced button with variant styling and ARIA support.
* Supports `primary`, `secondary`, and `danger` variants with Tailwind classes.
*
* @param props - Button props including variant and standard button attributes
* @returns A styled button element with aria-disabled support
*/
var SemanticButton = ({ children, className = "", variant = "primary", disabled, ...props }) => {
	return /* @__PURE__ */ jsx("button", {
		className: `font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${{
			primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring",
			danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-ring"
		}[variant]} ${className}`,
		"aria-disabled": disabled,
		...props,
		children
	});
};
/**
* Semantically enhanced link with accessibility features.
* When `external` is true, adds `target="_blank"`, `rel="noopener noreferrer"`,
* and a screen-reader-only "(opens in new tab)" notice.
*
* @param props - Link props including external flag
* @returns An anchor element with accessibility enhancements
*/
var SemanticLink = ({ children, external, className = "", href, ...props }) => {
	const linkProps = external ? {
		target: "_blank",
		rel: "noopener noreferrer",
		"aria-describedby": "external-link-desc"
	} : {};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("a", {
		className: `text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-ring ${className}`,
		href,
		...linkProps,
		...props,
		children: [children, external && /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: " (opens in new tab)"
		})]
	}), external && /* @__PURE__ */ jsx("span", {
		id: "external-link-desc",
		className: "sr-only",
		children: "External links open in a new tab"
	})] });
};
/**
* Skip navigation link for keyboard accessibility.
* Visually hidden until focused, then positions absolutely at the top-left.
*
* @param props - Props containing the target href (typically "#main-content")
* @returns A skip-to-content link element
*/
var SkipLink = ({ href }) => /* @__PURE__ */ jsx("a", {
	href,
	className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50",
	children: "Skip to main content"
});
var SearchRegion = ({ children, className, ...props }) => /* @__PURE__ */ jsx("div", {
	role: "search",
	className,
	...props,
	children
});
var BannerRegion = ({ children, className, ...props }) => /* @__PURE__ */ jsx("div", {
	role: "banner",
	className,
	...props,
	children
});
var ComplementaryRegion = ({ children, className, ...props }) => /* @__PURE__ */ jsx("div", {
	role: "complementary",
	className,
	...props,
	children
});
/**
* Semantic form component with ARIA label support.
*
* @param props - Form props including optional aria-label
* @returns A form element
*/
var SemanticForm = ({ children, className, ...props }) => /* @__PURE__ */ jsx("form", {
	className,
	...props,
	children
});
/**
* Semantic input component with auto-generated label, error, and help text.
* Generates unique IDs for label-input association and ARIA describedby references.
*
* @param props - Input props including label, error, and helpText
* @returns A labeled input with optional error and help text
*/
var SemanticInput = ({ label, error, helpText, id, className = "", ...props }) => {
	const generatedId = useId();
	const inputId = id || `input-${generatedId}`;
	const errorId = error ? `${inputId}-error` : void 0;
	const helpId = helpText ? `${inputId}-help` : void 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-4",
		children: [
			/* @__PURE__ */ jsx("label", {
				htmlFor: inputId,
				className: "block text-sm font-medium mb-2",
				children: label
			}),
			/* @__PURE__ */ jsx("input", {
				id: inputId,
				className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input"} ${className}`,
				"aria-describedby": [helpId, errorId].filter(Boolean).join(" ") || void 0,
				"aria-invalid": error ? "true" : "false",
				...props
			}),
			helpText && /* @__PURE__ */ jsx("p", {
				id: helpId,
				className: "mt-1 text-sm text-muted-foreground",
				children: helpText
			}),
			error && /* @__PURE__ */ jsx("p", {
				id: errorId,
				className: "mt-1 text-sm text-destructive",
				role: "alert",
				children: error
			})
		]
	});
};
/**
* Screen reader only text component.
* Renders visually hidden text using the `.sr-only` CSS class.
*
* @param props - Props containing children text
* @returns A visually hidden span element
*/
var ScreenReaderOnly = ({ children }) => /* @__PURE__ */ jsx("span", {
	className: "sr-only",
	children
});
/**
* Accessible loading indicator with spinner animation.
* Uses `role="status"` and `aria-live="polite"` for screen reader announcements.
*
* @param props - Loading props including message and size
* @returns A loading indicator with screen-reader support
*/
var SemanticLoading = ({ message = "Loading...", size = "md" }) => {
	return /* @__PURE__ */ jsxs("div", {
		role: "status",
		"aria-live": "polite",
		className: "flex items-center justify-center space-x-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: `animate-spin rounded-full border-2 border-border border-t-primary ${{
				sm: "w-4 h-4",
				md: "w-8 h-8",
				lg: "w-12 h-12"
			}[size]}`,
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: message
		})]
	});
};
// src/components/AITrainingEnhancer.tsx
/**
* Wrapper component for AI training content enhancement.
*
* Renders children directly as a fragment. Serves as a semantic marker
* for content regions that should be prioritized in AI training pipelines.
*
* @param props - The component props containing children to render
* @returns A React fragment containing the children
*/
var AITrainingEnhancer = ({ children }) => {
	return /* @__PURE__ */ jsx(Fragment, { children });
};
// src/hooks/useSEOUpdate.ts
/**
* React 19 + react-helmet-async workaround hook.
*
* react-helmet-async v2 does not reliably update meta tags on re-renders
* with React 19. This hook writes document.title and key meta tags directly
* to the DOM via useEffect, ensuring they stay in sync when page content
* changes without a full route transition (e.g., master-detail selection,
* tab switches, filtered views).
*
* Use this hook in any page component where SEO metadata changes based on
* in-page selection. It complements — not replaces — the <SEO> component,
* which still handles hreflang, canonical, and structured data.
*/
/**
* Force-updates document.title and meta tags when values change.
*
* @example
* ```tsx
* const seoTitle = hasSlug
*   ? t(`seo.items.${selectedSlug}.title`)
*   : t('seo.items.index.title');
* const seoDescription = t(`seo.items.${selectedSlug}.description`);
*
* useSEOUpdate({
*   title: seoTitle,
*   description: seoDescription,
*   appName: 'MyApp',
*   keywords: t(`seo.items.${selectedSlug}.keywords`),
* });
* ```
*/
function useSEOUpdate({ title, description, appName, keywords, ogImage, canonical }) {
	useEffect(() => {
		const fullTitle = appName ? `${title} | ${appName}` : title;
		document.title = fullTitle;
		const setMeta = (attr, key, content) => {
			let el = document.querySelector(`meta[${attr}="${key}"]`);
			if (!el) {
				el = document.createElement("meta");
				el.setAttribute(attr, key);
				document.head.appendChild(el);
			}
			el.setAttribute("content", content);
			el.setAttribute("data-rh", "true");
		};
		const setLink = (rel, href) => {
			let el = document.querySelector(`link[rel="${rel}"]`);
			if (!el) {
				el = document.createElement("link");
				el.rel = rel;
				document.head.appendChild(el);
			}
			el.href = href;
			el.setAttribute("data-rh", "true");
		};
		setMeta("name", "description", description);
		setMeta("property", "og:title", fullTitle);
		setMeta("property", "og:description", description);
		setMeta("property", "og:image:alt", fullTitle);
		setMeta("name", "twitter:title", fullTitle);
		setMeta("name", "twitter:description", description);
		if (keywords) setMeta("name", "keywords", keywords);
		if (ogImage) setMeta("property", "og:image", ogImage);
		if (canonical) {
			setLink("canonical", canonical);
			setMeta("property", "og:url", canonical);
		}
	}, [
		title,
		description,
		appName,
		keywords,
		ogImage,
		canonical
	]);
}
// src/utils/advancedSEO.ts
var getCurrentPathname = (pathname) => {
	if (pathname) return pathname;
	if (typeof window !== "undefined" && window.location) return window.location.pathname;
	return "/";
};
var ensureArray = (value) => {
	if (Array.isArray(value)) return value;
	if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
	return [];
};
var getBranding = (config) => {
	return {
		appName: config.appName,
		baseUrl: config.baseUrl,
		twitterHandle: config.twitterHandle || "",
		emailDomain: config.emailDomain || "example.com"
	};
};
/**
* Generate a Schema.org WebApplication schema for a Web3 software service.
*
* Includes offers, feature lists, blockchain network support, wallet compatibility,
* and audience targeting. Designed for SaaS/web-based services rather than
* downloadable products.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns A Schema.org WebApplication JSON-LD object
*/
var createWebApplicationSchema = (config) => {
	const audienceArray = ensureArray(config.audience);
	const branding = getBranding(config.branding);
	return {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: branding.appName,
		applicationCategory: "CommunicationApplication",
		operatingSystem: "Web",
		browserRequirements: "Requires a modern browser with Web3 wallet extension",
		description: config.description,
		url: branding.baseUrl,
		offers: [{
			"@type": "Offer",
			name: "Free Web3 Email",
			description: "Basic wallet-based email with unlimited sending",
			price: "0",
			priceCurrency: "USD",
			availability: "https://schema.org/InStock"
		}, {
			"@type": "Offer",
			name: "Premium Web3 Email",
			description: "Advanced features with ENS/SNS domains and priority support",
			price: "2.00",
			priceCurrency: "USD",
			availability: "https://schema.org/InStock"
		}],
		featureList: [
			"Passwordless wallet authentication",
			"ENS domain email support (.eth)",
			"Solana Name Service support (.sol)",
			"Smart contract email integration",
			"Multi-chain wallet compatibility",
			"Cross-chain email addresses",
			"DAO email delegation",
			"Encrypted communication",
			"Web2/Web3 bridge functionality",
			"Point-based reward system"
		],
		applicationSubCategory: "Web3 Email Platform",
		audience: {
			"@type": "Audience",
			audienceType: audienceArray.join(", "),
			geographicArea: "Worldwide"
		},
		creator: {
			"@type": "Organization",
			name: branding.appName,
			url: branding.baseUrl
		},
		datePublished: "2024-01-01",
		dateModified: config.lastUpdated?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
		softwareRequirements: "Web3 Wallet (MetaMask, Phantom, etc.)"
	};
};
/** @deprecated Use createWebApplicationSchema instead */
var createWeb3ProductSchema = createWebApplicationSchema;
/**
* Generate a Schema.org TechnicalArticle schema for guides and documentation.
*
* Includes author/publisher organization, educational level, reading time,
* and learning resource type.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns A Schema.org TechnicalArticle JSON-LD object
*/
var createTechnicalArticleSchema = (config) => {
	const keywordsArray = ensureArray(config.keywords);
	const audienceArray = ensureArray(config.audience);
	const branding = getBranding(config.branding);
	const pathname = getCurrentPathname(config.pathname);
	return {
		"@context": "https://schema.org",
		"@type": "TechnicalArticle",
		headline: config.title,
		description: config.description,
		author: {
			"@type": "Organization",
			name: branding.appName,
			url: branding.baseUrl,
			logo: {
				"@type": "ImageObject",
				url: `${branding.baseUrl}/logo.png`
			}
		},
		publisher: {
			"@type": "Organization",
			name: branding.appName,
			logo: {
				"@type": "ImageObject",
				url: `${branding.baseUrl}/logo.png`,
				width: 600,
				height: 600
			}
		},
		datePublished: "2024-01-01T00:00:00Z",
		dateModified: config.lastUpdated?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${branding.baseUrl}${pathname}`
		},
		image: {
			"@type": "ImageObject",
			url: `${branding.baseUrl}/og-images/technical-guide.jpg`,
			width: 1200,
			height: 630
		},
		keywords: keywordsArray.join(", "),
		about: [
			{
				"@type": "Thing",
				name: "Web3 Email Platform"
			},
			{
				"@type": "Thing",
				name: "Blockchain Technology"
			},
			{
				"@type": "Thing",
				name: "Decentralized Communication"
			}
		],
		audience: {
			"@type": "Audience",
			audienceType: audienceArray.join(", "),
			educationalLevel: config.complexity
		},
		educationalLevel: config.complexity,
		proficiencyLevel: config.complexity,
		learningResourceType: config.contentType,
		timeRequired: config.readingTime ? `PT${config.readingTime}M` : "PT5M",
		inLanguage: "en",
		isAccessibleForFree: true,
		license: "https://creativecommons.org/licenses/by/4.0/",
		teaches: config.relatedTopics || [
			"Web3 email setup",
			"Wallet connection process",
			"Blockchain authentication",
			"Smart contract integration"
		]
	};
};
/**
* Generate a Schema.org FAQPage schema from an array of Q&A entries.
*
* Each FAQ item may include an optional `upvoteCount`. When provided, it is
* included in the schema output. When omitted, the field is excluded entirely
* (it is not required by Schema.org).
*
* @param faqs - Array of FAQ objects with question, answer, optional category and upvoteCount
* @param branding - App branding configuration for author attribution
* @returns A Schema.org FAQPage JSON-LD object
*/
var createEnhancedFAQSchema = (faqs, branding) => {
	const brandingConfig = getBranding(branding);
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
				dateCreated: (/* @__PURE__ */ new Date()).toISOString(),
				author: {
					"@type": "Organization",
					name: brandingConfig.appName
				}
			},
			answerCount: 1,
			...faq.upvoteCount != null && { upvoteCount: faq.upvoteCount },
			dateCreated: "2024-01-01T00:00:00Z",
			category: faq.category || "General"
		}))
	};
};
/**
* Generate a Schema.org WebPage schema optimized for AI/LLM crawlers.
*
* Includes significant links, related links, mentions of tools/services,
* and interaction targets for better LLM understanding.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns A Schema.org WebPage JSON-LD object with AI-optimized metadata
*/
var createAIOptimizedSchema = (config) => {
	const branding = getBranding(config.branding);
	const pathname = getCurrentPathname(config.pathname);
	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: config.title,
		description: config.description,
		url: `${branding.baseUrl}${pathname}`,
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: `${branding.baseUrl}/og-images/ai-optimized.jpg`
		},
		significantLink: [
			`${branding.baseUrl}/document`,
			`${branding.baseUrl}/web3-users`,
			`${branding.baseUrl}/web3-projects`,
			`${branding.baseUrl}/connect`
		],
		relatedLink: config.relatedTopics?.map((topic) => `${branding.baseUrl}/search?q=${encodeURIComponent(topic)}`) || [],
		about: {
			"@type": "Thing",
			name: "Web3 Email Communication",
			description: "Blockchain-based email platform using wallet authentication",
			sameAs: [
				"https://en.wikipedia.org/wiki/Web3",
				"https://en.wikipedia.org/wiki/Blockchain",
				"https://en.wikipedia.org/wiki/Cryptocurrency_wallet"
			]
		},
		mentions: [
			{
				"@type": "SoftwareApplication",
				name: "MetaMask"
			},
			{
				"@type": "SoftwareApplication",
				name: "Phantom Wallet"
			},
			{
				"@type": "Thing",
				name: "Ethereum Name Service"
			},
			{
				"@type": "Thing",
				name: "Solana Name Service"
			}
		],
		isPartOf: {
			"@type": "WebSite",
			"@id": branding.baseUrl,
			name: branding.appName
		},
		potentialAction: {
			"@type": "InteractAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${branding.baseUrl}/connect`,
				actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"]
			},
			name: "Connect Web3 Wallet"
		}
	};
};
/**
* Generate Open Graph meta tag key-value pairs for social sharing.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns An object of Open Graph property-value pairs (e.g., 'og:title', 'og:description')
*/
var createEnhancedOpenGraph = (config) => {
	const keywordsArray = ensureArray(config.keywords);
	const branding = getBranding(config.branding);
	const pathname = getCurrentPathname(config.pathname);
	return {
		"og:title": config.title,
		"og:description": config.description,
		"og:type": "website",
		"og:url": `${branding.baseUrl}${pathname}`,
		"og:image": `${branding.baseUrl}/og-images/${config.category}.jpg`,
		"og:image:width": "1200",
		"og:image:height": "630",
		"og:image:alt": `${config.title} - ${branding.appName}`,
		"og:site_name": branding.appName,
		"og:locale": "en_US",
		"article:author": `${branding.baseUrl}/about`,
		"article:section": config.category,
		"article:tag": keywordsArray.join(","),
		"article:published_time": "2024-01-01T00:00:00Z",
		"article:modified_time": config.lastUpdated?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
	};
};
/**
* Generate Twitter Card meta tag key-value pairs.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns An object of Twitter Card property-value pairs (e.g., 'twitter:card', 'twitter:title')
*/
var createEnhancedTwitterCard = (config) => {
	const branding = getBranding(config.branding);
	return {
		"twitter:card": "summary_large_image",
		"twitter:site": branding.twitterHandle || "",
		"twitter:creator": branding.twitterHandle || "",
		"twitter:title": config.title,
		"twitter:description": config.description,
		"twitter:image": `${branding.baseUrl}/twitter-cards/${config.category}.jpg`,
		"twitter:image:alt": `${config.title} - ${branding.appName}`,
		"twitter:label1": "Category",
		"twitter:data1": config.category,
		"twitter:label2": "Reading Time",
		"twitter:data2": config.readingTime ? `${config.readingTime} min` : "5 min"
	};
};
/**
* Generate custom AI/LLM/Web3/semantic meta tags for enhanced AI understanding.
*
* Returns meta tags in namespaces: ai:*, web3:*, llm:*, semantic:*, content:*.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns An object of AI meta tag key-value pairs
*/
var createAIMetaTags = (config) => {
	const keywordsArray = ensureArray(config.keywords);
	const audienceArray = ensureArray(config.audience);
	const branding = getBranding(config.branding);
	return {
		"ai:content-type": config.contentType,
		"ai:complexity": config.complexity,
		"ai:category": config.category,
		"ai:audience": audienceArray.join(","),
		"ai:keywords": keywordsArray.join(","),
		"ai:reading-time": config.readingTime?.toString() || "5",
		"web3:platform": "Email",
		"web3:networks": "ethereum,solana,polygon",
		"web3:wallets": "metamask,phantom,walletconnect",
		"web3:features": "ens,sns,smart-contracts,multi-chain",
		"llm:context": "Web3 email platform documentation and user guides",
		"llm:domain": "blockchain,cryptocurrency,decentralized-communication",
		"llm:use-case": "email,authentication,wallet-integration,smart-contracts",
		"semantic:topic": config.category,
		"semantic:intent": "inform,guide,educate",
		"semantic:entities": `${branding.appName},Web3,blockchain,email,wallet`,
		"content:freshness": config.lastUpdated?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
		"content:authority": "high",
		"content:expertise": "technical",
		"content:trustworthiness": "verified"
	};
};
/**
* All-in-one SEO generation function.
*
* Combines all schema generators, OpenGraph, Twitter Card, and AI meta tag
* creators into a single output object.
*
* @param config - Advanced SEO configuration with branding and content details
* @returns Object containing structuredData, openGraph, twitterCard, aiMetaTags, and jsonLD arrays
*/
var generateAdvancedSEO = (config) => ({
	structuredData: {
		webApplication: createWebApplicationSchema(config),
		article: createTechnicalArticleSchema(config),
		aiOptimized: createAIOptimizedSchema(config)
	},
	openGraph: createEnhancedOpenGraph(config),
	twitterCard: createEnhancedTwitterCard(config),
	aiMetaTags: createAIMetaTags(config),
	jsonLD: [
		createWebApplicationSchema(config),
		createTechnicalArticleSchema(config),
		createAIOptimizedSchema(config)
	]
});
var pageSEOConfigs = {
	homepage: {
		title: "Revolutionary Web3 Email Platform | Wallet-Based Authentication",
		description: "Transform your email experience - the first Web3 email platform using wallet authentication. No passwords, enhanced security, ENS/SNS domain support, and smart contract integration.",
		keywords: [
			"Web3 email",
			"blockchain email",
			"wallet authentication",
			"ENS email",
			"SNS email",
			"decentralized email",
			"smart contract integration"
		],
		category: "Web3 Platform",
		audience: [
			"Crypto Users",
			"Web3 Developers",
			"DeFi Users",
			"DAO Members"
		],
		complexity: "beginner",
		contentType: "overview",
		readingTime: 3,
		relatedTopics: [
			"Web3 authentication",
			"Blockchain communication",
			"Decentralized identity"
		]
	},
	documentation: {
		title: "Documentation - Complete Web3 Email Setup Guide",
		description: "Comprehensive documentation for Web3 email platform. Learn wallet connection, ENS/SNS setup, smart contract integration, and advanced features.",
		keywords: [
			"Web3 email guide",
			"wallet connection",
			"ENS setup",
			"SNS configuration",
			"smart contract email",
			"blockchain documentation"
		],
		category: "Technical Documentation",
		audience: [
			"Developers",
			"Technical Users",
			"Web3 Enthusiasts"
		],
		complexity: "intermediate",
		contentType: "guide",
		readingTime: 15,
		relatedTopics: [
			"Wallet integration",
			"Blockchain protocols",
			"Email security"
		]
	},
	earnPoints: {
		title: "How to Earn Points - Web3 Email Rewards Guide",
		description: "Master the points system. Earn rewards through email activities, referrals, smart contract interactions, and prepare for future token distribution.",
		keywords: [
			"Web3 rewards",
			"email points",
			"blockchain rewards",
			"referral program",
			"token preparation",
			"crypto incentives"
		],
		category: "Rewards Guide",
		audience: [
			"Token Farmers",
			"Crypto Users",
			"Web3 Users"
		],
		complexity: "beginner",
		contentType: "tutorial",
		readingTime: 8,
		relatedTopics: [
			"Token economics",
			"Reward systems",
			"Referral marketing"
		]
	}
};
// src/utils/seo-headings.ts
/**
* @fileoverview SEO-optimized heading utility for consistent semantic structure.
*
* Provides functions to create heading elements with SEO-friendly IDs,
* contextual Tailwind CSS styling, and ARIA attributes. Includes preset
* patterns for common Web3 email page layouts and a heading hierarchy validator.
*/
/**
* Create an SEO-optimized React heading element (h1-h6).
*
* Applies Tailwind CSS classes based on heading level and semantic context,
* auto-generates slug IDs from text when not provided, and sets aria-level.
*
* @param config - Heading configuration including level, text, and optional styling
* @returns A React element for the heading (h1-h6)
*/
var createSemanticHeading = (config) => {
	const { level, text, className = "", id, semanticContext = "section" } = config;
	const tagName = `h${level}`;
	const finalClassName = [
		{
			1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
			2: "text-3xl md:text-4xl font-bold leading-tight",
			3: "text-2xl md:text-3xl font-bold leading-tight",
			4: "text-xl md:text-2xl font-semibold leading-tight",
			5: "text-lg md:text-xl font-semibold leading-tight",
			6: "text-base md:text-lg font-medium leading-tight"
		}[level],
		{
			"page-title": "text-foreground mb-6",
			section: "text-foreground mb-4",
			subsection: "text-foreground mb-3",
			feature: "text-foreground mb-2",
			benefit: "text-primary mb-2",
			step: "text-success mb-2"
		}[semanticContext],
		className
	].filter(Boolean).join(" ");
	const headingId = id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return React.createElement(tagName, {
		id: headingId,
		className: finalClassName,
		"aria-level": level
	}, text);
};
/**
* Predefined heading configuration factory functions for common Web3 contexts.
*
* Each function returns a HeadingConfig with appropriate level and semantic context.
*/
var WEB3_HEADING_PATTERNS = {
	pageTitle: (text, className) => ({
		level: 1,
		text,
		className,
		semanticContext: "page-title"
	}),
	majorSection: (text, className) => ({
		level: 2,
		text,
		className,
		semanticContext: "section"
	}),
	feature: (text, className) => ({
		level: 3,
		text,
		className,
		semanticContext: "feature"
	}),
	benefit: (text, className) => ({
		level: 3,
		text,
		className,
		semanticContext: "benefit"
	}),
	step: (text, stepNumber, className) => ({
		level: 3,
		text: stepNumber ? `Step ${stepNumber}: ${text}` : text,
		className,
		semanticContext: "step"
	}),
	subFeature: (text, className) => ({
		level: 4,
		text,
		className,
		semanticContext: "feature"
	})
};
/**
* Validate heading hierarchy for SEO compliance.
*
* Checks for: single H1 per page, no heading level skips (e.g., H1 to H3),
* and descriptive text length (min 3 chars, warns over 70 chars).
*
* @param headings - Array of HeadingConfig objects representing the page heading structure
* @returns Object with isValid boolean, errors array, and suggestions array
*/
var validateHeadingStructure = (headings) => {
	const errors = [];
	const suggestions = [];
	const h1Count = headings.filter((h) => h.level === 1).length;
	if (h1Count === 0) errors.push("Missing H1 tag - every page should have exactly one H1");
	else if (h1Count > 1) errors.push(`Multiple H1 tags found (${h1Count}) - use only one H1 per page`);
	for (let i = 1; i < headings.length; i++) {
		const current = headings[i];
		const previous = headings[i - 1];
		if (current.level > previous.level + 1) errors.push(`Heading level jump from H${previous.level} to H${current.level} - avoid skipping levels`);
	}
	headings.forEach((heading, index) => {
		if (heading.text.length < 3) errors.push(`Heading ${index + 1} is too short - use descriptive text`);
		if (heading.text.length > 70) suggestions.push(`Heading "${heading.text.substring(0, 30)}..." is long - consider shortening for better SEO`);
	});
	return {
		isValid: errors.length === 0,
		errors,
		suggestions
	};
};
var WEB3_EMAIL_HEADINGS = {
	walletConnection: WEB3_HEADING_PATTERNS.pageTitle("Connect Your Web3 Wallet"),
	emailBenefits: WEB3_HEADING_PATTERNS.majorSection("Why Choose Web3 Email?"),
	securityFeature: WEB3_HEADING_PATTERNS.feature("Secure & Private"),
	ensIntegration: WEB3_HEADING_PATTERNS.feature("ENS Domain Support"),
	multiChain: WEB3_HEADING_PATTERNS.feature("Multi-Chain Compatibility"),
	passwordless: WEB3_HEADING_PATTERNS.benefit("No Passwords Required"),
	setupStep1: WEB3_HEADING_PATTERNS.step("Connect Your Wallet", 1),
	setupStep2: WEB3_HEADING_PATTERNS.step("Verify Your Identity", 2),
	setupStep3: WEB3_HEADING_PATTERNS.step("Access Your Emails", 3)
};
// src/utils/aiTrainingMetadata.ts
var WEB3_CONCEPTS = [
	{
		term: "Web3 Email",
		definition: "Email system that uses blockchain wallet addresses as authentication instead of traditional passwords",
		category: "Web3 Communication",
		synonyms: [
			"blockchain email",
			"decentralized email",
			"crypto email"
		],
		relatedTerms: [
			"wallet authentication",
			"ENS email",
			"SNS email"
		],
		examples: ["vitalik.eth@example.com", "alice.sol@example.com"],
		context: "Web3 email revolutionizes digital communication by eliminating passwords and using cryptographic signatures for authentication"
	},
	{
		term: "Wallet Authentication",
		definition: "Authentication method using cryptographic signatures from blockchain wallets instead of passwords",
		category: "Security",
		synonyms: [
			"wallet-based auth",
			"signature authentication",
			"passwordless authentication"
		],
		relatedTerms: [
			"EIP-712",
			"SIWE",
			"message signing"
		],
		examples: [
			"MetaMask signature",
			"Phantom wallet auth",
			"WalletConnect login"
		],
		context: "Wallet authentication provides superior security through cryptographic proofs that cannot be phished or stolen like passwords"
	},
	{
		term: "ENS Email",
		definition: "Email addresses using Ethereum Name Service domains (.eth) as identifiers",
		category: "Naming Systems",
		synonyms: ["Ethereum name email", ".eth email"],
		relatedTerms: [
			"ENS",
			"Ethereum domains",
			"blockchain domains"
		],
		examples: ["vitalik.eth", "ethereum.eth"],
		context: "ENS emails provide human-readable addresses that resolve to Ethereum wallet addresses"
	},
	{
		term: "SNS Email",
		definition: "Email addresses using Solana Name Service domains (.sol) as identifiers",
		category: "Naming Systems",
		synonyms: ["Solana name email", ".sol email"],
		relatedTerms: [
			"SNS",
			"Solana domains",
			"SPL domains"
		],
		examples: ["anatoly.sol", "solana.sol"],
		context: "SNS emails provide human-readable addresses for Solana ecosystem users"
	},
	{
		term: "Smart Contract Integration",
		definition: "Ability to send and receive emails triggered by blockchain smart contract events",
		category: "Blockchain Integration",
		synonyms: ["contract notifications", "on-chain email triggers"],
		relatedTerms: [
			"event listeners",
			"webhooks",
			"contract automation"
		],
		examples: [
			"DAO proposal notifications",
			"DeFi alert emails",
			"NFT sale confirmations"
		],
		context: "Smart contract integration enables automated communication based on blockchain events"
	},
	{
		term: "Multi-Chain Support",
		definition: "Compatibility with multiple blockchain networks for wallet authentication and email services",
		category: "Interoperability",
		synonyms: ["cross-chain support", "blockchain agnostic"],
		relatedTerms: [
			"EVM chains",
			"Solana",
			"Layer 2"
		],
		examples: ["Ethereum, Polygon, Arbitrum, Solana support"],
		context: "Multi-chain support ensures users from any blockchain ecosystem can use the email service"
	},
	{
		term: "DAO Email Delegation",
		definition: "System allowing DAOs to manage email communications through delegated authorities",
		category: "Governance",
		synonyms: ["governance email", "multi-sig email"],
		relatedTerms: [
			"DAO governance",
			"multi-signature",
			"delegation"
		],
		examples: [
			"Treasury notifications",
			"Proposal alerts",
			"Voting reminders"
		],
		context: "DAO email delegation enables decentralized organizations to manage communications efficiently"
	},
	{
		term: "Web2/Web3 Bridge",
		definition: "Technology enabling communication between traditional email systems and blockchain-based email",
		category: "Interoperability",
		synonyms: ["email bridge", "legacy integration"],
		relatedTerms: [
			"SMTP gateway",
			"email forwarding",
			"protocol bridge"
		],
		examples: ["Gmail to Web3 email", "Outlook integration"],
		context: "Web2/Web3 bridge ensures compatibility with existing email infrastructure"
	}
];
/**
* Generate a Schema.org LearningResource object for AI-optimized page metadata.
*
* @param config - AI training configuration with domain, difficulty, and learning objectives
* @returns A Schema.org LearningResource JSON-LD object
*/
var generateAIMetadata = (config) => {
	return {
		"@context": "https://schema.org",
		"@type": "LearningResource",
		educationalLevel: config.difficulty,
		learningResourceType: "Technical Documentation",
		timeRequired: config.estimatedTime ? `PT${config.estimatedTime}M` : void 0,
		teaches: config.learningObjectives,
		requires: config.prerequisites,
		about: {
			"@type": "Thing",
			name: config.domain,
			category: config.category,
			subcategory: config.subcategory
		},
		keywords: config.concepts,
		applicationExample: config.practicalApplications,
		isRelatedTo: config.relatedConcepts
	};
};
/**
* Generate a concept graph from an array of concept definitions.
*
* Builds a graph with nodes (concepts) and edges (related_to, synonym_of relationships).
* Only creates edges to concepts that exist in the input array.
*
* @param concepts - Array of concept definitions to build the graph from
* @returns An object with `nodes` and `edges` arrays
*/
var generateConceptGraph = (concepts) => {
	const graph = {
		nodes: concepts.map((c) => ({
			id: c.term,
			label: c.term,
			category: c.category,
			definition: c.definition
		})),
		edges: []
	};
	concepts.forEach((concept) => {
		concept.relatedTerms?.forEach((related) => {
			if (concepts.find((c) => c.term === related)) graph.edges.push({
				source: concept.term,
				target: related,
				relationship: "related_to"
			});
		});
		concept.synonyms?.forEach((synonym) => {
			graph.edges.push({
				source: concept.term,
				target: synonym,
				relationship: "synonym_of"
			});
		});
	});
	return graph;
};
/**
* Generate labeled training examples for a specific concept.
*
* Produces positive examples (from concept.examples), contextual examples
* (from concept.context), and a definition example, each with confidence scores.
*
* @param concept - The concept definition to generate training examples for
* @returns Array of labeled training examples with text, label, type, and confidence
*/
var generateTrainingExamples = (concept) => {
	const examples = [];
	concept.examples?.forEach((example) => {
		examples.push({
			text: example,
			label: concept.term,
			type: "positive",
			confidence: 1
		});
	});
	if (concept.context) examples.push({
		text: concept.context,
		label: concept.term,
		type: "contextual",
		confidence: .8
	});
	examples.push({
		text: `${concept.term} is ${concept.definition}`,
		label: concept.term,
		type: "definition",
		confidence: 1
	});
	return examples;
};
/**
* Generate Q&A pairs from concept definitions for AI training data.
*
* Produces pairs for: "What is X?", "How does X work?", "What are examples of X?",
* and "What is X related to?" -- each with category and difficulty metadata.
*
* @param concepts - Array of concept definitions to generate Q&A pairs from
* @returns Array of Q&A pair objects with question, answer, category, and difficulty
*/
var generateQAPairs = (concepts) => {
	const qaPairs = [];
	concepts.forEach((concept) => {
		qaPairs.push({
			question: `What is ${concept.term}?`,
			answer: concept.definition,
			category: concept.category,
			difficulty: "basic"
		});
		if (concept.context) qaPairs.push({
			question: `How does ${concept.term} work?`,
			answer: concept.context,
			category: concept.category,
			difficulty: "intermediate"
		});
		if (concept.examples && concept.examples.length > 0) qaPairs.push({
			question: `What are examples of ${concept.term}?`,
			answer: concept.examples.join(", "),
			category: concept.category,
			difficulty: "basic"
		});
		if (concept.relatedTerms && concept.relatedTerms.length > 0) qaPairs.push({
			question: `What is ${concept.term} related to?`,
			answer: `${concept.term} is related to ${concept.relatedTerms.join(", ")}`,
			category: concept.category,
			difficulty: "intermediate"
		});
	});
	return qaPairs;
};
var AI_TRAINING_CONFIGS = {
	homepage: {
		domain: "Web3 Email Platform",
		category: "Web3 Communication",
		concepts: [
			"Web3 email",
			"wallet authentication",
			"passwordless login",
			"blockchain messaging"
		],
		prerequisites: ["Basic blockchain knowledge", "Understanding of crypto wallets"],
		learningObjectives: [
			"Understand Web3 email concepts",
			"Learn wallet authentication",
			"Explore blockchain communication"
		],
		difficulty: "beginner",
		estimatedTime: 5,
		practicalApplications: [
			"Secure email communication",
			"DAO governance",
			"DeFi notifications"
		]
	},
	documentation: {
		domain: "Web3 Email Technical Documentation",
		category: "Technical Guide",
		concepts: [
			"API integration",
			"smart contracts",
			"wallet connection",
			"email protocols"
		],
		prerequisites: [
			"JavaScript/TypeScript",
			"Web3 development basics",
			"REST APIs"
		],
		learningObjectives: [
			"Implement Web3 email",
			"Integrate wallet authentication",
			"Build on email API"
		],
		difficulty: "intermediate",
		estimatedTime: 30,
		practicalApplications: [
			"dApp integration",
			"Email automation",
			"Smart contract notifications"
		]
	},
	governance: {
		domain: "DAO Governance Communication",
		category: "Governance Tools",
		concepts: [
			"DAO email",
			"voting notifications",
			"proposal tracking",
			"multi-sig coordination"
		],
		prerequisites: [
			"DAO basics",
			"Governance understanding",
			"Multi-signature wallets"
		],
		learningObjectives: [
			"Setup DAO email",
			"Configure voting alerts",
			"Manage team communication"
		],
		difficulty: "advanced",
		estimatedTime: 20,
		practicalApplications: [
			"DAO operations",
			"Treasury management",
			"Governance participation"
		]
	}
};
// src/utils/howToSchema.ts
/**
* Build a HowTo structured data schema from localized steps.
*
* @example
* ```tsx
* const howToSchema = buildHowToSchema(
*   t('howto:home.name'),
*   t('howto:home.description'),
*   t('howto:home.steps', { returnObjects: true })
* );
* ```
*/
function buildHowToSchema(name, description, steps) {
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name,
		description,
		step: steps.map((step, i) => ({
			"@type": "HowToStep",
			position: i + 1,
			name: step.name,
			text: step.text
		}))
	};
}
export { AIMeta, AITrainingEnhancer, AI_TRAINING_CONFIGS, Article, Aside, BannerRegion, ComplementaryRegion, Figure, Footer, H1, H2, H3, H4, Header, Main, Nav, OrderedList, SEO, SEOHead, SEOHeadProvider, ScreenReaderOnly, SearchRegion, Section, SemanticButton, SemanticForm, SemanticInput, SemanticLink, SemanticLoading, SkipLink, UnorderedList, WEB3_CONCEPTS, WEB3_EMAIL_HEADINGS, WEB3_HEADING_PATTERNS, buildHowToSchema, buildOrganizationSchema, buildSoftwareApplicationSchema, createAIMetaTags, createAIOptimizedSchema, createEnhancedFAQSchema, createEnhancedOpenGraph, createEnhancedTwitterCard, createSemanticHeading, createTechnicalArticleSchema, createWeb3ProductSchema, createWebApplicationSchema, generateAIMetadata, generateAdvancedSEO, generateConceptGraph, generateQAPairs, generateTrainingExamples, isNonProductionHost, pageSEOConfigs, usePageSEO, useSEOHeadConfig, useSEOUpdate, validateHeadingStructure };

//# sourceMappingURL=index.js.map