# OLF Stores Admin Dashboard — UI/UX and Functional Specification

**Document type:** Frontend implementation specification  
**Project:** OLF Stores Admin Panel  
**Scope:** Dashboard homepage only  
**Frontend stack:** React + Vite + JavaScript (JSX) + Tailwind CSS v4 + React Router + Lucide React  
**Future backend:** Node.js + Express.js  
**Future database:** PostgreSQL  
**Status:** Planning document for implementation in Antigravity

---

## 1. Purpose

This document defines what the OLF Stores admin dashboard should show, how the page should be organized, which information matters most, and how the dashboard should behave.

The current dashboard is a demo and includes several useful existing items: today's orders, all-time orders, revenue, customers, outlet counts, scheduled closures, deleted outlets, order analytics, revenue analytics, and customer rating metrics. The redesign should preserve useful business information while making the interface cleaner, easier to scan, and more operationally useful.

The dashboard must answer these questions quickly:

1. How many orders have arrived in the selected time range?
2. How many came from IRCTC e-Catering versus OLF's own website/app?
3. What is the current order trend?
4. What is the revenue or order value for the selected period?
5. How healthy is the outlet network?
6. Which railway stations are receiving the most orders?
7. Which recent orders need attention?

The goal is **clarity, not maximum card count**. Avoid turning the dashboard into a wall of metrics.

---

## 2. Business context

OLF receives orders from different channels. The two key source groups for the dashboard are:

- **IRCTC e-Catering:** orders originating from IRCTC.
- **OLF Website/App:** orders originating from OLF's own channels.

A future OLF mobile app may be included under OLF's own channel group, depending on the business's final source-tracking rules.

Orders will eventually be received and processed through the backend. The dashboard will read verified records from the backend when integration is implemented. For now, use mock data and label it as demonstration data.

### Important boundaries

- The dashboard UI is not the Orders Management module.
- Do not implement IRCTC API integration in this phase.
- Do not claim mock figures are real production data.
- Do not calculate actual vendor earnings from invented rules.
- Do not treat gross order value, revenue, vendor earnings, and settlement amounts as interchangeable.
- Outlet delivery partners are managed by the outlets themselves, not centrally by OLF.
- Vendor management and station-first outlet management belong to the Outlets module, not this dashboard.

---

## 3. Technology and implementation constraints

Use:

- React with Vite
- JavaScript and JSX only
- Tailwind CSS v4
- React Router DOM
- Lucide React icons

Future architecture:

- Node.js + Express.js REST API
- PostgreSQL database

For this dashboard phase:

- No TypeScript.
- No MongoDB.
- No Express server.
- No PostgreSQL connection.
- No real authentication.
- No real IRCTC integration.
- No actual payment, payout, or wallet actions.
- Use mock data from a clearly separated data module.
- Keep components reusable and prepare data access for future API integration.
- Do not add libraries unless they are genuinely needed.

---

## 4. Dashboard page structure

Use a clean light theme with a clear visual hierarchy. Recommended desktop layout:

1. Sidebar navigation.
2. Header with page title, date range selector, notification icon, and admin profile.
3. Four primary KPI cards.
4. One compact outlet-health metrics row.
5. Two main visual analytics panels.
6. A lower row containing Recent Orders and Top Stations.
7. Optional secondary information such as customer ratings only if real data is available and the section adds value.

On mobile, stack the panels vertically. Do not squeeze desktop tables or charts into unreadable narrow columns.

### Visual direction

- White cards on a light grey page background.
- Dark slate text.
- Subtle borders and restrained shadows.
- Consistent spacing and card heights.
- Green for positive/active states.
- Blue for IRCTC order data.
- Orange for OLF-originated order data.
- Red for errors, cancellations, and destructive states.
- Neutral grey for inactive or informational data.
- Use consistent status badges and icon sizes.
- Use charts only where they communicate a useful comparison.
- Avoid excessive gradients, large decorative illustrations, gratuitous animations, and oversized cards.
- Ensure accessible contrast and visible keyboard focus states.

