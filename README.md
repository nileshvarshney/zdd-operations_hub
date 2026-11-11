# Zero Operations Hub — GitHub Pages Demo

This folder contains the static demo application for the ZDD end-to-end operations flow.

## Upload to GitHub

1. Create a new GitHub repository.
2. Upload all files in this folder, including `index.html`, the JavaScript and CSS files (including `icons.js`), and `.nojekyll`.
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
- Foldable, grouped left navigation with consistent line icons and a collapsed icon rail
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

The screens are designed as the intended operational application surface. The included records and actions are local sample records, so no external system is changed by this package.
