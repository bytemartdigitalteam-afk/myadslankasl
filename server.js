// ===== COMPLETE DNS FIX: Override ALL DNS methods with DNS-over-HTTPS =====
// ISP blocks port 53 DNS. MongoDB Atlas rotated shard hostnames.
// Solution: Use DoH (HTTPS port 443) for SRV, TXT, and A record lookups.
const dns = require("dns");
const https = require("https");

// Force IPv4 first
dns.setDefaultResultOrder("ipv4first");

// ===== DNS-over-HTTPS query function =====
const queryDoH = (hostname, type = "A") => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "dns.google",
      path: `/resolve?name=${encodeURIComponent(hostname)}&type=${type}`,
      headers: { Accept: "application/dns-json" },
      timeout: 15000,
    };

    const req = https.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`DoH parse error: ${e.message}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("DoH request timeout"));
    });
  });
};

// ===== DNS Cache =====
const dnsCache = new Map();
const DNS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const cached = dnsCache.get(key);
  if (cached && Date.now() - cached.time < DNS_CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  dnsCache.set(key, { data, time: Date.now() });
};

// ===== Override dns.lookup (A record) =====
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof options === "number") {
    options = { family: options };
  }
  options = options || {};

  if (hostname && (hostname.includes("mongodb.net") || hostname.includes("mongodb.com"))) {
    const cacheKey = `A:${hostname}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`✅ [cached] ${hostname} -> ${cached.join(", ")}`);
      if (options.all) {
        return callback(null, cached.map((ip) => ({ address: ip, family: 4 })));
      }
      return callback(null, cached[0], 4);
    }

    console.log(`🔍 Resolving A record for ${hostname} via DoH...`);
    queryDoH(hostname, "A")
      .then((json) => {
        if (json.Answer && json.Answer.length > 0) {
          const aRecords = json.Answer.filter((a) => a.type === 1);
          if (aRecords.length > 0) {
            const ips = aRecords.map((a) => a.data);
            setCache(cacheKey, ips);
            console.log(`✅ ${hostname} -> ${ips.join(", ")}`);
            if (options.all) {
              return callback(null, ips.map((ip) => ({ address: ip, family: 4 })));
            }
            callback(null, ips[0], 4);
          } else {
            // Might be CNAME chain, try last entry
            const ip = json.Answer[json.Answer.length - 1].data;
            setCache(cacheKey, [ip]);
            console.log(`✅ ${hostname} -> ${ip} (via CNAME)`);
            if (options.all) {
              return callback(null, [{ address: ip, family: 4 }]);
            }
            callback(null, ip, 4);
          }
        } else {
          console.log(`⚠️ DoH returned no A records for ${hostname}, trying system DNS...`);
          originalLookup(hostname, options, callback);
        }
      })
      .catch((err) => {
        console.log(`⚠️ DoH A lookup failed for ${hostname}: ${err.message}`);
        originalLookup(hostname, options, callback);
      });
  } else {
    originalLookup(hostname, options, callback);
  }
};

