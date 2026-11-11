# Zero Operations Hub — GitHub Pages Demo

This folder contains the static demo application for the ZDD end-to-end operations flow.

## Upload to GitHub

1. Create a new GitHub repository.
2. Upload all files in this folder, including `index.html`, the JavaScript and CSS files (including `icons.js`, `menu.js`, `menu.css`, `screens.css` and the `screens-*.js` files). Do not upload screenshots, and `.nojekyll`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder, then save.
6. Open the GitHub Pages URL shown by GitHub.

The application uses simulated data for demonstration. It does not connect to SAP, CAMSTAR, FSB, TIBCO, LTDS, GTDS, Blue Yonder, databases, or live AI services. TIBCO is shown as a probable event-middleware layer behind FSB because it was not explicitly labeled in the supplied diagrams; confirm its exact role before presenting it as a confirmed source.

## Included demo areas

- Operations overview dashboard
- End-to-end data journey
- Data processing and FSB events
- Lot explorer and lot journey
- AI predictions and model explanations
- Data monitoring
- Data quality checks
- Alarm center and resolution workflow
- Source system health
- Customer-facing process guide with small stage illustrations
- Application setup screen with source, mapping, checkpoint, quality, AI and alarm configuration
- Compact left menu: 11 items in 5 sections (one open at a time); related screens appear as tabs at the top of each page
- Quick finder (Ctrl/⌘ K or /) to jump to any page, lot, alarm, issue or system; Ask Zero side panel from the header
- Solution architecture screen mirroring the customer's numbered ZDD flow (components 1–10), plus a Master data screen
- Simple semiconductor-wafer example explaining where the platform is used and what problem it solves
- Live-data architecture explanation and TIBCO event-middleware note
- Business case, gap analysis report, design feasibility, MRAT/FMEA sign-off, and pilot-to-production rollout pages
- Configuration pages, reports, audit trail, and administration
- Customer problem framing screen before the business case
- Pipeline health with create-pipeline form and run action
- Data lineage with source-to-target handoff form
- Reconciliation with expected-versus-actual quantity and field checks
- Anomaly investigation queue with issue handoff
- Issue management with owner, priority and due-date entry
- Notification testing and delivery history
- Visible setup and source-connection forms; the walkthrough names the exact fields and buttons to use
- Sign-in screen, global search, inbox, executive summary and the Ask Zero AI assistant
- Wafer map viewer, shipment release gate, data freshness heatmap, failed events & replay, pipeline detail
- Products & routes, sites & stations, maintenance windows, AI model detail
- Shift handover, root cause & CAPA, issue detail, anomaly detail
- Customer scorecards (with customer detail), change approvals, evidence packs, scheduled reports
- Roles & permissions, integrations & API, security & retention, my profile, help & release notes

The screens are designed as the intended operational application surface. The included records and actions are local sample records, so no external system is changed by this package.
