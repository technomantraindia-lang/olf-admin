# OLF & IRCTC Integration Quick Notes: Outlets & Applications

A developer and admin cheat-sheet summarizing key concepts, workflows, and rules for **New Outlet / FSSAI Renewal Application** and **Outlet Operations**.

---

## Part 1: New Outlet / FSSAI Renewal Application

### 1. Core Purpose
* **What is it for?** Getting a brand new station restaurant approved on IRCTC, or renewing an existing outlet's expired FSSAI food license.
* **Key Rule:** An outlet can **never** start taking railway food orders directly upon creation. It must pass through the **Pending Outlets** review stage and receive approval from the IRCTC Corporate Office.

### 2. The 4-Step Approval Lifecycle

| Step | Action | Status on Dashboard | Who Does It? |
| :--- | :--- | :--- | :--- |
| **Step 1** | OLF Backend pushes basic restaurant details via API (`POST /v3/vendor/station/{code}/outlet`). | Request Created | OLF Backend |
| **Step 2** | Outlet appears under the **Pending Outlets** section. | `Document upload pending` (Red badge) | IRCTC System |
| **Step 3** | Upload the required compliance documents & kitchen photos. | `Approval pending` (Blue badge) | OLF Admin / Vendor |
| **Step 4** | Corporate office inspects kitchen photos and documents. | `Approved` (Green) or `Rejected` | IRCTC Corporate Office |

### 3. The 7 Mandatory Documents for New Outlets
When registering a new outlet, all 7 documents/photos must be submitted before IRCTC begins inspection:
1. **Outlet Front Image:** Clear photo of the restaurant exterior showing the shop board / signage.
2. **Kitchen Area Image:** Photo of the cooking area to verify hygiene standards.
3. **Takeaway / Dine-in Area Image:** Photo of packaging and food handover counters.
4. **Other Images:** Any supplementary kitchen/storage photos (Optional).
5. **FSSAI License:** Valid food safety registration certificate.
6. **GST Certificate:** 15-digit GST registration certificate.
7. **PAN Card:** Business entity PAN card.

*Note for FSSAI Renewal:* Only **1 document** (the renewed FSSAI certificate) is required.

### 4. Special FSSAI Renewal Rule (Important!)
* **Instant Deactivation:** As soon as an FSSAI renewal request is submitted for an existing active outlet, the outlet is **immediately deactivated / de-listed** to prevent compliance violations.
* **Auto-Activation:** As soon as IRCTC approves the renewed certificate, the outlet **automatically becomes active** again without manual re-listing.

### 5. Pending Outlets Table Structure (5 Columns)
1. **Outlet:** Outlet Name + Station Code + Outlet ID (Hyperlinked; opens details and document links popup).
2. **Vendor:** Aggregator Name & Aggregator ID (OLF details).
3. **Status:** Current stage (`Document upload pending`, `Approval pending`, `Approved`, `Rejected`) with timestamp.
4. **Actions:** `Upload Documents` button (disappears once submitted).
5. **History:** `History` button (opens audit log showing who approved/rejected and when).

---

## Part 2: Outlet Module (Daily Operations & Management)

### 1. Core Purpose
* **What is it for?** Managing, modifying, and controlling approved outlets that are already live on the railway network.

### 2. Summary of the 6 Main API Operations

| # | Endpoint / Operation | HTTP Method | What It Does (Simple Meaning) |
| :---: | :--- | :---: | :--- |
| **1** | **Patch Outlet** | `PATCH` | **Small Specific Edits:** Updates only selected fields (like changing minimum order amount from ₹100 to ₹250, or updating phone number) without touching the rest of the data. |
| **2** | **Update Outlet** | `PUT` | **Full Profile Update:** Replaces the entire outlet profile with a fresh form submission. |
| **3** | **Update Multiple Outlets** | `PUT` | **Bulk Update:** Updates 10–20 outlets at a single railway station in one API call. |
| **4** | **Fetch Outlet** | `GET` | **Data Inspection:** Retrieves current outlet configurations and cutoff settings stored on IRCTC. |
| **5** | **List / De-list Outlet** | `PATCH` | **Kitchen Shutter Toggle:** Temporarily opens or closes the outlet on the IRCTC passenger app with a reason string. |
| **6** | **Outlet Status Webhook** | `POST` | **Automatic IRCTC Alert:** Received when IRCTC activates, deactivates, or suspends an outlet. |

### 3. Kitchen Emergency Protocol (List / De-list)
* **Problem:** Kitchen runs out of gas/ingredients, or kitchen closes for the night, but the outlet still shows "Active" on the IRCTC passenger app.
* **Solution (Toggle OFF):**
  * Admin / Vendor flips the live toggle switch to **OFF**.
  * OLF Backend calls `PATCH /v3/vendor/station/{stationCode}/outlet/{id}/listing` with:
    `{"listed": false, "remarks": "Kitchen equipment maintenance"}`
  * The restaurant vanishes from the IRCTC passenger app in real time; zero new orders can be placed.
* **When Resolved (Toggle ON):**
  * Switch is flipped back to **ON**.
  * OLF Backend calls the same endpoint with:
    `{"listed": true, "remarks": "Kitchen operational"}`
  * The outlet instantly reappears on the passenger app.

---

## Part 3: Architecture & Admin Panel Mapping for OLF

### 1. Admin Panel Sidebar Tabs
* **`Pending Outlets`:** Displays onboarding requests waiting for document uploads or IRCTC approval.
* **`Active Outlets` / `All Outlets`:** Displays approved outlets currently serving passengers, equipped with the live listing toggle switch.
* **`Inactive Outlets` / `Closed Outlets`:** Displays temporarily closed outlets (due to kitchen pauses, night closures, or pending FSSAI renewals).
* **`Prepaid Outlets`:** Outlets that accept only online prepaid orders (eligible for an additional +15 minute booking cutoff window on IRCTC).

### 2. Backend Key Responsibilities
* Securely store IRCTC `auth_token` in `.env` (never expose to React frontend).
* Map internal OLF outlet IDs to IRCTC `outletId` upon receiving the approval webhook.
* Ensure all outgoing API calls originate from the whitelisted static server IP.
