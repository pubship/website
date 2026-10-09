# Google Search implementation and verification

Reviewed 9 October 2026 against the owner's [Get started with Search Console](https://support.google.com/webmasters/answer/9128669) reference and its developer/advanced-user links. Applies to the PubShip static site. This is a scoped implementation record, not a claim that Google will index, rank or show enhancements for every page.

## Applicable recommendations

| Area                        | PubShip implementation or evidence                                                                                                                                                                          | Remaining verification                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Property ownership          | Owner verified `sc-domain:pubship.dev`.                                                                                                                                                                     | Keep access and Google notifications with the owner.                                                                                           |
| URL Inspection              | Homepage indexed with matching HTTPS canonical. Google Inspection Tool fetched sitemap successfully on 9 October at 17:10:02, crawling allowed.                                                             | After deploy, inspect updated pages and the new guide. A live success does not establish indexing or sitemap processing.                       |
| Sitemap discovery           | Canonical sitemap generated with shared chrome; all six content pages included, 404 omitted, referenced in robots.txt.                                                                                      | Submitted sitemap previously said Couldn't fetch. Live Google fetch now passes; wait for the Sitemaps report to reflect successful processing. |
| Indexing and errors         | Public static HTML, correct MIME types, self-canonicals, real 404s, error-page noindex. Permanent index.html alias redirects preserve query strings and avoid internal-redirect loops.                      | Review Page indexing for unexpected excluded pages or fetch failures.                                                                          |
| Accessible resources        | Styles, scripts, fonts and marks are local and crawlable. Important content and guide examples work without JavaScript.                                                                                     | Inspect Google's rendered page after deployment; do not confuse a local crawler's challenge with Googlebot blocking.                           |
| Search appearance           | Unique task-specific titles/descriptions, synchronized Open Graph/Twitter cards, one H1 per page, descriptive internal links, local favicon and permission for large search-image previews.                 | Inspect actual title/snippet choices; Google may choose different wording.                                                                     |
| Structured data             | Homepage WebSite and SoftwareSourceCode identity; visible BreadcrumbList on subpages. All claims match content and source.                                                                                  | Test breadcrumb eligibility with Google's Rich Results Test after deploy. Source-code identity is not a promise of a Google rich result.       |
| Useful content              | Original release-inspection guide based on versioned source contracts, concrete read calls and failure interpretation. Synthetic examples and review date are explicit.                                     | Recheck examples when tool schemas or permission boundaries change.                                                                            |
| Mobile and page experience  | Responsive, keyboard, accessibility, reduced-motion, navigation and no-JavaScript browser tests; strict CSP retained. Three core pages measured 97-98 performance in previous local mobile Lighthouse runs. | Core Web Vitals requires field data, which has not been supplied. Lab results are not a substitute.                                            |
| Performance measurement     | Documented query/page/country/device export and baseline process below.                                                                                                                                     | Search performance exports are not available to this session. No impressions, clicks or rankings are invented.                                 |
| Security and manual actions | No credentials, third-party scripts or project-run Google sign-in added.                                                                                                                                    | Owner must inspect Search Console Security issues and Manual actions; neither report has been supplied.                                        |

The Google overview points developers to monitoring, URL Inspection and technical documentation. Those operational steps cannot all be completed by adding HTML. There is no connected Search Console tool in this session. No new OAuth grants, analytics provider, recurring job or broad Cloudflare exception was created.

## Reports and decisions

After deployment, record the date and commit. Inspect `/`, `/get-started/`, `/permissions/` and `/guides/check-google-play-release/`. Confirm successful live fetches and rendered content, then request indexing once for changed/new content where appropriate. Do not request search-result indexing for the sitemap itself.

Check the Sitemaps report for processing success and six discovered canonical URLs after the new guide is deployed. Until then, the live site's sitemap has five URLs. Discovery counts do not establish indexing of every URL.

For the first useful baseline, export Search results with the exact date range and search type, including query, page, country and device breakdowns. Retain clicks, impressions, CTR and average position. Compare branded `pubship` searches with non-branded developer intent; use complete 28-day periods when enough history exists. Keep exports separate when dimensions differ; do not add overlapping totals or interpret aggregate position as a universal rank. Early low counts are not enough to infer an improvement or decline.

On the owner's normal maintenance review, check Page indexing, Performance, Core Web Vitals, Security issues and Manual actions. Investigate changes against deployment dates before rewriting copy. Search Console notifications can flag urgent problems; no continuous monitoring is claimed here.

## Features that do not apply

PubShip has no translated equivalents, local storefront, checkout, job postings, videos, news feed, paywall, AMP version, pagination or user-generated website content. Do not fabricate hreflang alternates, business locations, offers, ratings, video/news sitemaps or other markup for these features. Do not invent FAQ rich-result eligibility for a developer-tool site. No need for crawl-budget controls on six static content pages.

`llms.txt` remains accurate for clients that use it; Google does not use it to improve ranking. We retain useful content and crawlable links, with no keyword stuffing, hidden search copy, doorway pages, fake backlinks, fabricated ratings or mass-generated articles.

## Sources and maintenance

- [Google's Search Console onboarding](https://support.google.com/webmasters/answer/9128669)
- [Technical SEO and maintenance](https://developers.google.com/search/docs/fundamentals/get-started)
- [Reports at a glance](https://support.google.com/webmasters/answer/9133276)
- [Sitemap troubleshooting](https://support.google.com/webmasters/answer/7451001)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Robots meta tags and image previews](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Breadcrumb markup](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [SoftwareSourceCode vocabulary](https://schema.org/SoftwareSourceCode)
- [Software rich-result requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Google's generative-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Maintain page metadata, breadcrumbs and sitemap with `npm run sync:chrome`; `npm run check` rejects stale generated content. The full browser suite checks discovery, redirects, links, layout and source claims. Keep guide examples aligned with `pubship/pubship`; the service code and published package are unchanged by this website PR.
