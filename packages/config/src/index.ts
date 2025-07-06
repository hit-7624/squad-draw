import { config } from "dotenv";

// Load environment variables from the root .env file
config({ path: "../../.env" });

// Export individual configuration values
export const API_SERVER_PORT = process.env.API_SERVER_PORT || "3001";
export const WS_SERVER_PORT = process.env.WS_SERVER_PORT || "3002";
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const ORIGIN_URL = process.env.ORIGIN_URL || "http://localhost:3000";

// Helper functions to check environment
export const isProduction = NODE_ENV === "production";
export const isDevelopment = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
