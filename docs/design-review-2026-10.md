# October 2026 design and copy review

Tracking: [website issue #5](https://github.com/pubship/website/issues/5).

## Design implemented

The owner's handoff in `design-assets/` selects Ultramarine with paper and charcoal. The site uses its original PubShip mark, Bricolage Grotesque headings and IBM Plex body/code typography. The reference files remain unchanged and untracked; their design runtime, inline handlers and remote font dependencies are not production code. The served site is static HTML/CSS with progressive JavaScript.

Home, Get started and Permissions explain three example workflows, client configuration and access boundaries. Privacy, Terms and 404 share the same navigation, footer and metadata system. Existing privacy and terms article wording is preserved. All font files and their full upstream license notices are bundled locally.

## Copy decisions and sources

Reviewed against `pubship/pubship` 0.24.1 code and documentation. Examples use `com.example.app` and synthetic records. They do not call Google or represent live customer data.

| Claim or correction                                                                           | Source in pubship/pubship                                                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 170 implemented methods, 172 inventory definitions; one unsupported and one policy-disabled   | `docs/api-methods.md`, generated catalog                                                         |
| Account-administration scopes are independent of the app read allowlist                       | `src/pubship/account_access_config.py`                                                           |
| Default tools still require Google access; bulk reports need the report bucket and permission | `docs/setup.md`, `src/pubship/config.py`, `src/pubship/reports.py`                               |
| Listing/track staging differs from committing an edit or changing a live commerce resource    | `docs/listing-staging.md`, `docs/track-staging.md`, `src/pubship/monetization.py`                |
| Edit lifecycle opt-in also requires the app's write allowlist                                 | `src/pubship/config.py`                                                                          |
| Crash query rows and freshness metadata come from separate operations                         | `api/discovery/playdeveloperreporting.json`: `vitals.crashrate.query` and `vitals.crashrate.get` |
| A synthetic explicit review instruction precedes applying the prepared listing change         | `docs/listing-staging.md`                                                                        |
| Results may be scoped/filtered; source/freshness metadata exists where available              | `src/pubship/reporting.py`, `src/pubship/reports.py`                                             |
| Uncertain writes are not retried; inspect state before preparing again                        | `src/pubship/server.py`                                                                          |
| Local setup commands, key-path placeholders and client distinctions                           | `README.md`, `docs/clients.md`, `docs/setup.md`, `llms-install.md`                               |
| Own-account self-hosting requires verified exact-email allowlisting                           | `docs/hosting.md`, `src/pubship/hosted_config.py`, `src/pubship/operator_identity.py`            |

On 9 October 2026, GitHub releases and the public PyPI metadata both showed 0.24.1. GitHub's MCP directory search did not yet list PubShip. The site therefore says "Approved for inclusion", using the owner's approval email as evidence, and links to the directory without implying certification or sponsorship. This status is separate from publication in the official MCP Registry.

## Architecture and review

- No framework, remote runtime, analytics or credential collection added.
- The production CSP, nginx port 8080, private npm package and Docker deployment contract remain intact.
- Site-wide chrome and social metadata remain generated at development time and committed as static HTML.
- Workflow and client panels are all readable without JavaScript. Enhancement adds scoped roving keyboard tabs and copy controls with success/failure feedback.
- Motion is finite and disabled for reduced-motion preferences. Existing anchor aliases remain available, with natural spacing at the document end.
- Architecture/copy review checked operation contracts; engineering implemented and reviewed the static components; QA checks all six pages; delivery links documentation, issue and PR.

## Validation

Final check outcomes are recorded in the PR and in the external design-review evidence folder. Automated browser coverage includes six pages, responsive overflow and alignment, keyboard tabs, clipboard success/failure, no-JavaScript content, reduced motion, metadata, local assets, route behavior and Axe checks. Browser automation does not replace a human screen-reader review or real MCP-client/provider acceptance.
