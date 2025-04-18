import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

export function filter_free_models(jsonData: { data: { models: any[] } }): any[] {
  const freeModels: any[] = [];

  if (
    !jsonData ||
    !jsonData.data ||
    !Array.isArray(jsonData.data.models)
  ) {
    console.error("Invalid JSON structure. Expected 'data' and 'models' keys with an array.");
    return [];
  }

  const models = jsonData.data.models;

  for (const model of models) {
    if (model.endpoint?.pricing) {
      const pricing = model.endpoint.pricing;
      const isReasoning = model.reasoning_config !== null && model.reasoning_config !== undefined;

      // Check if all relevant pricing fields are "0" and it's not a reasoning model
      const isFree =
        pricing.prompt === "0" && 
        pricing.completion === "0" && 
        pricing.request === "0" &&
        !isReasoning;

      if (isFree) {
        freeModels.push(model);
      }
    }
  }

  return freeModels;
}