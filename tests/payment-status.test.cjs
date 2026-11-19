const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require(process.cwd() + "/node_modules/typescript");
function compile(path, aliases) {
  let file = process.cwd() + path,
    m = new Module(file, module);
  m.paths = Module._nodeModulePaths(process.cwd());
  let orig = m.require.bind(m);
  m.require = (id) => (id in aliases ? aliases[id] : orig(id));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    file,
  );
  return m.exports;
}
let user = null,
  owns = false,
  queries = 0,
  requests = 0,
  confirmed = 0,
  hasRace = false;
let state = { transaction_status: "settlement", fraud_status: "deny" };
const pool = {
  query: async (sql) => {
    queries++;
    if (sql.includes("SELECT id FROM"))
      return { rows: owns ? [{ id: "p" }] : [] };
    if (sql.includes('SELECT id, "orderId"'))
      return {
        rows: owns ? [{ id: "p", orderId: "order", status: "PENDING" }] : [],
      };
    if (sql.includes("UPDATE")) return { rows: [], rowCount: hasRace ? 0 : 1 };
    throw Error("unexpected sql");
  },
};
const aliases = {
  "@/lib/db": { getDbPool: () => pool },
  "@/lib/server-auth": { getAuthenticatedAppUser: async () => user },
  "@/lib/midtrans-server": {
    getMidtransStatus: async () => {
      requests++;
      return state;
    },
    confirmPaymentInDb: async () => {
      confirmed++;
      return { success: true };
    },
  },
};
const check = compile("/app/api/proxy/shop/check/[id]/route.ts", aliases).POST,
  byOrder = compile(
    "/app/api/proxy/shop/midtrans/check-status/[orderId]/route.ts",
    aliases,
  ).POST;
(async () => {
  let res = await byOrder(
    {},
    { params: Promise.resolve({ orderId: "order" }) },
  );
  assert.equal(res.status, 401);
  assert.equal(requests, 0);
  user = { id: "u" };
  res = await byOrder({}, { params: Promise.resolve({ orderId: "order" }) });
  assert.equal(res.status, 404);
  assert.equal(requests, 0);
  owns = true;
  res = await check({}, { params: Promise.resolve({ id: "p" }) });
  let body = await res.json();
  assert.equal(body.status, "CANCELLED");
  assert.equal(confirmed, 0);
  hasRace = true;
  res = await check({}, { params: Promise.resolve({ id: "p" }) });
  body = await res.json();
  assert.equal(body.status, "CONFIRMED");
  state = { transaction_status: "settlement", fraud_status: "accept" };
  hasRace = false;
  res = await byOrder({}, { params: Promise.resolve({ orderId: "order" }) });
  body = await res.json();
  assert.equal(body.status, "CONFIRMED");
  assert.equal(confirmed, 1);
  console.log(
    "PASS status endpoints require owner, deny fraud, preserve concurrent confirmation and reconcile successful status",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
