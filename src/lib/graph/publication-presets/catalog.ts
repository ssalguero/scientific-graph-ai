import type { PublicationPresetId } from "./types";

export type PublicationPresetCatalogEntry = {
  id: PublicationPresetId;
  title: string;
  description: string;
};

export const PUBLICATION_PRESET_CATALOG: PublicationPresetCatalogEntry[] = [
  {
    id: "default",
    title: "Predeterminado",
    description:
      "Estilo del editor: paridad con la apariencia actual de previews VGB.",
  },
  {
    id: "journal",
    title: "Artículo científico",
    description:
      "Tipografía compacta, alto contraste y fondo claro para figuras de publicación.",
  },
  {
    id: "presentation",
    title: "Presentación",
    description:
      "Tipografía amplia y trazos gruesos para proyección y slides.",
  },
];
