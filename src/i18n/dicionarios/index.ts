import type { IdiomaSite } from "../config";
import { en } from "./en";
import { es } from "./es";
import { pt, type Dicionario } from "./pt";

export type { Dicionario };
export const dicionarios: Record<IdiomaSite, Dicionario> = { pt, es, en };
