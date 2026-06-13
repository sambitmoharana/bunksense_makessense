import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "api-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith("/api/advisor")) {
              if (req.method !== "POST") {
                res.statusCode = 405;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
                return;
              }

              let bodyData = "";
              req.on("data", (chunk) => {
                bodyData += chunk;
              });

              req.on("end", async () => {
                try {
                  const body = JSON.parse(bodyData || "{}");
                  const apiKey = env.GEMINI_API_KEY;
                  const { handleAdvisorRequest } = await import("./api/advisor-handler");
                  const result = await handleAdvisorRequest(body, apiKey);
                  
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify(result));
                } catch (err: any) {
                  console.error("Vite API Middleware Error:", err);
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: err.message || "Internal server error" }));
                }
              });
            } else {
              next();
            }
          });
        },
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
