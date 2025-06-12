/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_CONVEX_URL: string;
  readonly CONVEX_DEPLOYMENT: string;
  // add any other VITE_… vars you create
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
