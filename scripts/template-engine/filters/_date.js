function registerDateFilters(renderer) {
  renderer.registerFilter("date", (value, format = "it-IT") => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    if (format.includes("%")) {
      const options = {};
      if (format.includes("%d")) options.day = "numeric";
      if (format.includes("%B")) options.month = "long";
      if (format.includes("%Y")) options.year = "numeric";
      return date.toLocaleDateString("it-IT", options);
    }

    switch (format) {
      case "full":
        return date.toLocaleDateString("it-IT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      case "long":
        return date.toLocaleDateString("it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      case "medium":
        return date.toLocaleDateString("it-IT", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

      case "short":
        return date.toLocaleDateString("it-IT", {
          year: "2-digit",
          month: "numeric",
          day: "numeric",
        });

      case "iso":
        return date.toISOString();

      case "YYYY-MM-DD":
        return date.toISOString().split("T")[0];

      case "DD MMM YYYY": {
        const months = [
          "Gen",
          "Feb",
          "Mar",
          "Apr",
          "Mag",
          "Giu",
          "Lug",
          "Ago",
          "Set",
          "Ott",
          "Nov",
          "Dic",
        ];
        const day = date.getDate().toString().padStart(2, "0");
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      }

      case "time":
        return date.toLocaleTimeString("it-IT");

      case "datetime":
        return date.toLocaleString("it-IT");
      default: {
        const options = {
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        try {
          return date.toLocaleDateString(format, options);
        } catch {
          console.warn(`Invalid locale "${format}", falling back to 'it-IT'`);
          return date.toLocaleDateString("it-IT", options);
        }
      }
    }
  });
}

export { registerDateFilters };
