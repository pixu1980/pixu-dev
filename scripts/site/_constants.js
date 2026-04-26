import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(__dirname, "..", "..");
export const DIST = join(ROOT, "dist");
export const SRC = join(ROOT, "src");
export const CONTENT = join(ROOT, "content");

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36";

export const FETCH_TIMEOUT_MS = 9000;

export const DATE_RANGE_RE =
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Sept|Present|\d{4})\b/i;

export const MONTH_YEAR_RE =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i;

export const SECTION_LABELS = new Map([
  ["projects", "Portfolio"],
  ["talks-speaking", "Public Speaking"],
]);

export const STOP_WORDS = new Set([
  "and",
  "with",
  "without",
  "from",
  "into",
  "that",
  "this",
  "your",
  "will",
  "have",
  "the",
  "not",
  "all",
  "one",
  "after",
  "before",
  "work",
]);

export const NON_ENGLISH_TEXT_MARKERS = [
  ["sal", "ve"],
  ["gen", "te"],
  ["sono"],
  ["inter", "facce"],
  ["utente"],
  ["svilup", "patori"],
  ["requi", "siti tecnici"],
  ["durata", " preferita"],
  ["compren", "sione media"],
  ["questo", " talk"],
  ["niente"],
  ["suon di"],
  ["ragazze"],
  ["donne nella tecnologia"],
  ["uguaglianza"],
  ["scopriamo"],
  ["prossimo futuro"],
  ["senza dipendenze"],
  ["vieni per"],
  ["esci con"],
  ["italiano"],
  ["architettura css moderna"],
  ["negli", " ultimi"],
  ["esperienze", " digitali"],
  ["proget", "tazione"],
  ["accessi", "bilit", "\u00e0"],
].map((parts) => parts.join("").toLowerCase());
