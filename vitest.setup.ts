import "@testing-library/jest-dom";
import path from "node:path";

// Dummy Supabase env vars for tests (see .env.test — never real credentials).
process.loadEnvFile(path.resolve(process.cwd(), ".env.test"));
