# IRCTC eCatering APIs — Architecture & Integration Specification Notes

> **Document Type:** Technical Architecture & API Integration Blueprint  
> **Source Documentation:** [IRCTC eCatering Partner APIs (Theneo / Ipsator)](https://app.theneo.io/ipsator/irctc-ecatering-apis/general-guidelines)  
> **API Version:** `v3`  
> **Target Audience:** Backend Engineers, System Architects, Platform Developers & Admins  
> **Status:** Authoritative Reference for Platform Implementation  

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Global Guidelines, Environments & Authentication](#2-global-guidelines-environments--authentication)
3. [Rate Limits & Platform Quotas](#3-rate-limits--platform-quotas)
4. [Domain Business Logic, Rules & Operational Constraints](#4-domain-business-logic-rules--operational-constraints)
5. [Domain 1: Station Management APIs](#5-domain-1-station-management-apis)
6. [Domain 2: Outlet & FSSAI Application Lifecycle](#6-domain-2-outlet--fssai-application-lifecycle)
7. [Domain 3: Approved Outlet Management & Search Tags](#7-domain-3-approved-outlet-management--search-tags)
8. [Domain 4: Menu Items & Customisation Engine](#8-domain-4-menu-items--customisation-engine)
9. [Domain 5: Forward Order Flow (IRCTC → Aggregator)](#9-domain-5-forward-order-flow-irctc--aggregator)
10. [Domain 6: Reverse Order Flow (Aggregator → IRCTC)](#10-domain-6-reverse-order-flow-aggregator--irctc)
11. [Domain 7: Order Tracking, Status Updates & Webhooks](#11-domain-7-order-tracking-status-updates--webhooks)
12. [Domain 8: PNR & Train Route Operations](#12-domain-8-pnr--train-route-operations)
13. [Domain 9: Revolving Deposit Scheme (RDS)](#13-domain-9-revolving-deposit-scheme-rds)
14. [Domain 10: Feedback & Dispute Management](#14-domain-10-feedback--dispute-management)
15. [Domain 11: Large Aggregator Custom Interfaces](#15-domain-11-large-aggregator-custom-interfaces)
16. [Complete Implementation Checklist for our Platform](#16-complete-implementation-checklist-for-our-platform)

---

## 1. Executive Summary & System Architecture

IRCTC eCatering connects passengers traveling on Indian Railways trains with restaurant outlets at designated railway stations. Delivering food on a moving train involves constraints that do not exist in conventional home/office food delivery:
1. **Dynamic ETA/ETD**: Trains run early, on time, or delayed; platforms can change at short notice.
2. **Station Cutoffs**: Preparation and delivery must be scheduled around strict cutoff windows before the train's actual arrival.
3. **Regulatory Compliance**: All outlets must maintain valid FSSAI licenses (14 digits) and audit clearances. Outlets must be within **7,500 meters (7.5 km)** of the target railway station.
4. **Integration Directions**:
   - **Forward Order Integration**: Orders are placed on IRCTC website/app and forwarded to our aggregator/brand backend.
   - **Reverse Order Integration**: Available to high-volume partners (≥25,000 orders/month) who take orders on their own platform and sync with IRCTC.

```
                          ┌────────────────────────┐
                          │   IRCTC eCatering      │
                          │   Platform Backend     │
                          └───────────┬────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
       Forward Orders          Reverse Orders          Catalog & Ops
       (Webhooks / Push)       (Partner REST)          (REST / Webhooks)
               │                      │                      │
               ▼                      ▼                      ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                  OUR PLATFORM (OLF / ADMIN)                  │
    │  - Whitelisted Backend Server                                │
    │  - Real-time Webhook Receiver & Cutoff Engine                │
    │  - Multi-station Outlet & Menu Synchronizer                  │
    │  - Live Order State Machine & ETA Tracker                    │
    └──────────────────────────────────────────────────────────────┘
```

---

## 2. Global Guidelines, Environments & Authentication

### 2.1 Base URLs
- **Production Base URL:** `https://ecatering.irctc.co.in/api`
- **Stage / Sandbox Base URL:** `https://stage-ecatering.ipsator.com/api`

### 2.2 Server-to-Server Whitelisting Rule
> **CRITICAL SECURITY REQUIREMENT:**  
> All API requests **MUST** originate from our whitelisted server backend IP addresses. Client-side calls directly from web browsers or mobile apps to IRCTC APIs are strictly blocked and prohibited.

### 2.3 Authentication Header
Every outgoing HTTP request to IRCTC requires the secret API authorization token:
```http
Authorization: <auth_token>
Content-Type: application/json
```
- The token is a UUID string provided during onboarding (e.g. `1dcc0682-aa0a-4b64-8dda-b432aff45685`).
- Never expose this token in front-end code, client bundles, or public repositories.

---

## 3. Rate Limits & Platform Quotas

IRCTC enforces strict per-API-key rate limiting. Exceeding limits returns HTTP `429 Too Many Requests`.

| API Category | Rate Limit (per API Key) | Window | Burst Limit | Operational Directives |
| :--- | :--- | :--- | :--- | :--- |
| **Outlet APIs** | 50 requests | per minute | 10 req/sec | Application creation, updates, fetch, delisting |
| **Menu APIs** | 100 requests | per minute | 10 req/sec | Menu creation, updates, upserts, toggle |
| **PNR APIs** | 200 requests | per minute | 10 req/sec | Use only for authorised reverse orders |
| **Train Route APIs** | 200 requests | per minute | 10 req/sec | Route and station halt lookups |
| **ETA APIs** | **1 request per order** | **per 5 minutes** | — | **Strictly cached**; do not spam for same order |
| **Order Create API** | 60 requests | per minute | 5 req/sec | Applicable for reverse order flow |
| **Order Status & Updates** | 100 requests | per minute | 10 req/sec | Use webhooks for status updates instead of polling |

---

## 4. Domain Business Logic, Rules & Operational Constraints

### 4.1 Moving Train Delivery Challenges
- Train arrival time / delivery time fluctuates (delay or early arrival).
- Platform assignment is determined dynamically by railway authorities.
- Coach positions may not match physical platform coach indicator boards.
- Passengers may switch seats/coaches during journey.
- Passenger phone network connectivity can be spotty.

### 4.2 Cut-off Calculation Engine
Restaurants specify a **base cut-off time ($x$ minutes)** between **15 and 105 minutes**. The platform computes operational thresholds as follows:

| Cut-off Type | Threshold Calculation | Impact / Platform Action |
| :--- | :--- | :--- |
| **Outlet Cut-off Value** | $x$ minutes | Preparation time allocated to kitchen |
| **Customer Booking Cut-off** | $x$ minutes (or $x + 15$ min if Prepaid-only) | Beyond this window, outlet is hidden / orders rejected |
| **Customer Cancellation Cut-off** | $x + 10$ minutes | Passenger cannot cancel after this point |
| **Customer Payment Cut-off** | $x + 5$ minutes | COD orders cannot be switched to online payment after this point |

### 4.3 Outlet Modification Penalties
1. **FSSAI Number Change:** Modifying `fssaiNo` automatically triggers a brand new verification application. The outlet remains pending until railway verification officers approve it.
2. **GST / Charges Change:** Updating GST details or delivery/packaging charge tiers **instantly deactivates/disables the outlet** until vetted.
3. **Station Proximity:** Outlets must provide a verifiable distance within **7,500 meters (7.5 km)** of the station.

---

## 5. Domain 1: Station Management APIs

Large aggregators and brand partners can configure station visibility and service schedules.

### 5.1 Fetch Boarding Stations
- **Method & Endpoint:** `GET v3/train/boarding/stations`
- **Query Parameters:**
  - `trainNo` (string, required, e.g. `12807`)
  - `boardingDate` (string, `YYYY-MM-DD`, required, e.g. `2026-03-27`)
- **Behavior:** Returns only those stations along the train route where the partner has approved, active outlets.

### 5.2 List / De-List Station
- **Method & Endpoint:** `PATCH v3/vendor/station/{stationCode}/listing`
- **Request Body:**
  ```json
  {
    "listed": true
  }
  ```
- **Description:** Temporarily toggles visibility of the partner at that station without altering individual outlet master statuses.

### 5.3 Update Station Details & Schedules
- **Method & Endpoint:** `PATCH v3/vendor/station/{stationCode}/details`
- **Request Body:**
  ```json
  {
    "schedules": [
      {
        "startTime": "06:00",
        "endTime": "23:00"
      }
    ]
  }
  ```
- **Constraints:** Up to 20 daily schedule slots (`HH:mm` or `HH:mm:ss`).

---

## 6. Domain 2: Outlet & FSSAI Application Lifecycle

Every restaurant onboarded at a station starts as an **Application** undergoing multi-level IRCTC officer scrutiny.

### 6.1 Application State Lifecycle
```
[Application Submitted]
        │
        ▼
[DOCUMENT_UPLOAD_PENDING] ──(Partner uploads files/links)──► [APPROVAL_PENDING]
        │                                                          │
 (Can Delete / Patch)                                              ▼
                                                             [IN_PROGRESS]
                                                             (Level 1..N)
                                                            ┌──────┴──────┐
                                                            ▼             ▼
                                                       [APPROVED]    [REJECTED]
                                                            │       (Can reuse ID)
                                                            ▼
                                                     [Outlet Active]
```

### 6.2 Create Single Outlet Application
- **Method & Endpoint:** `POST v3/vendor/station/{stationCode}/outlet`
- **Headers:** `Authorization: <token>`, `Content-Type: application/json`
- **Path Param:** `stationCode` (e.g. `NDLS`)
- **Request Schema:**
  ```json
  {
    "id": "123EDEEE",
    "name": "Haldiram",
    "logoImage": "https://example.com/logo.png",
    "minOrderAmount": 200,
    "bookingCutoff": 60,
    "prepaid": true,
    "gstNo": "07RFTGR1245A1ZQ",
    "fssaiNo": "22021035590009",
    "fssaiValidUpto": "2029-06-23",
    "address": "Shop 4, Station Road, NDLS",
    "mealType": "PURE_VEG",
    "contact": {
      "email": "outlet@domain.com",
      "mobile": "9999999999"
    },
    "schedules": [
      {
        "startTime": "06:00",
        "endTime": "23:00"
      }
    ],
    "promotions": [
      {
        "requirement": {
          "type": "AMOUNT",
          "minimumOrderAmount": 500
        },
        "discount": {
          "type": "PERCENTAGE",
          "value": 10,
          "maxDiscount": 50
        }
      }
    ],
    "charges": [
      {
        "type": "DC",
        "tiers": [
          {
            "fee": 30,
            "amountMoreThan": 100
          }
        ]
      },
      {
        "type": "PC",
        "tiers": [
          {
            "fee": 15,
            "amountMoreThan": 0
          }
        ]
      }
    ]
  }
  ```
- **Validation Rules:**
  - `id`: Unique alphanumeric string within station (1–15 chars). Reusable after rejection.
  - `logoImage`: Regex-checked URL ending in `.webp`, `.png`, `.jpg`, `.jpeg`.
  - `minOrderAmount`: 0 to 500.
  - `bookingCutoff`: 15 to 105 minutes.
  - `fssaiNo`: Exactly 14 digits.
  - `mealType`: `PURE_VEG` or `VEG_AND_NON_VEG`.
  - `promotions`: Max 15% discount. For percentage discounts, `maxDiscount` cannot be lower than the discount at `minimumOrderAmount`.
  - `charges`: `DC` (Delivery Charge) and `PC` (Packaging Charge) with tier arrays (1–3 tiers).
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "New outlet application processed successfully.",
    "result": {
      "applicationId": 62754158,
      "outletId": "123EDEEE"
    }
  }
  ```

### 6.3 Document Upload APIs
Once created, status is `DOCUMENT_UPLOAD_PENDING`. Aggregators can supply documents in two ways:

#### Option A: Multipart File Upload
- **Method & Endpoint:** `POST v3/vendor/station/{stationCode}/outlet/{outletId}/uploadFiles`
- **Content-Type:** `multipart/form-data`
- **File limits:** Max 5MB per file. Accepted formats: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.webp`.
- **Form Fields:**
  - `fssai` *(Required)*: FSSAI certificate
  - `gst` *(Optional if not GST registered)*
  - `outletFacade` *(Front photo)*
  - `kitchen` *(Kitchen area photo)*
  - `takeawayOrDineIn` *(Takeaway/Dine-in area photo)*
  - `brand` *(Brand banner/image)*
  - `existingAggAgreement` *(Existing agreement copy)*
  - `auditReport` *(Audit report file — can replace Front/Kitchen/Takeaway photos)*
  - `other` *(Supporting files)*

#### Option B: JSON Document Links
- **Method & Endpoint:** `POST v3/vendor/station/{stationCode}/outlet/{outletId}/documents`
- **Content-Type:** `application/json`
- **Payload:**
  ```json
  {
    "distanceInMeters": 3500,
    "fssai": "https://storage.domain.com/fssai.pdf",
    "gst": "https://storage.domain.com/gst.pdf",
    "outletFacade": "https://storage.domain.com/facade.jpg",
    "kitchen": "https://storage.domain.com/kitchen.jpg",
    "takeawayOrDineIn": "https://storage.domain.com/dinein.jpg",
    "brand": "https://storage.domain.com/brand.jpg",
    "auditReport": null
  }
  ```
- **Constraint:** `distanceInMeters` must be $\le 7500$ (within 7.5 km).

### 6.4 Delete Application
- **Method & Endpoint:** `DELETE v3/vendor/station/{stationCode}/outlet/{applicationId}`
- **Constraint:** Allowed **only** when status is `DOCUMENT_UPLOAD_PENDING`. Renewal applications cannot be deleted.

### 6.5 Application Status Webhook
IRCTC pushes lifecycle state changes to the partner's registered webhook:
- **Method:** `POST` to Partner Callback URL
- **Payload Schema:**
  ```json
  {
    "event": "application.approved",
    "timestamp": "2025-01-01 13:21 IST",
    "status": "APPROVED",
    "applicationId": "65432345",
    "station": "NDLS",
    "outletId": "123EDEEE",
    "remarks": "Approved by DCM"
  }
  ```
- **Possible `event` values:**
  - `application.submitted`
  - `application.status.updated`
  - `application.approved`
  - `application.rejected`
- **Possible `status` values:**
  - `DOCUMENT_UPLOAD_PENDING`
  - `APPROVAL_PENDING`
  - `IN_PROGRESS`
  - `APPROVED`
  - `REJECTED`

---

## 7. Domain 3: Approved Outlet Management & Search Tags

Once an application is approved, the outlet becomes operational.

### 7.1 Patch Outlet
- **Method & Endpoint:** `PATCH v3/vendor/station/{stationCode}/outlet/{outletId}`
- **Usage:** Partially updates fields (`name`, `logoImage`, `minOrderAmount`, `bookingCutoff`, `contact`, `schedules`, `promotions`, `tags`, etc.).
- **Caution:** Changing `fssaiNo` triggers re-approval. Changing GST/charges deactivates the outlet.

### 7.2 List / Delist Outlet Availability
- **Method & Endpoint:** `PATCH v3/vendor/station/{stationCode}/outlet/{id}/listing`
- **Payload:**
  ```json
  {
    "listed": false,
    "remarks": "Temporarily closed for renovation"
  }
  ```
- **Behavior:** Stops bookings immediately. Does not alter administrative status (`ACTIVATED`/`DEACTIVATED`).

### 7.3 Outlet Status Change Webhook
- **Method:** `POST` to Partner Callback URL
- **Payload:**
  ```json
  {
    "event": "outlet.status.updated",
    "timestamp": "2025-01-01 13:21 IST",
    "status": "ACTIVATED",
    "station": "NDLS",
    "outletId": "123EDEEE",
    "remarks": "Outlet enabled"
  }
  ```
- **Statuses:** `ACTIVATED` or `DEACTIVATED`.

### 7.4 Supported Search Tags Reference (IDs 1–122)
The outlet `tags` field accepts an array of integer tag IDs:
```
1: Snacks, 2: South Indian, 3: Dosa, 4: Combo, 5: North Indian, 6: Thali, 7: Chinese, 8: Beverages, 9: Biryani, 10: Breakfast, 
11: Andhra, 12: Indian Chinese, 13: Punjabi, 14: Lassi, 15: Noodles, 16: Vada, 17: Cutlets, 18: Sandwiches, 19: Bengali, 20: Kerala, 
21: Maharashtrian, 22: Hyderabadi, 23: Pulao, 24: Soups, 25: Coffee, 26: Mughalai, 27: Starters, 28: Bakery, 29: Diet, 30: Khichdi, 
31: Salads, 32: Sweets, 33: Desserts, 34: Taste Of Bihar, 35: Rolls, 36: Chaats, 37: Gujrati, 38: Continental, 39: Grills, 40: Namkeens, 
41: Pizza, 42: Italian, 43: Samosa, 44: Sides, 45: Idli, 46: Marathi, 47: Tea, 48: Burgers, 49: American, 50: Fries, 
51: Kebabs, 52: Maggi, 53: Kachori, 54: Rajasthani, 55: Kathiyawadi, 56: Pastas, 57: Juices, 58: Tamil, 59: Halwa, 60: Malaysian, 
61: Jain, 62: Bowls, 63: Goan, 64: Odiya, 65: Vada Pav, 66: Malabari, 67: Tandoor, 68: Momos, 69: Mexican, 70: Chole Kulche, 
71: Cookies, 72: Wings, 73: Wraps, 74: Icecreams, 75: Tacos, 76: Awadhi, 77: Paan, 78: Cakes, 79: Pastries, 80: Thai, 
81: Sikkimese, 82: Chaap, 83: French, 84: Mongolian, 85: Lebanese, 86: Hot Dogs, 87: Haleem, 88: Tibetan, 89: Shawarma, 90: Quesadillas, 
91: Fast Food, 92: Lasagne, 93: Muffins, 94: Cheesecakes, 95: Sundae, 96: Mithai, 97: Milkshakes, 98: Steak, 99: Assamese, 100: Barbecue, 
101: Waffles, 102: Water, 103: Modak, 104: Train Friendly, 105: Navratri Special, 106: Sabudana Khichdi, 107: Sabudana Vada, 108: Vrat Thali, 
109: Navratri Sweets, 110: Navratri Beverages, 111: Train Friendly Railway Cutlet, 112: Train Friendly Chole Chawal, 
113: Train Friendly Dal Chawal, 114: Train Friendly Rice Bowls, 115: Diwali Special, 116: Rayalaseema, 117: Holi Special, 
118: Freedom Special, 119: Satvik Menu, 120: Diwali Sweets, 121: Diwali Thali, 122: Diwali Snacks
```

---

## 8. Domain 4: Menu Items & Customisation Engine

### 8.1 Menu Item Schema & Taxonomy
- **Item Identifier (`id`):** Alphanumeric string `[0-9a-zA-Z]{1,15}`, max 25 chars.
- **Name:** Alphanumeric with spaces `[0-9a-zA-Z ]{1,100}`.
- **Image URL:** Strict regex: must start with `https://`, have 2–5 domain segments, ending in `.png|.jpg|.jpeg|.webp`.
- **Item Type:** `VEG`, `NON_VEG`, `EGG`.
- **Tax Percentage:** Decimal representation (e.g. `0.05` for 5%, `0.12` for 12%, `0.18` for 18%).
- **Cuisine Enums:** `NORTH_INDIAN`, `SOUTH_INDIAN`, `PUNJABI`, `MUGHALAI`, `BENGALI`, `CHINESE`, `INDIAN_CHINESE`, `CONTINENTAL`, `ITALIAN`, `MEXICAN`, `GUJRATI`, `RAJASTHANI`, `MAHARASHTRIAN`, `HYDERABADI`, etc.
- **Food Type Enums:** `SNACKS`, `BREAKFAST`, `STARTERS`, `MAINS`, `MAINS_GRAVY`, `BREADS`, `THALI`, `COMBO`, `DESSERTS`, `SOUP`, `BEVERAGE`, `BIRYANI`, `PIZZA`, `BURGER`, `JAIN_FOOD`, etc.

### 8.2 Menu Customisation Hierarchy
Customisations support items like pizzas, combos, and add-ons:
1. **`ONE_LEVEL` Customisation:**  
   `customisation` $\rightarrow$ `variant` (e.g. Size: Regular, Medium, Large)
2. **`TWO_LEVEL` Customisation:**  
   `customisation` $\rightarrow$ `variant` $\rightarrow$ `option` (e.g. Crust type $\rightarrow$ Size $\rightarrow$ Extra cheese option)
3. **`customisationDefaultBasePrice`:** When customisations exist, this field represents the base price displayed on the menu list for the default selection.

### 8.3 Bulk Upsert Menu API (State Synchronization)
- **Method & Endpoint:** `POST v3/vendor/station/{stationCode}/outlet/{outletId}/menu/bulk/upsert`
- **Tri-State Logic:**
  - **Match found in payload:** Item updated and marked `active`.
  - **Not found in DB:** Item created and marked `active`.
  - **Exists in DB but absent from payload:** Item automatically **deactivated** from customer view.

---

## 9. Domain 5: Forward Order Flow (IRCTC → Aggregator)

The forward flow handles customer orders placed on IRCTC eCatering portal.

```
Passenger on IRCTC                     Our Platform (Aggregator)
       │                                         │
       ├─── 1. Real-time Order Push (POST /order) ─► [Store order as PENDING]
       │    (Masked Customer PII)                │
       │                                         │
       │◄── 2. Confirm / Cancel Callback ────────┤ [Accept or Cancel with remark]
       │    (POST v3/order/{id}/vendor/status)   │
       │                                         │
       │    [Train Approaches Cutoff Time]       │
       │                                         │
       ├─── 3. Final Order Submit ───────────────► [Receive Unmasked PII]
       │    (Unmasked PII, max 3 retries)        │  [Send to Kitchen / KDS]
       │                                         │
```

### Step 1: Real-Time Order Push (IRCTC → Aggregator Webhook)
- **Method:** `POST /order` (or Partner designated path)
- **PII Protection:** Customer mobile/email/name are masked (e.g. `XXXXXXX`).
- **Contains:** `orderId`, `bookingDate`, `deliveryDate`, `trainDetails` (`trainNo`, `trainName`, `coach`, `berth`), `stationCode`, `outletId`, `orderItems`, `priceDetails` (`totalAmount`, `totalMargin`, `deliveryCharge`, `packagingCharge`, `taxDetails`).

### Step 2: Order Confirmation Callback (Aggregator → IRCTC)
- **Method & Endpoint:** `POST v3/order/{orderId}/vendor/status`
- **Request Body for Confirmation:**
  ```json
  {
    "status": "ORDER_CONFIRMED",
    "remark": "NA"
  }
  ```
- **Request Body for Cancellation:**
  ```json
  {
    "status": "ORDER_CANCELLED",
    "remark": "BEYOND_SERVICE_HOUR"
  }
  ```
- **Valid Cancellation Remark Enums:**
  - `TRAIN_DELAYED`
  - `LAW_N_ORDER`
  - `NATURAL_CALAMITY`
  - `PASSENGER_JOURNEY_CANCELLED`
  - `BEYOND_SERVICE_HOUR`
- **Rule:** Forward orders can only be cancelled before confirmation and prior to dispatch time. Once confirmed, cancellation is locked.

### Step 3: Final Order Submit (IRCTC → Aggregator Webhook)
- **Timing:** Sent just before `ETA - outletCutoff` threshold.
- **Contents:** Authoritative, **unmasked** passenger contact information, finalized seat/berth numbers.
- **Retry Policy:** Up to 3 attempts. If all 3 fail, IRCTC auto-cancels the order with reason `cancelled due to push failure`.

---

## 10. Domain 6: Reverse Order Flow (Aggregator → IRCTC)

Authorized high-volume aggregators (≥25k orders/month) accept orders on their own apps and create orders in IRCTC.

### Step 1: Create Order on IRCTC
- **Method & Endpoint:** `POST v3/order/vendor`
- **Payload:** Aggregator order ID, customer details, train number, journey date, PNR, items, delivery date, station code, pricing.
- **Status:** Created as `PENDING`.
- **Mandate:** Must be invoked before showing final order confirmation to the customer on partner UI.

### Step 2: Confirm Order on IRCTC
- **Method & Endpoint:** `POST v3/order/vendor/status`
- **Payload:** Transitions order from `PENDING` to `CONFIRMED`.

---

## 11. Domain 7: Order Tracking, Status Updates & Webhooks

### 11.1 Real-Time Order ETA & Train Tracking
- **Method & Endpoint:** `GET v3/order/{orderId}/eta`
- **Rate Limit:** Strict **1 request per order per 5 minutes**.
- **Response Fields:**
  - Real-time train ETA & ETD
  - Platform number (live or estimated)
  - Train delay in minutes
  - Live data source vs cached data flag
  - Current PNR chart status, coach, and berth details

### 11.2 Order Fulfillment State Machine
Aggregators report operational milestones to IRCTC:
- **Method & Endpoint:** `POST v3/order/{orderId}/status`

```
[ORDER_CONFIRMED]
       │
       ▼ (After Cutoff, Before ETA)
[ORDER_PREPARING]
       │
       ▼ (After Cutoff, Before ETA)
[ORDER_PREPARED]
       │
       ▼ (After Cutoff, Before ETA) [Optional: deliveryPersonName, contact]
[ORDER_OUT_FOR_DELIVERY]
       │
       ├─────────────────────────────────────────┐
       ▼ (After ETA, OTP Mandatory)              ▼ (After ETA, OTP & items Mandatory)
[ORDER_DELIVERED]                         [ORDER_PARTIALLY_DELIVERED]
       │                                         │
       ▼ (After ETA, Remarks Mandatory)          ▼ (Before ETA, Remarks Mandatory)
[ORDER_UNDELIVERED]                       [ORDER_CANCELLED]
```

- **Validation Rules:**
  - `ORDER_DELIVERED`: Requires `otp` (4-digit number provided by passenger).
  - `ORDER_PARTIALLY_DELIVERED`: Requires `otp` and array of delivered `orderItems`.
  - `ORDER_UNDELIVERED`: Requires mandatory `remarks`.
  - `ORDER_CANCELLED`: Requires mandatory `remarks`.
  - `ORDER_OUT_FOR_DELIVERY`: Can include optional `deliveryPersonName` and `deliveryPersonContactNo`.
  - **Auto-Delivery Fail-Safe:** Any order without a terminal status on the delivery date is auto-marked as delivered by IRCTC unless a passenger dispute is logged.

### 11.3 Order Status Webhook (IRCTC → Aggregator)
- **Method:** `POST` to Partner Callback URL
- **Events:**
  - `order.status.updated`: System auto-delivered or administrative cancellation.
  - `order.refund.initiated`: Customer grievance resolution refund initiated.
  - `order.refund.processed`: Refund processed.

### 11.4 Order Verification API
- **Method & Endpoint:** `POST v3/order/verify/{orderID}`
- **Body:** `{ "orderAmount": 4016 }`
- **Purpose:** Cryptographically and financially validates that an order is authentic before fulfillment.

---

## 12. Domain 8: PNR & Train Route Operations

### 12.1 Fetch PNR Details
- **Method & Endpoint:** `GET v3/pnr/vendor?pnr={pnrNumber}`
- **Parameters:** `pnr` (10-digit numeric string).
- **Compliance Warning:** Allowed strictly for fulfilling authorized reverse orders. General scraping or misuse is punishable by API revocation.
- **Response:** Journey date, passenger coach/berth, train number, and **filtered list of stations** where the partner has active outlets.

### 12.2 Fetch Train Route
- **Method & Endpoint:** `GET v3/train/route/{trainNo}/{boardingStation}/{boardingDate}`
- **Path Parameters:**
  - `trainNo` (5 digits, e.g. `12963`)
  - `boardingStation` (e.g. `NZM`)
  - `boardingDate` (`YYYY-MM-DD`)
- **Response:** Complete sequence of stations, scheduled arrival/departure, halt duration, and distance.

---

## 13. Domain 9: Revolving Deposit Scheme (RDS)

Partners must maintain an active RDS deposit with IRCTC to offset margins, taxes, and customer compensations. If the balance falls below the threshold, outlets are delisted.

### 13.1 Fetch Current Closing Balance
- **Method & Endpoint:** `GET v3/payment/rds/vendor/balance`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "RDS balance fetched successfully",
    "result": {
      "currentBalance": 464688.19
    }
  }
  ```

### 13.2 Deposit Top-Up Request
- **Method & Endpoint:** `POST v3/payment/rds/vendor/deposit/request`
- **Request Body:**
  ```json
  {
    "amount": 50000.00,
    "depositDate": "2026-03-26 14:30",
    "depositBank": "State Bank of India",
    "depositRefNo": "UTR1982736451",
    "depositAccount": "12345678901",
    "remarks": "Monthly top-up for Station NDLS & BCT"
  }
  ```

---

## 14. Domain 10: Feedback & Dispute Management

### 14.1 Fetch Feedbacks
- **Method & Endpoint:** `GET v3/fedback/list` *(Note the API path spelling: `fedback`)*
- **Query Parameters:**
  - `page` (default `1`)
  - `size` (default `10`)
  - `complainFromDate` (`YYYY-MM-DD HH:mm IST`)
  - `complainToDate` (`YYYY-MM-DD HH:mm IST`)
  - `orderId`
  - `stationCode`
  - `rating` (1 to 5)
- **Response:** Star ratings, customer comments, complaint status, resolution status.

---

## 15. Domain 11: Large Aggregator Custom Interfaces

Large aggregators can host dedicated REST endpoints consumed directly by IRCTC in real time:

### 15.1 Real-Time Cart Validation (`cart/validate`)
Consumed by IRCTC before passenger completes checkout:
- **Request:** `cartId`, `stationCode`, `deliveryDate`, `outletId`, `items`, coupon codes.
- **Aggregator Response:** Validates item availability, re-calculates discounts, delivery charges, packaging charges, taxes, and final payable amount.

### 15.2 Real-Time Outlet & Menu Listing
Aggregator exposes live endpoints allowing IRCTC to pull inventory and dynamic pricing on the fly, with automated filtering based on RDS balances and operational delivery windows.

---

## 16. Complete Implementation Checklist for our Platform

| Domain | Architecture / Component | Implementation Requirement |
| :--- | :--- | :--- |
| **Infra** | **Server Whitelisting** | Configure static egress IP for backend servers; provide IP to IRCTC. |
| **Auth** | **Token Vault** | Secure `Authorization: <token>` injection in all outbound API requests. |
| **Rate Limit**| **Token Bucket Throttler**| Client-side rate limiter honoring 50/min (Outlets), 100/min (Menu), 200/min (PNR/Routes), 1 req/5 min (ETA). |
| **Cutoff** | **Scheduler Engine** | Dynamic cutoff calculator ($x$ base, $x+15$ prepaid, $x+10$ cancel, $x+5$ payment). |
| **Outlets** | **Application Flow** | Outlet builder with 14-digit FSSAI, 7.5 km distance validation, DC/PC charge tiers, schedule arrays. |
| **Outlets** | **Doc Manager** | Document upload engine supporting 5MB files (.jpg, .png, .pdf, .webp) or public CDN URLs. |
| **Outlets** | **Modification Rules** | Warning UI: changing FSSAI triggers re-approval; editing GST/charges disables outlet. |
| **Menu** | **Menu Sync Engine** | Tri-state bulk upsert pipeline (`insert` new, `update` existing, `deactivate` absent). |
| **Menu** | **Customisation Engine** | Support `ONE_LEVEL` and `TWO_LEVEL` variant options with `customisationDefaultBasePrice`. |
| **Orders** | **Webhook Ingress** | Secure endpoint for Real-Time Push (`POST /order`) and Final Submit (`POST /final-submit`). |
| **Orders** | **Retry & Idempotency** | Idempotency handler for Final Submit retries (up to 3 attempts with `retryCount`). |
| **Orders** | **State Machine** | Transition manager (`ORDER_PREPARING` $\rightarrow$ `ORDER_PREPARED` $\rightarrow$ `ORDER_OUT_FOR_DELIVERY` $\rightarrow$ `ORDER_DELIVERED` with OTP). |
| **Tracking** | **ETA Poller** | Train live tracking poller (strictly throttled to 1 request per order per 5 min). |
| **Finance** | **RDS Monitor** | Real-time closing balance alert trigger & top-up deposit request workflow. |
| **Feedback** | **Complaint Portal** | Feedbacks list viewer with date range and star rating filters. |

---

*Document compiled and verified against official IRCTC eCatering v3 Specifications.*