---

## 5. Header and global controls

The dashboard header should contain:

- Page title: **Dashboard**
- Supporting description: **Overview of orders, outlets and business performance**
- Date range selector
- Notification icon
- Admin profile dropdown

### Date range selector

Provide options such as:

- Today
- Last 7 Days
- Last 30 Days
- All Time

The chosen period should update the order and revenue analytics and any time-sensitive KPI that is explicitly defined to follow the selected range.

Do not make every metric change silently. Clearly distinguish between:

- **Period metrics:** values for the selected date range.
- **Current-state metrics:** current counts of active outlets, pending outlets, etc.
- **All-time metrics:** totals accumulated since the platform began.

If the UI includes a date range that cannot be supported by the mock data, show a reasonable empty state rather than fabricated trends.

---

## 6. Primary KPI cards

Show four primary cards, in this order:

### 6.1 Total Orders

Display:
- Total number of orders in the selected time range.
- Optional comparison with the previous equivalent period, only if comparison data exists.

Purpose: quick overall order-volume indicator.

### 6.2 Orders from IRCTC

Display:
- Count of orders whose recorded source is IRCTC e-Catering.
- Percentage of all orders in the selected range.

Purpose: measure IRCTC-originated volume.

### 6.3 Orders from OLF

Display:
- Count of orders from OLF's own website/app channels.
- Percentage of all orders in the selected range.

Purpose: distinguish OLF-originated orders from IRCTC orders.

### 6.4 Revenue

Display:
- The selected period's revenue only if the business has defined what “revenue” means.
- Optional change versus the previous period only if the necessary data exists.

Purpose: show financial performance without misleading the administrator.

### KPI calculation rules

For a selected period:

- `totalOrders = irctcOrders + olfOrders` if these are the only supported source categories and every order has exactly one source.
- `irctcShare = irctcOrders / totalOrders * 100`, when totalOrders is greater than zero.
- `olfShare = olfOrders / totalOrders * 100`, when totalOrders is greater than zero.
- Avoid division by zero; show `0%` or an appropriate empty state.
- Use one consistent order inclusion rule across cards and charts. For example, specify whether cancelled orders are included in total orders and use the same rule everywhere.

Do not hardcode inconsistent card values.

### Source labels

Use these exact readable labels:
- `IRCTC e-Catering`
- `OLF Website/App`

If the OLF mobile app is not yet live, it may be shown under the planned OLF channel group in mock data, but do not imply that the app is already live in production.

---

## 7. Outlet-health metrics

Below the four primary KPI cards, show a compact row of five metrics:

1. Total Outlets
2. Active Outlets
3. Pending Outlets
4. Inactive Outlets
5. Closed Outlets

These are current-state counts, not date-range order metrics.

### Status definitions

Keep the statuses separate:

- **Active:** enabled for business according to OLF's eventual confirmed rules.
- **Pending:** awaiting approval or required onboarding steps.
- **Inactive:** disabled or not currently enabled on the platform.
- **Closed:** marked as closed, temporarily or permanently, according to the confirmed operational model.
- **Archived/Deleted:** removed from normal operating lists.

Archived/deleted outlets should not take up a primary dashboard KPI card. They remain accessible in the Outlets module.

Do not count one outlet in multiple mutually exclusive status totals. If the business later distinguishes operational status from approval status, model these as separate fields and define the dashboard aggregation rules explicitly.

The current screenshot uses the label “Scheduled Close.” Preserve this metric only if it represents a confirmed, actively used status. Otherwise, replace it with a clearly defined status such as “Pending Outlets” or “Closed Outlets.” Do not silently invent what “Scheduled Close” means.

---

## 8. Analytics panel A — Orders by Source

Create a donut chart or another compact visualization comparing:

- IRCTC e-Catering
- OLF Website/App

Display:
- Total orders in the chart centre.
- Count for each source.
- Percentage share for each source.
- A small date-range control if it is useful and does not conflict with the global range selector.

