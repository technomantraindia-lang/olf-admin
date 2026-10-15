# IRCTC eCatering APIs: Master Endpoints Reference

A comprehensive, categorized developer reference of **all endpoints** documented in the IRCTC eCatering v3 API specification, complete with HTTP methods, paths, and short technical descriptions.

---

## 1. Environments & Base URLs

* **Staging (Testing Sandbox):** `https://stage-ecatering.ipsator.com/api`
* **Production (Live Rail Network):** `https://ecatering.irctc.co.in/api`
* **Authentication Header:** `Authorization: <auth_token>`
* **Content-Type:** `application/json`

---

## 2. New Outlet / FSSAI Renewal Application Module

Used for onboarding new station restaurants and renewing expired FSSAI food licenses through IRCTC's compliance approval hierarchy.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `POST` | `/v3/vendor/station/{stationCode}/outlet` | **Create Application:** Submits a new outlet application for a specific station. |
| `POST` | `/v3/vendor/station/{stationCode}/outlets` | **Create Multiple Applications:** Bulk registers multiple outlet applications for a station in one call. |
| `PATCH` | `/v3/vendor/application/{applicationId}` | **Patch Application:** Updates specific fields (e.g., manager contact, cutoff time) of a pending application. |
| `PUT` | `/v3/vendor/application/{applicationId}` | **Update Application:** Replaces the full application form payload. |
| `POST` | `/v3/vendor/application/{applicationId}/documents` | **Upload Documents:** Multipart binary upload for the 7 required compliance photos/PDFs. |
| `POST` | `/v3/vendor/application/{applicationId}/document-links` | **Add Document Links:** Attaches externally hosted cloud URLs (e.g. S3 links) to the application. |
| `DELETE` | `/v3/vendor/application/{applicationId}` | **Delete Application:** Withdraws or cancels an unapproved application. |
| `GET` | `/v3/vendor/application/{applicationId}` | **Fetch Application:** Checks current review stage, inspector remarks, and approval progress. |
| `POST` | `/path` *(OLF Webhook)* | **Application Status Webhook:** IRCTC pushes status updates (`application.submitted`, `application.status.updated`, `application.approved`, `application.rejected`). |

---

## 3. Outlet Operations & Management Module

Used for daily operations, timing changes, and emergency closures of already approved outlets.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `GET` | `/v3/vendor/station/{stationCode}/outlet/{id}` | **Fetch Outlet:** Retrieves current outlet details, cutoff values, and settings stored on IRCTC. |
| `PATCH` | `/v3/vendor/station/{stationCode}/outlet/{outletId}` | **Patch Outlet:** Updates selected outlet parameters (min order value, logo, prep cutoff) without touching other data. |
| `PUT` | `/v3/vendor/station/{stationCode}/outlet` | **Update Outlet:** Full replacement of an approved outlet's operational profile. |
| `PUT` | `/v3/vendor/station/{stationCode}/outlet/bulk` | **Update Multiple Outlets:** Bulk updates multiple outlets across a railway station simultaneously. |
| `PATCH` | `/v3/vendor/station/{stationCode}/outlet/{id}/listing` | **List / De-list Outlet:** Emergency toggle (`listed: true/false`). Instantly opens or hides outlet on passenger app with a reason. |
| `POST` | `/path` *(OLF Webhook)* | **Outlet Status Webhook:** IRCTC pushes alerts when an outlet is `ACTIVATED`, `DEACTIVATED`, or `SUSPENDED`. |

---

## 4. Menu Item Module (Food Catalog & Stock Control)

