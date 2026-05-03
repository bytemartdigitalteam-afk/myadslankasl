// Test SRV record lookup via DNS-over-HTTPS
// This will find the CURRENT shard hostnames for the MongoDB Atlas cluster
const https = require("https");

const queryDoH = (hostname, type = "A") => {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${type}`;
    const req = https.get(url, { headers: { Accept: "application/dns-json" }, timeout: 15000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
};

async function main() {
  console.log("=== MongoDB Atlas DNS Discovery ===\n");

  // Step 1: Query SRV record to find current shard hostnames
  const srvName = "_mongodb._tcp.cluster0.c8xihsn.mongodb.net";
  console.log(`1. Querying SRV record: ${srvName}\n`);

  try {
    const srvResult = await queryDoH(srvName, "SRV");
    console.log("   Status:", srvResult.Status);

    if (srvResult.Answer && srvResult.Answer.length > 0) {
      console.log("   ✅ SRV Records found!\n");
      
      const shardHosts = [];
      srvResult.Answer.forEach((record) => {
        // SRV data format: "priority weight port target"
        const parts = record.data.split(" ");
        const target = parts[3] || record.data;
        const port = parts[2] || "27017";
        console.log(`   Shard: ${target}:${port}`);
        shardHosts.push({ host: target.replace(/\.$/, ""), port });
      });

      // Step 2: Query TXT record for connection options
      console.log(`\n2. Querying TXT record: cluster0.c8xihsn.mongodb.net\n`);
      try {
        const txtResult = await queryDoH("cluster0.c8xihsn.mongodb.net", "TXT");
        if (txtResult.Answer) {
          txtResult.Answer.forEach((record) => {
            console.log(`   TXT: ${record.data}`);
          });
        } else {
          console.log("   No TXT records");
        }
      } catch (e) {
        console.log(`   TXT lookup failed: ${e.message}`);
      }

      // Step 3: Resolve each shard hostname to IP
      console.log(`\n3. Resolving shard IPs:\n`);
      for (const shard of shardHosts) {
        try {
          const aResult = await queryDoH(shard.host, "A");
          if (aResult.Answer) {
            const ips = aResult.Answer.filter((a) => a.type === 1).map((a) => a.data);
            console.log(`   ✅ ${shard.host} -> ${ips.join(", ")}`);
          } else {
            console.log(`   ❌ ${shard.host} -> No A records`);
          }
        } catch (e) {
          console.log(`   ❌ ${shard.host} -> Error: ${e.message}`);
        }
      }

      // Step 4: Generate the non-SRV connection string
      console.log(`\n4. Generated Connection String:\n`);
      const hostList = shardHosts.map((s) => `${s.host}:${s.port}`).join(",");
      console.log(`   mongodb://bytemartdigitalteamdb:<PASSWORD>@${hostList}/myadslanka?ssl=true&replicaSet=atlas-8t9nlw-shard-0&authSource=admin&appName=Cluster0`);
    } else {
      console.log("   ❌ No SRV records found!");
      console.log("   Raw response:", JSON.stringify(srvResult, null, 2));
    }
  } catch (e) {
    console.log(`   ❌ SRV query failed: ${e.message}`);
  }

  // Step 5: Also check old hostnames
  console.log(`\n5. Checking OLD shard hostnames:\n`);
  const oldHosts = [
    "ac-calzioh-shard-00-00.c8xihsn.mongodb.net",
    "ac-calzioh-shard-00-01.c8xihsn.mongodb.net",
    "ac-calzioh-shard-00-02.c8xihsn.mongodb.net",
  ];
  for (const host of oldHosts) {
    try {
      const result = await queryDoH(host, "A");
      if (result.Answer) {
        console.log(`   ✅ ${host} -> ${result.Answer.filter((a) => a.type === 1).map((a) => a.data).join(", ")}`);
      } else {
        console.log(`   ❌ ${host} -> GONE (no A records)`);
      }
    } catch (e) {
      console.log(`   ❌ ${host} -> Error: ${e.message}`);
    }
  }
}

main().then(() => console.log("\n=== Done ==="));