### Interaction

Changing the global date range should update this chart.

Use blue for IRCTC and orange for OLF, consistently across all charts and legends.

The legend must remain readable without relying on color alone.

Do not add a chart if data is empty; show a clean empty state.

---

## 9. Analytics panel B — Order Trend

Create a line chart showing daily order counts over the selected time range.

Series:
- IRCTC e-Catering
- OLF Website/App

Requirements:
- Clear chart title and subtitle.
- Readable date labels.
- Legend.
- Tooltips or accessible value details where supported.
- Consistent series colors.
- Responsive chart sizing.
- Empty state if no records exist.

The chart should make it easy to see which source is driving order volume and how volume changes over time.

Do not fabricate trends that are presented as real. Mock data is allowed during development, but it must be clearly identified as illustrative.

---

## 10. Recent Orders panel

Show a compact table with the latest orders from all supported sources.

Recommended columns:
- Order ID
- Source
- Station
- Outlet
- Amount
- Status
- Time

Requirements:
- Show a manageable number of recent records, such as five.
- Clearly label each order source.
- Use readable status badges.
- Include a **View All Orders** link that navigates to the Orders module placeholder.
- Do not implement the full Orders module in this dashboard task.
- Do not implement order acceptance, rejection, assignment, dispatch, delivery tracking, or order-status mutations.
- Do not invent passenger personal information if it is not needed for this summary.

### Mock data rules

Use clearly fictional demonstration order IDs and sample records.

Each mock order should have:
- Unique ID.
- Source.
- Station reference.
- Outlet reference.
- Amount.
- Status.
- Creation timestamp.

Ensure referenced stations and outlets exist in the mock data where possible.

The amount must be labeled as order amount or order value unless the business definition of revenue is confirmed.

---

## 11. Top Stations panel

Create a compact ranked list of the five railway stations with the most orders in the selected date range.

For each station, display:
- Rank
- Station code
- Station name
- Order count
- Small horizontal progress bar

Requirements:
- Derive ranking from the same mock order dataset used by other dashboard panels.
- Respect the selected date range.
- Use consistent sorting.
- Provide a **View All** link to the Railway Stations or station-wise outlet page placeholder.
- Show an empty state if there are no matching orders.

Do not hardcode station rankings independently of the order data.

The exact destination route can be adjusted to match the implemented route structure.

---

## 12. Revenue definition and financial accuracy

Revenue must not be confused with total order value or vendor earnings.

Before the production backend is connected, label mock financial values as illustrative.

The final business definition must be confirmed with OLF. Potentially different concepts include:

- Gross order value: total value of orders.
- Platform revenue: the amount OLF earns under its commercial model.
- Vendor earnings: the amount attributable to the vendor after applicable deductions.
- Settled amount: money already paid.
- Pending settlement: money payable but not yet settled.

Do not assume a commission rate, fee, refund formula, tax treatment, or settlement model.

If the correct revenue source is not available, show “Revenue data not connected” or another clear placeholder rather than an invented production value.

If revenue by source is added later, calculate it from verified transactions and the agreed definition. Do not assume the entire order amount is platform revenue.

---

## 13. Customer rating metrics

The old dashboard includes a Customer Rating Metrics section.

Do not remove it without checking whether rating data is actually available and useful.

Recommended behavior:
- If verified rating data exists, display a compact section near the bottom of the dashboard.
- If ratings are not available, omit the section from the main dashboard or show a discreet “Not connected” placeholder.
- Do not use a large empty panel.
- Do not invent average ratings or review counts.

---

## 14. Items to remove or move out of the main dashboard

To keep the homepage focused:

- Remove “Coming Soon” KPI cards such as “Most complaints on,” “Most ordered from,” and “Top rated restaurant” from the primary KPI area.
- Move Deleted/Archived Outlets into the Outlets module rather than emphasizing them on the homepage.
- Avoid showing the same outlet metrics in several large sections.
- Avoid duplicate date controls if the global date range is sufficient.
- Avoid empty charts that take up large amounts of space.
- Keep secondary operational metrics below the main order and source analytics.