// ===== Override dns.resolveSrv (SRV record — used by mongodb+srv://) =====
const originalResolveSrv = dns.resolveSrv;
dns.resolveSrv = (hostname, callback) => {
  if (hostname && (hostname.includes("mongodb.net") || hostname.includes("mongodb.com"))) {
    const cacheKey = `SRV:${hostname}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`✅ [cached] SRV ${hostname} -> ${cached.length} records`);
      return callback(null, cached);
    }

    console.log(`🔍 Resolving SRV record for ${hostname} via DoH...`);
    queryDoH(hostname, "SRV")
      .then((json) => {
        if (json.Answer && json.Answer.length > 0) {
          const srvRecords = json.Answer
            .filter((a) => a.type === 33) // SRV = type 33
            .map((a) => {
              const parts = a.data.split(" ");
              return {
                priority: parseInt(parts[0]) || 0,
                weight: parseInt(parts[1]) || 0,
                port: parseInt(parts[2]) || 27017,
                name: (parts[3] || "").replace(/\.$/, ""),
              };
            });

          if (srvRecords.length > 0) {
            setCache(cacheKey, srvRecords);
            console.log(`✅ SRV ${hostname} -> ${srvRecords.map((r) => `${r.name}:${r.port}`).join(", ")}`);
            callback(null, srvRecords);
          } else {
            console.log(`⚠️ DoH returned no SRV records for ${hostname}`);
            originalResolveSrv(hostname, callback);
          }
        } else {
          console.log(`⚠️ DoH returned no answers for SRV ${hostname}`);
          originalResolveSrv(hostname, callback);
        }
      })
      .catch((err) => {
        console.log(`⚠️ DoH SRV lookup failed: ${err.message}`);
        originalResolveSrv(hostname, callback);
      });
  } else {
    originalResolveSrv(hostname, callback);
  }
};

// ===== Override dns.resolveTxt (TXT record — used by mongodb+srv://) =====
const originalResolveTxt = dns.resolveTxt;
dns.resolveTxt = (hostname, callback) => {
  if (hostname && (hostname.includes("mongodb.net") || hostname.includes("mongodb.com"))) {
    const cacheKey = `TXT:${hostname}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`✅ [cached] TXT ${hostname}`);
      return callback(null, cached);
    }

    console.log(`🔍 Resolving TXT record for ${hostname} via DoH...`);
    queryDoH(hostname, "TXT")
      .then((json) => {
        if (json.Answer && json.Answer.length > 0) {
          const txtRecords = json.Answer
            .filter((a) => a.type === 16) // TXT = type 16
            .map((a) => {
              // TXT data comes quoted, remove quotes
              const txt = a.data.replace(/^"|"$/g, "");
              return [txt];
            });

          if (txtRecords.length > 0) {
            setCache(cacheKey, txtRecords);
            console.log(`✅ TXT ${hostname} -> ${txtRecords.map((r) => r[0]).join(", ")}`);
            callback(null, txtRecords);
          } else {
            console.log(`⚠️ No TXT records from DoH for ${hostname}`);
            originalResolveTxt(hostname, callback);
          }
        } else {
          console.log(`⚠️ No TXT answers from DoH for ${hostname}`);
          originalResolveTxt(hostname, callback);
        }
      })
      .catch((err) => {
        console.log(`⚠️ DoH TXT lookup failed: ${err.message}`);
        originalResolveTxt(hostname, callback);
      });
  } else {
    originalResolveTxt(hostname, callback);
  }
};

// Also override dns.resolve and dns.resolve4 for completeness
const originalResolve4 = dns.resolve4;
dns.resolve4 = (hostname, optionsOrCallback, maybeCallback) => {
  const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
  const options = typeof optionsOrCallback === "object" ? optionsOrCallback : {};
  
  if (hostname && (hostname.includes("mongodb.net") || hostname.includes("mongodb.com"))) {
    queryDoH(hostname, "A")
      .then((json) => {
        if (json.Answer) {
          const ips = json.Answer.filter((a) => a.type === 1).map((a) => a.data);
          if (ips.length > 0) {
            if (options.ttl) {
              callback(null, ips.map(ip => ({ address: ip, ttl: 60 })));
            } else {
              callback(null, ips);
            }
            return;
          }
        }
        if (originalResolve4) originalResolve4(hostname, optionsOrCallback, maybeCallback);
        else callback(new Error(`No A records for ${hostname}`));
      })
      .catch(() => {
        if (originalResolve4) originalResolve4(hostname, optionsOrCallback, maybeCallback);
        else callback(new Error(`Failed to resolve ${hostname}`));
      });
  } else {
    if (originalResolve4) originalResolve4(hostname, optionsOrCallback, maybeCallback);
  }
};
// ===== Also override dns.promises for modern drivers =====
if (dns.promises) {
  dns.promises.lookup = (hostname, options) => {
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, options, (err, address, family) => {
        if (err) return reject(err);
        if (options && options.all) {
          resolve(address);
        } else {
          resolve({ address, family });
        }
      });
    });
  };

  dns.promises.resolveSrv = (hostname) => {
    return new Promise((resolve, reject) => {
      dns.resolveSrv(hostname, (err, addresses) => {
        if (err) return reject(err);
        resolve(addresses);
      });
    });
  };

  dns.promises.resolveTxt = (hostname) => {
    return new Promise((resolve, reject) => {
      dns.resolveTxt(hostname, (err, addresses) => {
        if (err) return reject(err);
        resolve(addresses);
      });
    });
  };

  dns.promises.resolve4 = (hostname, options) => {
    return new Promise((resolve, reject) => {
      dns.resolve4(hostname, options, (err, addresses) => {
        if (err) return reject(err);
        resolve(addresses);
      });
    });
  };
}

