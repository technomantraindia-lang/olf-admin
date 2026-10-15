import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const IRCTC_BASE_URL = process.env.IRCTC_BASE_URL || 'http://localhost:5000/api';
const IRCTC_AUTH_TOKEN = process.env.IRCTC_AUTH_TOKEN || 'mock_secret_test_token';

// In-Memory Database for OLF Backend
const db = {
  outlets: [],
  auditLogs: [],
};

// Middlewares
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[OLF-BACKEND] [${req.method}] ${req.originalUrl}`);
  next();
});

// Configure Axios Client to talk to IRCTC (Port 5000 / Staging)
const irctcClient = axios.create({
  baseURL: IRCTC_BASE_URL,
  headers: {
    'Authorization': IRCTC_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/* ==========================================================
   1. SYSTEM & HEALTH CHECK
   ========================================================== */
app.get('/health', async (req, res) => {
  let irctcConnected = false;
  let irctcStatus = null;

  try {
    // Check connection to IRCTC API (Port 5000)
    const rootUrl = IRCTC_BASE_URL.replace('/api', '');
    const irctcRes = await axios.get(`${rootUrl}/health`, { timeout: 3000 });
    irctcConnected = irctcRes.status === 200;
    irctcStatus = irctcRes.data;
  } catch (err) {
    irctcConnected = false;
  }

  res.json({
    status: 'UP',
    server: 'OLF Admin Express Backend (Part 2 - Main Boss)',
    port: PORT,
    timestamp: new Date().toISOString(),
    irctcConnection: {
      connected: irctcConnected,
      targetUrl: IRCTC_BASE_URL,
      details: irctcStatus,
    },
    localStats: {
      outlets: db.outlets.length,
      auditLogs: db.auditLogs.length,
    },
  });
});

// Clear/Reset all outlets in OLF Backend
app.post('/api/reset', (req, res) => {
  db.outlets = [];
  db.auditLogs = [];
  console.log('🧹 [OLF BACKEND] Database cleared to 0 outlets.');
  res.json({ status: 'success', message: 'OLF Backend database cleared to 0 outlets.' });
});

/* ==========================================================
   2. OUTLET MANAGEMENT ENDPOINTS (ADMIN -> OLF BACKEND -> IRCTC)
   ========================================================== */

// GET All Outlets
app.get('/api/outlets', (req, res) => {
  res.json({
    status: 'success',
    count: db.outlets.length,
    result: db.outlets,
  });
});

// GET Single Outlet by ID
app.get('/api/outlets/:id', (req, res) => {
  const outlet = db.outlets.find((o) => o.id === req.params.id);
  if (!outlet) {
    return res.status(404).json({ status: 'error', message: 'Outlet not found' });
  }
  res.json({ status: 'success', result: outlet });
});

// POST Create Outlet Application
// Frontend calls this -> OLF Backend validates & talks to IRCTC -> returns result
app.post('/api/outlets', async (req, res) => {
  try {
    const {
      id,
      name,
      stationCode,
      vendorId,
      vendorName,
      fssaiNo,
      fssaiValidUpto,
      distanceInMeters,
      bookingCutoff,
      minOrderAmount,
      mealType,
      prepaid,
      gstNo,
      address,
      contact,
      schedules,
    } = req.body;

    // Backend Validation according to IRCTC rules
    if (!name || !stationCode || !fssaiNo || !bookingCutoff) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, stationCode, fssaiNo, and bookingCutoff are mandatory fields.',
      });
    }

    if (!/^\d{14}$/.test(String(fssaiNo).trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'FSSAI License must be exactly 14 numeric digits.',
      });
    }

    const stn = String(stationCode).toUpperCase().trim();
    const outletId = id ? String(id).toUpperCase().trim() : `OUT${Date.now().toString().slice(-4)}`;

    console.log(`\n🚀 [OLF BACKEND] Processing new Outlet Application for station [${stn}]...`);

    // Prepare Payload for IRCTC v3 API
    const irctcPayload = {
      id: outletId,
      outletId,
      name,
      outletName: name,
      stationCode: stn,
      fssaiNo,
      fssaiNumber: fssaiNo,
      fssaiValidUpto,
      bookingCutoff: Number(bookingCutoff),
      baseCutoffTime: Number(bookingCutoff),
      minOrderAmount: Number(minOrderAmount || 100),
      mealType: mealType || 'VEG_AND_NON_VEG',
      prepaid: Boolean(prepaid),
      gstNo: gstNo || '',
      gstin: gstNo || '',
      distanceInMeters: Number(distanceInMeters || 2500),
      address: address || '',
      contact: contact || {},
      schedules: schedules || [{ startTime: '06:00', endTime: '23:00' }],
    };

    let irctcResponseData = null;

    // FORWARD TO IRCTC (Part 3)
    try {
      console.log(`📡 [OLF BACKEND -> IRCTC] Forwarding POST /v3/vendor/station/${stn}/outlet`);
      const irctcRes = await irctcClient.post(`/v3/vendor/station/${stn}/outlet`, irctcPayload);
      irctcResponseData = irctcRes.data;
      console.log(`✅ [IRCTC -> OLF BACKEND] Response:`, irctcResponseData);
    } catch (irctcErr) {
      console.error(`❌ [IRCTC Call Failed]:`, irctcErr.response?.data || irctcErr.message);
      return res.status(irctcErr.response?.status || 502).json({
        status: 'error',
        message: 'Failed to communicate with IRCTC eCatering server.',
        details: irctcErr.response?.data || irctcErr.message,
      });
    }

    // Save in OLF Backend Database with compliant initial PENDING lifecycle state
    const newOutletRecord = {
      ...irctcPayload,
      vendorId: vendorId || '1001',
      vendorName: vendorName || 'Primary Vendor Partner',
      applicationId: irctcResponseData?.result?.applicationId || `APP_${Date.now()}`,
      status: 'DOCUMENT_UPLOAD_PENDING',
      approvalStatus: 'DOCUMENT_UPLOAD_PENDING',
      listed: false,
      documentsUploaded: false,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.outlets.push(newOutletRecord);
    db.auditLogs.push({
      action: 'APPLICATION_CREATED',
      outletId,
      stationCode: stn,
      timestamp: new Date().toISOString(),
      irctcApplicationId: newOutletRecord.applicationId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Outlet application submitted to IRCTC. Next step: Upload 7 mandatory compliance documents.',
      result: newOutletRecord,
      irctcRaw: irctcResponseData,
    });
  } catch (err) {
    console.error('[OLF BACKEND] Internal Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// POST Upload 7 Mandatory Compliance Documents to IRCTC
// Endpoint matches Doc Section 2: POST /v3/vendor/application/{applicationId}/documents
app.post('/api/applications/:applicationId/documents', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { documents } = req.body;

    console.log(`\n📑 [OLF BACKEND -> IRCTC] Forwarding POST /v3/vendor/application/${applicationId}/documents`);
    const irctcRes = await irctcClient.post(`/v3/vendor/application/${applicationId}/documents`, {
      documents: documents || req.body,
    });

    // Update in local db
    const outlet = db.outlets.find((o) => o.applicationId === applicationId);
    if (outlet) {
      outlet.status = 'APPROVAL_PENDING';
      outlet.approvalStatus = 'APPROVAL_PENDING';
      outlet.documentsUploaded = true;
      outlet.documents = documents || [];
      outlet.updatedAt = new Date().toISOString();
    }

    db.auditLogs.push({
      action: 'DOCUMENTS_SUBMITTED',
      applicationId,
      timestamp: new Date().toISOString(),
    });

    res.json({
      status: 'success',
      message: '7 Mandatory compliance documents uploaded. Application is now under IRCTC Corporate review.',
      result: {
        applicationId,
        approvalStatus: 'APPROVAL_PENDING',
        documents,
      },
      irctcRaw: irctcRes.data,
    });
  } catch (err) {
    console.error('❌ [Upload Documents Failed]:', err.response?.data || err.message);
    res.status(err.response?.status || 502).json({
      status: 'error',
      message: 'Failed to upload documents to IRCTC.',
      details: err.response?.data || err.message,
    });
  }
});

// GET /api/applications/:applicationId - Sync & fetch application status from IRCTC
// Endpoint matches Doc Section 2: GET /v3/vendor/application/{applicationId}
app.get('/api/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const irctcRes = await irctcClient.get(`/v3/vendor/application/${applicationId}`);
    const appData = irctcRes.data?.result || {};

    const outlet = db.outlets.find((o) => o.applicationId === applicationId);
    if (outlet && appData.status) {
      outlet.approvalStatus = appData.status;
      if (appData.status === 'APPROVED') {
        outlet.status = 'APPROVED';
        outlet.listed = true;
      } else if (appData.status === 'REJECTED') {
        outlet.status = 'REJECTED';
        outlet.listed = false;
        outlet.rejectionReason = appData.rejectionReason;
      }
      outlet.updatedAt = new Date().toISOString();
    }

    res.json({
      status: 'success',
      result: {
        application: appData,
        localOutlet: outlet,
      },
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      status: 'error',
      message: 'Failed to fetch application status from IRCTC',
      details: err.response?.data || err.message,
    });
  }
});

// PATCH Listing Shutter Toggle (List / De-list on IRCTC)
app.patch('/api/outlets/:id/listing', async (req, res) => {
  try {
    const { id } = req.params;
    const { listed, stationCode, remarks } = req.body;

    if (typeof listed !== 'boolean') {
      return res.status(400).json({ status: 'error', message: "'listed' boolean field is required" });
    }

    const outlet = db.outlets.find((o) => o.id === id);
    const stn = (stationCode || outlet?.stationCode || 'BPL').toUpperCase();

    console.log(`\n🚨 [OLF BACKEND] Shutter Toggle requested for [${id}] -> ${listed ? 'LIVE 🟢' : 'DE-LISTED 🔴'}`);

    let irctcResponse = null;

    // FORWARD TO IRCTC (Part 3)
    try {
      console.log(`📡 [OLF BACKEND -> IRCTC] Forwarding PATCH /v3/vendor/station/${stn}/outlet/${id}/listing`);
      const irctcRes = await irctcClient.patch(`/v3/vendor/station/${stn}/outlet/${id}/listing`, {
        listed,
        remarks: remarks || (listed ? 'Resumed service via OLF' : 'Paused service via OLF'),
      });
      irctcResponse = irctcRes.data;
      console.log(`✅ [IRCTC -> OLF BACKEND] Response:`, irctcResponse);
    } catch (irctcErr) {
      console.error(`❌ [IRCTC Listing Toggle Failed]:`, irctcErr.response?.data || irctcErr.message);
      return res.status(irctcErr.response?.status || 502).json({
        status: 'error',
        message: 'Failed to update listing on IRCTC server.',
        details: irctcErr.response?.data || irctcErr.message,
      });
    }

    if (outlet) {
      outlet.listed = listed;
      outlet.updatedAt = new Date().toISOString();
    }

    db.auditLogs.push({
      action: 'LISTING_TOGGLED',
      outletId: id,
      stationCode: stn,
      listed,
      timestamp: new Date().toISOString(),
    });

    res.json({
      status: 'success',
      message: `Outlet is now ${listed ? 'Listed on IRCTC' : 'Delisted on IRCTC'}`,
      result: { id, stationCode: stn, listed, remarks },
      irctcRaw: irctcResponse,
    });
  } catch (err) {
    console.error('[OLF BACKEND] Listing error:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// POST /api/webhook/outlet-status
// Webhook for IRCTC Outlet Status & Shutter updates (Official IRCTC Doc Section 3)
app.post('/api/webhook/outlet-status', (req, res) => {
  const { outletId, stationCode, listed, remarks } = req.body;
  console.log(`\n🚨 [WEBHOOK FROM IRCTC] Outlet [${outletId}] Listing changed -> ${listed ? 'LIVE 🟢' : 'DE-LISTED 🔴'}`);

  const outlet = db.outlets.find((o) => o.id === outletId);
  if (outlet) {
    if (listed !== undefined) {
      outlet.listed = listed;
      outlet.status = 'APPROVED';
      outlet.approvalStatus = 'APPROVED';
    }
    outlet.updatedAt = new Date().toISOString();
  }

  db.auditLogs.push({
    action: 'IRCTC_WEBHOOK_STATUS_UPDATE',
    outletId,
    stationCode,
    listed,
    remarks,
    timestamp: new Date().toISOString(),
  });

  res.json({ status: 'success', message: 'Webhook received & processed by OLF Backend' });
});

// GET /api/outlets/:id/sync
// Live query to IRCTC to fetch latest status & listing (Doc Section 3: GET /v3/vendor/station/{stationCode}/outlet/{id})
app.get('/api/outlets/:id/sync', async (req, res) => {
  const { id } = req.params;
  const outlet = db.outlets.find((o) => o.id === id);
  const stn = (outlet?.stationCode || req.query.stationCode || 'BPL').toUpperCase();

  try {
    console.log(`📡 [OLF BACKEND -> IRCTC] Fetching live outlet status: GET /v3/vendor/station/${stn}/outlet/${id}`);
    const irctcRes = await irctcClient.get(`/v3/vendor/station/${stn}/outlet/${id}`);
    const irctcData = irctcRes.data?.result;

    if (outlet && irctcData) {
      if (irctcData.listed !== undefined) {
        outlet.listed = irctcData.listed;
        outlet.status = 'APPROVED';
        outlet.approvalStatus = 'APPROVED';
      }
      outlet.updatedAt = new Date().toISOString();
    }

    res.json({
      status: 'success',
      result: {
        localOutlet: outlet,
        irctcData,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync with IRCTC server',
      details: err.message,
    });
  }
});

// Start Server on PORT 4000
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`👑 OLF ADMIN BACKEND (Part 2 - Main Boss) is RUNNING on: http://localhost:${PORT}`);
  console.log(`🔗 Connected to IRCTC at: ${IRCTC_BASE_URL}`);
  console.log(`======================================================\n`);
});
