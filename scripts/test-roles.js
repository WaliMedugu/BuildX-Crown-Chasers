const http = require("http");

async function test() {
  const req = (path, method = "GET", data = null) => new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : "";
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };
    const r = http.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    r.on("error", reject);
    if (postData) r.write(postData);
    r.end();
  });

  console.log("[Test] 1. Fetching index.html...");
  const htmlRes = await req("/");
  console.log(`[Test] Status: ${htmlRes.status}, contains 'Role: Personal': ${htmlRes.body.includes("Role: Personal")}, contains 'Verified Members': ${htmlRes.body.includes("Verified Members")}`);

  console.log("[Test] 2. Testing Personal Signup...");
  const testEmail = `test_pers_${Date.now()}@example.com`;
  const signUpRes = await req("/api/auth/signup", "POST", {
    name: "Tunde Oladipo",
    email: testEmail,
    password: "password123",
    role: "personal",
    university: "UNILAG",
    nacosId: "UNILAG-CS-2026-9999",
    github: "tunde-dev"
  });
  console.log(`[Test] Personal Signup Status: ${signUpRes.status}, body: ${signUpRes.body}`);

  console.log("[Test] 3. Testing Upgrade to Organization...");
  const upgradeRes = await req("/api/user/upgrade-role", "POST", {
    email: testEmail,
    targetRole: "organization",
    credentials: {
      company: "Apex Labs Ltd",
      regNumber: "RC-998877",
      department: "Engineering"
    }
  });
  console.log(`[Test] Upgrade to Organization Status: ${upgradeRes.status}, body: ${upgradeRes.body}`);

  console.log("[Test] All tests completed.");
}

test().catch(console.error);
