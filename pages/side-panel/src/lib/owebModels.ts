/** Product-facing OWeb Gemini models (must match llmProviderModelNames[OWeb]). */
export const OWEB_MODEL_OPTIONS = [
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    hint: 'Fast · default',
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    hint: 'Stronger reasoning',
  },
] as const;

export type OWebModelId = (typeof OWEB_MODEL_OPTIONS)[number]['id'];

export function labelForOwebModel(modelId: string): string {
  return OWEB_MODEL_OPTIONS.find(m => m.id === modelId)?.label ?? modelId;
}