Existing useful functions such as export actions should be retained only where they are functional and useful. Do not display fake export buttons.

---

## 15. Recommended layout

### Desktop layout

**Header**
- Dashboard title and subtitle
- Global date range
- Notifications and profile

**Row 1 — Four primary KPI cards**
- Total Orders
- Orders from IRCTC
- Orders from OLF
- Revenue

**Row 2 — Compact outlet-health metrics**
- Total Outlets
- Active
- Pending
- Inactive
- Closed

**Row 3 — Two analytics panels**
- Orders by Source donut chart
- Order Trend line chart

**Row 4 — Operational panels**
- Recent Orders table
- Top Stations ranking

**Row 5 — Optional secondary section**
- Customer Rating Metrics, only if useful and supported by data

### Responsive behavior

- Desktop: use a balanced grid with two main chart panels side by side.
- Tablet: reduce the number of columns and stack sections as needed.
- Mobile: stack cards and panels vertically.
- Tables may scroll horizontally, but must not cause the whole page layout to overflow.
- Sidebar becomes a mobile drawer.
- Filters and actions must remain accessible.

---

## 16. Navigation and sidebar preservation

Preserve the existing OLF navigation structure:

- Dashboard
- Orders
- Outlets
- Withdraw Requests
- Railway Stations
- Queries
- Human Resources
- Blogs
- Complaints
- Invoices
- Reports

Use expandable groups where appropriate.

The redesign is not permission to remove business modules from the sidebar. The dashboard page may link to these modules, but the modules themselves can remain placeholders until their separate implementation phases.

Keep the OLF brand and overall visual identity recognizable while improving spacing, typography, active navigation states, and icon consistency.

---

## 17. Mock data architecture

Keep mock data separate from components.

Suggested files:
- `src/data/mockOrders.js`
- `src/data/mockStations.js`
- `src/data/mockOutlets.js`
- `src/data/mockDashboard.js` only for data that cannot be derived from the underlying records

Use shared selectors/helpers to derive:
- Order totals by source.
- Source percentages.
- Order counts by date.
- Outlet status totals.
- Top stations by order count.
- Recent orders.
- Revenue summaries only when the mock financial model is explicitly defined.

Do not duplicate summary numbers in multiple components.

All cards and charts that describe the same metric should derive from a consistent dataset and common calculation rules.

Prepare a small service abstraction so the mock implementation can later be replaced with Express API calls.

Do not connect the database or IRCTC API in this phase.

---

## 18. Suggested component structure

Adapt to the existing project structure if one already exists. If starting from an empty folder, use a structure similar to:

```text
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── AdminLayout.jsx
│   ├── dashboard/
│   │   ├── DashboardHeader.jsx
│   │   ├── DateRangeSelector.jsx
│   │   ├── MetricCard.jsx
│   │   ├── OutletHealthMetrics.jsx
│   │   ├── OrdersBySourceChart.jsx
│   │   ├── OrderTrendChart.jsx
│   │   ├── RecentOrdersTable.jsx
│   │   ├── TopStations.jsx
│   │   └── CustomerRatingMetrics.jsx
│   └── ui/
│       ├── StatusBadge.jsx
│       ├── EmptyState.jsx
│       └── LoadingState.jsx
├── data/
│   ├── mockOrders.js
│   ├── mockStations.js
│   ├── mockOutlets.js
│   └── mockDashboard.js
├── pages/
│   ├── Dashboard.jsx
│   └── ComingSoon.jsx
├── routes/
│   └── AppRoutes.jsx
├── services/
│   └── dashboardService.js
├── utils/
│   ├── formatCurrency.js
│   ├── formatDate.js
│   └── dashboardSelectors.js
├── App.jsx
├── main.jsx
└── index.css
```

Use a charting library only if necessary and keep it consistent. If a charting library is already installed, reuse it. Otherwise, choose a suitable lightweight React chart library only if it materially improves the result. Do not create charts with arbitrary CSS shapes that misrepresent data.

