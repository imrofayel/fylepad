import { addCollection, IconifyJSON } from "@iconify/vue";

import tabler from "@iconify-json/tabler/icons.json";
import vscode from "@iconify-json/vscode-icons/icons.json";
import logos from "@iconify-json/logos/icons.json";
import material from "@iconify-json/material-icon-theme/icons.json";
import { ICONS } from "./constants/icons";

function getIcons(obj: unknown): string[] {
  if (typeof obj === "string") {
    return [obj];
  }

  if (!obj || typeof obj !== "object") {
    return [];
  }

  return Object.values(obj).flatMap(getIcons);
}

function createFilteredCollection(source: IconifyJSON, names: string[]): IconifyJSON {
  return {
    ...source,
    icons: Object.fromEntries(
      names.filter((name) => source.icons[name]).map((name) => [name, source.icons[name]]),
    ),
  };
}

export function registerIcons() {
  const usedIcons = getIcons(ICONS);

  const grouped: Record<string, string[]> = {};

  for (const icon of usedIcons) {
    if (icon.startsWith("i-")) continue;

    const [prefix, name] = icon.split(":");

    if (!prefix || !name) continue;

    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }

    grouped[prefix].push(name);
  }

  const collections = {
    tabler,
    "vscode-icons": vscode,
    logos,
    "material-icon-theme": material,
  };

  for (const [prefix, names] of Object.entries(grouped)) {
    const source = collections[prefix as keyof typeof collections];

    if (!source) continue;

    addCollection(createFilteredCollection(source as IconifyJSON, names));
  }
}