// ===== Load Environment Variables =====
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// Middleware
app.use(cors({
  origin: ["https://my-ads-lanka-full-project-ctk9.vercel.app"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MongoDB Connection with Retry Logic =====
let retryCount = 0;
const MAX_RETRIES = 10;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("FATAL: MONGO_URI is not defined in .env file!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    console.log("Using", uri.startsWith("mongodb+srv") ? "SRV" : "Standard", "connection format");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      family: 4, // Force IPv4
    });

    console.log("✅ MongoDB Connected Successfully!");
    retryCount = 0;

    // Seed default admin
    await seedAdmin();
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB Connection Error (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(5000 * retryCount, 30000);
      console.log(`⏳ Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(connectDB, delay);
    } else {
      console.error("💀 Max retries reached. Could not connect to MongoDB.");
      console.error("Please check:");
      console.error("  1. Your MONGO_URI in .env is correct");
      console.error("  2. Your IP is whitelisted in MongoDB Atlas (0.0.0.0/0)");
      console.error("  3. Database user password is correct");
      console.error("  4. Your internet connection is working");
    }
  }
};

// Seed admin account
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@myadslanka.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "ABcd7408";

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Default Admin Account Created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin account already exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error("⚠️  Error seeding admin:", err.message);
  }
};

// ===== Connection Event Handlers =====
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to DB");
});

mongoose.connection.on("disconnected", () => {
  console.log("📡 Mongoose disconnected from DB");
});

mongoose.connection.on("error", (err) => {
  console.error("📡 Mongoose connection error:", err.message);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});

// ===== Middleware: Check DB Connection =====
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Please wait a moment and try again.",
      dbState: mongoose.connection.readyState,
    });
  }
  next();
};

// Apply DB check to all API routes
app.use("/api", checkDBConnection);

// ===== Routes =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ads", require("./routes/ads"));
app.use("/api/admin", require("./routes/admin"));

// Health check (no DB check needed)
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({
    server: "running",
    database: states[dbState] || "unknown",
    dbReadyState: dbState,
    retryCount,
    uptime: process.uptime(),
  });
});

// DNS test endpoint
app.get("/dns-test", async (req, res) => {
  try {
    const srvResult = await queryDoH("_mongodb._tcp.cluster0.c8xihsn.mongodb.net", "SRV");
    res.json({
      method: "DNS-over-HTTPS (Google)",
      srvRecords: srvResult.Answer || [],
      status: srvResult.Answer ? "OK" : "No SRV records",
    });
  } catch (err) {
    res.json({ method: "DNS-over-HTTPS (Google)", error: err.message });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.send("MyAdsLanka API is running...");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌐 Using DNS-over-HTTPS (Google) for all MongoDB DNS lookups");
  console.log("   Overriding: dns.lookup, dns.resolveSrv, dns.resolveTxt, dns.resolve4");
  connectDB();
});

// For Vercel deployment
module.exports = app;
