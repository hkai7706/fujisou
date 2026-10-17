# Loan repayment simulation

Added a browser-only calculator at `loan-simulation/`, with a shared header/footer link under 施工プラン and entry links on land information, single-storey, two-storey, custom-home and cost pages. `tools/add-loan-links.mjs` restores missing entry links after page generation and refreshes module versions; it runs in the deployment build.

Inputs: land price, building/construction price, separately entered ancillary expenses, own funds/down payment, annual interest and term. Three modes: land plus building; building only; land only. Links from plan pages select building-only mode; land/cost links select land plus building. The visitor can change mode.

The interest field is intentionally empty. No bank rate, current building price or loan eligibility is preselected or promised. A 35-year term is an editable input, not a lending offer. Term supported: 1–50 whole years; annual interest: 0–20%; budget above zero up to 1 billion yen; amounts entered in 10,000-yen units. Negative values, excessive own funds and invalid numbers are rejected.

Calculation: equal monthly principal-and-interest payments, no bonuses, constant entered rate for the full term, monthly interest = annual percentage / 1200. Numerically stable annuity formula and a zero-interest branch. Outputs: monthly/annual estimate, budget, own funds, inferred principal, total interest, total loan repayments, own funds plus total repayments. Final display rounds to yen; actual bank rounding and schedules can differ. Future variable rates, reliefs/tax credits, prepayments and unentered expenses are not modelled. Land-first/bridge/construction-stage financing needs a separate bank-specific plan.

Pure function: `script/loan-calculation.mjs`. UI: `script/loan-simulation.mjs`. No external service, browser storage, bank API, automatic form transfer or personal inquiry tracking data is used. The consultation link carries only `topic=consultation`. Results are hidden whenever inputs change, preventing stale numbers being shown as current results.

Reference: https://www.zenginkyo.or.jp/article/simulation/loan-new/ (equal-payment method and a separate official calculator). This is not a replica of that service or a bank-approved quotation.

Verification: compared six scenarios against an independent month-by-month amortization/binary-search solver, including zero/near-zero rates, one and fifty years, and upper bounds. Full self-funding and invalid-input cases passed. Existing example of 20.3 million yen, 1.3%, 35 years returns 60,186 yen/month. Chrome 320/390/768/1440px: no horizontal overflow; correct output, mode-specific fields, stale-result clearing and all four land/plan entry links passed. Source and dist link/metadata checks must be rerun after changes.

Deployment: `.mjs` files are included by the public build. Apache `.htaccess` declares their JavaScript MIME type; the local preview server does likewise. Use an HTTP preview (e.g. `npm.cmd run preview`), rather than opening the module-based page as a `file:///` URL. GitHub Pages supports the static calculator; Mailform Pro remains a separate server-only feature.

Design refinement: replaced the promotional headline with the page's direct function; reduced repetitive helper text; aligned desktop input rows; replaced the filled results box with a plain repayment ledger; placed detailed conditions below the calculator in a disclosure, with the basic calculation assumptions always visible. Kept the existing brown/white palette and serif type. Mobile and desktop output/mode checks passed after the refinement. The repayment formula is unchanged.
