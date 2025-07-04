import { config } from "dotenv";

// Load environment variables from the root .env file
config({ path: "../../.env" });

// Export individual configuration values
export const API_SERVER_PORT = process.env.API_SERVER_PORT || "3001";
export const WS_SERVER_PORT = process.env.WS_SERVER_PORT || "3002";
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV || "development";

// Helper functions to check environment
export const isProduction = NODE_ENV === "production";
export const isDevelopment = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