---

## 19. Interaction requirements

Implement:
- Global date range selection.
- Dynamic KPI calculations from mock data.
- Source percentages.
- Source donut chart.
- Order trend chart.
- Recent-order display.
- Top-station ranking.
- Working navigation links to relevant module routes/placeholders.
- Responsive sidebar.
- Functional notifications/profile menus only to the extent appropriate for a frontend prototype.
- Empty states for missing data.

For export controls:
- Include only if the export actually works.
- If included, export the visible or selected dataset to CSV.
- Do not show an export button that does nothing.

For all unavailable backend-driven actions, show a clear non-misleading placeholder.

---

## 20. Accessibility and quality requirements

- Use semantic HTML.
- Label inputs and selectors.
- Ensure keyboard accessibility.
- Add visible focus states.
- Maintain readable contrast.
- Do not use color as the only status indicator.
- Use accessible labels for icon-only controls.
- Ensure charts have titles and useful textual summaries.
- Avoid horizontal page overflow.
- Avoid console warnings and errors.
- Use consistent formatting for dates, counts, percentages, and INR values.

---

## 21. Future backend integration

The planned architecture is:

React Admin Panel → Node.js + Express.js API → PostgreSQL

Future order integration may receive orders from IRCTC e-Catering and OLF's own channels.

The dashboard should eventually consume verified backend data for:
- Orders by source.
- Order status counts.
- Revenue.
- Station rankings.
- Outlet status.
- Customer ratings, if available.

Do not implement the future backend now.

Do not invent the IRCTC API contract, endpoint behavior, webhook model, authentication credentials, order routing rules, or financial formulas.

The dashboard is a read-only overview. Actual order management will be developed separately in the Orders module.

---

## 22. Implementation sequence

1. Inspect the current project and preserve working files if present.
2. If the project is empty, initialize Vite with React and JavaScript.
3. Configure Tailwind CSS v4 and React Router.
4. Build the shared admin layout and preserve the sidebar navigation.
5. Create centralized mock orders, stations, and outlets.
6. Implement data selectors and consistent KPI calculations.
7. Build the four primary KPI cards.
8. Build the compact outlet-health row.
9. Build Orders by Source and Order Trend charts.
10. Build Recent Orders and Top Stations.
11. Keep customer rating metrics only if appropriate.
12. Implement date-range interactions.
13. Make the page responsive.
14. Run the app and fix build errors, route errors, console errors, and layout issues.

Do not stop after producing a static visual mockup. Implement the described frontend interactions using the mock data.

---

## 23. Final acceptance checklist

The dashboard is complete when:

- The app starts successfully.
- The existing OLF sidebar structure is preserved.
- The page is cleaner and less cluttered than the demo.
- Total Orders, IRCTC Orders, OLF Orders, and Revenue are clearly visible.
- Outlet-health metrics are available without dominating the page.
- Orders by Source is visually understandable.
- The Order Trend chart compares IRCTC and OLF.
- Recent Orders shows source, station, outlet, amount, status, and time.
- Top Stations is derived from the same order data.
- The global date range updates applicable metrics and charts.
- All related metrics use consistent calculations.
- Revenue is not confused with gross order value or vendor earnings.
- “Coming Soon” KPI cards are removed from the primary dashboard.
- Customer rating information is shown only when useful and supported.
- The layout works on desktop, tablet, and mobile.
- No fake backend integration or production data is claimed.
- No TypeScript, MongoDB, or backend/database implementation is introduced.
- All visible controls work or clearly indicate that they are placeholders.
- No console errors remain.

## Final instruction

Implement the dashboard as a focused operational overview, not as a collection of unrelated metric cards.

Preserve useful existing OLF functionality, clearly compare orders from IRCTC and OLF, show outlet health compactly, and make recent orders and top stations easy to scan.

Use realistic mock data for development, keep all calculations consistent, and prepare the frontend for later Express.js and PostgreSQL integration.
