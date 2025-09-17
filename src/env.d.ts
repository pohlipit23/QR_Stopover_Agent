/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  readonly DEFAULT_MODEL: string;
  readonly MAX_TOKENS: string;
  readonly TEMPERATURE: string;
  readonly STREAMING_ENABLED: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}