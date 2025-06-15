import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  serverBuildFile: "index.js",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  future: {
    unstable_singleFetch: true,
  },
} satisfies Config;
