# Search readiness and copy audit

Reviewed 9 October 2026. Tracking: [website #11](https://github.com/pubship/website/issues/11). This is a website improvement and measurement plan, not a ranking or AI-citation guarantee.

## What the evidence says

The owner's Search Console inspection for `sc-domain:pubship.dev` confirms the homepage is indexed. Googlebot smartphone successfully crawled it on 9 October at 02:14:11 (Console timezone unspecified); crawling and indexing are allowed. The user canonical and Google's selected canonical are both `https://pubship.dev/`. HTTPS passes. SourceWeft and MCP Servers are recorded referring pages.

The owner has submitted `https://pubship.dev/sitemap.xml`. The Sitemaps report initially showed Couldn't fetch, but the subsequent Google Inspection Tool smartphone live test on 9 October at 17:10:02 fetched it successfully with crawling allowed. Successful sitemap processing remains unconfirmed. The currently deployed sitemap has five URLs; this PR adds a sixth for the new release-inspection guide. Submission, successful fetching, processing and page indexing are separate outcomes.

The owner's query was `google play mcp`, with personalized results in Portugal. It surfaced directories, release-oriented repositories and unrelated Android apps. That snapshot identifies a real discovery problem but is not an objective rank baseline or evidence that PubShip is absent from Google's index. Fresh independent search also surfaced PubShip directory/package records. Direct Google automated search encountered an anti-bot challenge during the directory audit; no challenge was bypassed.

## Search intent and page ownership

| User need                                               | Existing page                                   | Copy action                                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Find an MCP server for Google Play Console work         | Homepage                                        | Descriptive title and visible headline; explain Model Context Protocol and concrete developer tasks.           |
| Connect Claude Code, Codex, Cursor or Gemini CLI        | `/get-started/`                                 | Specific title and introduction; keep the actual local commands and service-account instructions.              |
| Understand credentials, read access and write controls  | `/permissions/`                                 | Specific title and description; preserve Google permissions, PubShip allowlists and data-flow boundaries.      |
| Decide whether the tool can publish or keeps data local | Homepage questions, linked to permissions/setup | Short factual answers distinguish reads, opted-in writes, staged edits, review and client-provider processing. |
| Identify the project and its terms                      | Home, privacy, terms                            | Consistent PubShip identity, operator/contact details, source and license links; no Google affiliation claim.  |

No search volumes, competitor traffic estimates or ranking positions are invented. No duplicate keyword landing pages, bulk-generated articles, paid links, doorway pages or hidden keywords are introduced.

## Copy and on-page changes

- Homepage title: `PubShip · MCP server for Google Play Console`.
- Homepage heading: `Bring Google Play releases into your AI workspace.`
- The introduction defines MCP and names releases, reviews and Android vitals. It retains local credentials and explicit authorization.
- Setup and permissions titles now identify their Google Play tasks. Each description is distinct; Open Graph and Twitter metadata are generated from those same page facts.
- Four native, keyboard-accessible questions explain the product, supported client configurations, release/store-listing changes and data handling. Their answers are present in initial HTML and work without JavaScript.
- The brand stays PubShip. Google Play is used descriptively, not as part of a new product name or logo. No claim of being an official Google server, universal client certification, full live-provider validation or guaranteed publication is added.

The visible social image keeps the existing brand tagline. Its alternative text describes that actual image rather than pretending the image contains the new homepage heading.

## Technical inspection

A fresh real-browser check of the deployed site returned 200 for all five sitemap pages, robots.txt and sitemap.xml. Each normal page had one H1, a matching HTTPS canonical and no noindex directive. A deliberately nonexistent route returned 404, not a soft 404. The first audit script assumed every HTML response had a canonical; it timed out on the intentional 404 page. The corrected audit records a missing canonical there without treating it as an application failure.

| Area            | Decision / evidence                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Discovery       | Generate all six canonical content URLs from shared page metadata. No fake lastmod dates, priorities or change frequencies. Confirm processing separately in Console.                                                                                                                |
| Canonicals      | Keep self-referencing HTTPS canonicals and relative internal links. Redirect explicit index.html aliases permanently, preserving queries; unknown routes remain 404.                                                                                                                 |
| Error page      | Add `noindex` to the explicit error document, including when `/404.html` is requested directly. It is excluded from the sitemap.                                                                                                                                                     |
| Rendering       | Primary content is static HTML. Progressive tabs, copy controls and animations do not create the only copy of important content.                                                                                                                                                     |
| Structured data | Use homepage `WebSite` and `SoftwareSourceCode` identity plus visible `BreadcrumbList` on subpages. Microdata needs no inline-script CSP exception. Do not invent ratings, reviews, offers, awards or certifications.                                                                |
| Internal links  | Homepage answers and setup link to the release guide; shared footers expose it on every page. Test anchors, static assets and sitemap URLs. Retain useful descriptive link text.                                                                                                     |
| External links  | Preserve the requested new-tab behavior and safe rel attributes. Directory inclusion is distinct from endorsement; the public GitHub catalogue entry remains unconfirmed.                                                                                                            |
| Security        | Keep CSP strict, same-origin assets and the existing privacy/security notices. Do not allow Cloudflare's injected analytics merely to silence its blocked-script console message.                                                                                                    |
| Accessibility   | Preserve skip links, keyboard operation, focus, reduced motion, contrast, 44px controls and responsive checks.                                                                                                                                                                       |
| Performance     | Measure with a pinned Lighthouse version against the production container. Lab measurements are not real-user Core Web Vitals or evidence of Google ranking. Keep local fonts with swap and explicit image dimensions; optimize demonstrated bottlenecks rather than adding plugins. |
| AI discovery    | Keep llms.txt accurate for tools that use it. Google says it does not use llms.txt as an SEO or AI-search ranking mechanism.                                                                                                                                                         |

No production Cloudflare, DNS or Search Console configuration is silently changed. The successful indexed Googlebot fetch is stronger evidence of Google access than an unrelated automation tool's 403 response.

## What to do in Search Console

1. Check the already submitted `https://pubship.dev/sitemap.xml` for processing Success. Expect five canonical URLs before this PR deploys and six afterward; discovery does not prove indexing.
2. After this PR is merged and deployed, inspect the homepage, setup, permissions and new release-guide URLs. Run Test live URL, check the rendered content/canonical and request indexing once for the changed pages. Do not repeatedly submit unchanged pages.
3. Check Page indexing, Manual actions, Security issues and Core Web Vitals. Only the supplied homepage inspection and sitemap live-fetch result are verified; the other reports remain unreviewed.
4. Export Search results performance by query, page, country and device. Separate branded searches (`pubship`) from developer intent such as `google play mcp`, `play console mcp` and client-specific setup queries. Include impressions, clicks, CTR and average position with the exact date window. Position is an aggregate, not a universal rank.
5. Compare complete 28-day windows when enough data exists. For this newly published project, sparse data is expected; do not interpret one personalized search or a few impressions as a trend. First look for non-branded impressions on useful pages, then qualified visits and successful setup feedback.

## Content and distribution after the foundation

This PR implements an original walkthrough at `/guides/check-google-play-release/`, using synthetic package names and verified 0.24.1 tool contracts. It explains read access, release states, publication limits, reporting freshness and authentication failures. Keep it aligned with future tool changes. Further content should answer distinct, demonstrated developer questions instead of repeating existing pages.

Keep the existing directory and registry entries accurate and linked to the canonical site. MCP.so currently imports obsolete candidate wording; its listing should be refreshed through the owner's directory account when available. No update to a third-party listing was performed here. GitHub's catalogue approval is real, but do not announce publication until the actual public entry appears.

Do not scatter articles across unrelated topics or create a page for every spelling of the query. Competitor results such as [antoniolg/play-store-mcp](https://github.com/antoniolg/play-store-mcp) and [lusky3/play-store-mcp](https://github.com/lusky3/play-store-mcp) make the release-management intent clear; their existence does not establish superior quality or a benchmark ranking.

## Primary references

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): clear page content, discovery and realistic timelines.
- [Title-link guidance](https://developers.google.com/search/docs/appearance/title-link): concise, descriptive titles and no keyword stuffing.
- [Site-name structured data](https://developers.google.com/search/docs/appearance/site-names): homepage WebSite identity in JSON-LD, RDFa or microdata.
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URLs and submission.
- [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): markup must reflect real content.
- [Google guidance for generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): useful original content and ordinary SEO; no special llms.txt ranking benefit.

## Verification record

The first production-image CI run passed 143 tests and exposed one WebKit interaction race. Its trace showed scrolling continuing after keyboard focus entered a disclosure; the subsequent pointer click missed the quality tab. Smooth scrolling is now scoped to deliberate same-page anchor navigation. Native focus scrolling remains immediate, reduced motion is honored, and modified/external links retain native behavior. Existing position tolerances and timeouts were not relaxed.

Lighthouse 13.5.0 identified oversized directory icons. Three PNG marks now use 84 px source dimensions for their 28 CSS px display at up to 3x density, reducing their combined size from 290,091 to 21,372 bytes (92.6%). Original source hashes and transformation details are retained in the asset provenance file.

The initial mobile lab runs scored accessibility and best practices at 100 on all three main pages. Lighthouse's SEO score was 92 because its in-page robots.txt fetch was rejected by `connect-src 'none'`. Independent HTTP and browser checks fetched valid robots.txt successfully, and Search Console confirmed Googlebot access. Keep the CSP; do not weaken it to improve an audit score. Final lab results are linked in the PR. These are controlled local measurements, not field Core Web Vitals.

Command logs, live baseline, owner-supplied Console findings, responsive screenshots and lab reports are kept outside Git in `pubship-evidence/search-audit-20261009`. PR checks record the final source tested. Search Console ranking, field performance and sitemap processing remain separately observable outcomes; a passing test suite does not prove them.

## Follow-up: Google verification and expanded implementation

The owner submitted the sitemap. Although the Sitemaps report initially showed Couldn't fetch, Google Inspection Tool smartphone successfully fetched it on 9 October at 17:10:02 with crawling allowed. Successful processing in the Sitemaps report remains unconfirmed. Public fetches returned valid XML with five URLs. The new guide will add the sixth URL after deployment.

The previously proposed original walkthrough is now implemented at `/guides/check-google-play-release/`, reviewed against 0.24.1 source. It adds concrete read calls and distinguishes lifecycle, staged edits and vitals freshness. The expanded pass also adds visible breadcrumb markup, SoftwareSourceCode identity, canonical index-file redirects and generated sitemap synchronization. See [the Google checklist](google-search-checklist.md) for applicability and owner-only verification.
