// deno-lint-ignore-file no-explicit-any
import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import { createTable } from "./tables/insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);

console.log("Initializing database tables");
try {
  db.exec(createTable);
  console.log("Database tables initialized successfully");
} catch (error) {
  if (!error.message.includes("already exists")) {
    console.error("Failed to initialize database tables:", error);
    throw error;
  }
  console.log("Database tables already exist");
}

console.log("Initialising server");

const router = new oak.Router();

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200; // Fix: Previously incorrectly set body = 200
});

router.get("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const result = lookupInsight({ db, id: parseInt(params.id) });
  if (result) {
    ctx.response.body = result;
    ctx.response.status = 200;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Insight not found" };
  }
});

router.post("/insights", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { brandId, text } = body;
    
    if (!brandId || !text || !text.trim()) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required fields: brandId, text" };
      return;
    }
    
    const result = createInsight({ db, brandId: parseInt(brandId), text });
    
    if (result.success) {
      ctx.response.body = result.insight;
      ctx.response.status = 201;
    } else {
      ctx.response.status = 409; // Conflict - Insight already exists
      ctx.response.body = { error: result.error };
    }
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request body" };
  }
});

router.delete("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid ID" };
    return;
  }
  
  const deleted = deleteInsight({ db, id });
  if (deleted) {
    ctx.response.status = 204; // No Content
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Insight not found" };
  }
});

const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
