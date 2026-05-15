import { utilSlug } from "./_shared.js";

function registerTextFilters(renderer) {
  renderer.registerFilter("upper", (value) => String(value).toUpperCase());
  renderer.registerFilter("lower", (value) => String(value).toLowerCase());
  renderer.registerFilter("capitalize", (value) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });
  renderer.registerFilter("slug", (value) => utilSlug(value));
  renderer.registerFilter("trim", (value) => String(value).trim());
  renderer.registerFilter("truncate", (value, length = 100) => {
    const str = String(value);
    return str.length > length ? `${str.substring(0, length)}...` : str;
  });
  renderer.registerFilter("default", (value, defaultValue = "") => {
    return value !== undefined && value !== null && value !== "" ? value : defaultValue;
  });
  renderer.registerFilter("number", (value, decimals = 0) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toFixed(decimals);
  });
  renderer.registerFilter("currency", (value, currency = "EUR") => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: currency,
    }).format(num);
  });
  renderer.registerFilter("timeAgo", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "proprio ora";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minuto" : "minuti"} fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;

    return date.toLocaleDateString("it-IT");
  });
  renderer.registerFilter("slugify", (value) => utilSlug(value));
  renderer.registerFilter("urlencode", (value) => encodeURIComponent(String(value)));
  renderer.registerFilter("pad", (value, length = 2, char = "0") => {
    return String(value).padStart(length, char);
  });
}

export { registerTextFilters };
