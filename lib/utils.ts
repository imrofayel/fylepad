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
      // Check if all relevant pricing fields are "0"
      const isFree =
        pricing.prompt === "0" && pricing.completion === "0" && pricing.request === "0";

      if (isFree) {
        freeModels.push(model);
      }
    }
  }

  return freeModels;
}