Used for uploading food dishes, updating rates, setting dietary classifications, and toggling dishes out of stock.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `GET` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu` | **Fetch Menu:** Downloads the complete active menu card (dishes, prices, taxes) of an outlet at a station. |
| `POST` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu` | **Create Menu Item:** Adds a single new dish with base price, GST tax percentage, and Veg/Jain tags. |
| `PATCH` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/{itemId}` | **Patch Menu Item:** Partially updates an existing dish (e.g. changing price from ₹200 to ₹220). |
| `PUT` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/{itemId}` | **Update Menu Item:** Completely replaces all attributes of an existing dish. |
| `POST` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/bulk` | **Create Multiple Items:** Bulk uploads 10–50 new dishes in one single API call. |
| `PUT` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/bulk` | **Update Multiple Items:** Bulk updates existing dishes in an array. |
| `POST` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/upsert` | **Upsert Menu Items:** Smart Sync endpoint. Inserts new dishes and updates existing dishes in a single call. |
| `PATCH` | `/v3/vendor/station/{stationCode}/outlet/{id}/menu/{itemId}/status` | **Enable / Disable Item:** Sold-Out toggle (`status: "DISABLED"` / `"ENABLED"`). Hides dish from passenger app without deleting it. |

---

## 5. Forward Order Module (IRCTC Marketplace to OLF)

Used when train passengers order on the official IRCTC eCatering app and OLF outlets fulfill the order at the railway station.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `POST` | `/order` *(OLF Webhook)* | **Real-Time Submit:** IRCTC pushes live order immediately after customer checkout. Passenger phone/email are **masked** for privacy. |
| `POST` | `/v3/order/{orderId}/confirmation` | **Order Confirmation:** OLF calls IRCTC to confirm or reject the order. *Locking rule: Once confirmed, vendor cannot cancel.* |
| `POST` | `/order` *(OLF Webhook)* | **Final Order Submit:** IRCTC pushes complete **unmasked** passenger phone, coach, and berth details before cutoff. Green light to cook. |

---

## 6. Reverse Order Module (OLF Direct App to IRCTC)

Used when high-volume partners (>=25,000 orders/month) take food orders on their own OLF app/web and inject them into the railway network.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `POST` | `/v3/order/vendor` | **Create Reverse Order:** Books order into IRCTC system directly. Order is created in `PENDING` status. |
| `POST` | `/v3/order/{orderId}/confirmation` | **Confirm Reverse Order:** Synchronizes and transitions order status from `PENDING` to `ORDER_CONFIRMED`. |

---

## 7. Order Status, Updates & Delivery Verification Module

Used for synchronizing order progress from kitchen preparation to passenger seat delivery.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `POST` | `/v3/order/{orderId}/status` | **Update Order Status:** Updates milestone progression (`ORDER_CONFIRMED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`). |
| `POST` | `/v3/order/{orderId}/verify` | **Verify Delivery OTP:** Verifies the secret delivery code shared by passenger at their train berth upon food handover. |
| `GET` | `/v3/order/{orderId}/eta` | **Fetch Order ETA:** Checks live train estimated arrival time. *(Quota: Maximum 1 request per order per 5 minutes).* |
| `GET` | `/v3/order/{orderId}` | **Fetch Order Details:** Retrieves full order itemization, customer notes, billing, and logs. |
| `POST` | `/path` *(OLF Webhook)* | **Order Status Webhook:** IRCTC pushes system updates, auto-delivery marks, compliance cancellations, and refunds. |

---

## 8. PNR, Train Route & Telemetry Module

Used for validating passenger railway journey details, schedules, and train routes.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `GET` | `/v3/pnr/vendor?pnr={pnr_number}` | **Fetch PNR Details:** Validates 10-digit PNR; returns train number, date, passenger count, boarding station, coach, and berth. |
| `GET` | `/v3/train/{trainNumber}/route` | **Fetch Train Route:** Returns scheduled arrival times, departure times, and halt durations for all stops on train route. |
| `GET` | `/v3/train/{trainNumber}/boarding-stations` | **Fetch Boarding Stations:** Returns all valid boarding stations enabled for food delivery along the train route. |

---

## 9. Customer Feedback Module

Used for retrieving customer ratings and reviews left by passengers after train journey delivery.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `GET` | `/v3/order/vendor/feedbacks` | **Fetch Feedbacks:** Retrieves passenger reviews, food quality ratings, delivery punctuality scores, and feedback comments. |

---

## 10. Large Aggregator & RDS (Rolling Deposit Scheme) Module

Used for financial settlement management and station-level operations.

| Method | Endpoint Path | Short Description & Purpose |
| :---: | :--- | :--- |
| `PATCH` | `/v3/aggregator/station/{stationCode}` | **Update Station Details:** Updates operational parameters of a station. |
| `PATCH` | `/v3/aggregator/station/{stationCode}/listing` | **List / De-list Station:** Temporarily enables or disables an entire railway station. |
| `POST` | `/v3/aggregator/cart/validate` | **Cart Validation:** Pre-validates food items in customer cart before final checkout. |
| `GET` | `/v3/rds/balance` | **Fetch RDS Balance:** Retrieves current security deposit balance in Rolling Deposit Scheme. |
| `POST` | `/v3/rds/deposit` | **RDS Deposit Request:** Submits balance top-up request for the deposit account. |
