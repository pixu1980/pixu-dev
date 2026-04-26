import { englishText, normalizeWhitespace, toArray, truncateText, uniqueBy } from "../_text.js";
import { getSessionizeApiCollection, getSessionizeApiLanguages } from "./_language.js";

function isEnglishSession(session) {
  return /[a-z]/i.test(
    [session?.title, session?.name, session?.description, session?.abstract, session?.summary].join(
      " ",
    ),
  );
}

export function parseSessionizeApiData(payload, profileUrl, fallback, preferredLanguage) {
  const sessions = getSessionizeApiCollection(payload, ["sessions", "talks", "items"]);
  const events = getSessionizeApiCollection(payload, ["events", "appearances"]);
  const speakers = getSessionizeApiCollection(payload, ["speakers"]);
  const speaker =
    speakers.find((candidate) =>
      normalizeWhitespace(candidate?.fullName || candidate?.name)
        .toLowerCase()
        .includes(normalizeWhitespace(fallback?.name).toLowerCase()),
    ) || speakers[0];
  const talks = sessions
    .map((session) => {
      const title = englishText(session?.title || session?.name, "");
      const abstract = englishText(
        session?.description || session?.abstract || session?.summary,
        "",
      );
      const languages = getSessionizeApiLanguages(session, preferredLanguage);
      if (!title || !abstract || (!languages.includes("EN") && !isEnglishSession(session)))
        return null;
      return {
        id: normalizeWhitespace(
          session?.id || session?.sessionId || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ),
        title,
        url: session?.url || profileUrl,
        abstract,
        duration: englishText(session?.duration || session?.format || "", "", { allowShort: true }),
        technicalLevel: englishText(session?.level || session?.audienceLevel || "", "", {
          allowShort: true,
        }),
        languages: languages.length ? languages : ["EN"],
        languageScore: 4,
        relatedRepos: [],
      };
    })
    .filter(Boolean);

  return {
    speaker: {
      name: normalizeWhitespace(speaker?.fullName || speaker?.name || ""),
      headline: englishText(speaker?.tagLine || speaker?.headline || fallback?.speakerHeadline, ""),
      image: speaker?.profilePicture || speaker?.image || "",
      summary: truncateText(
        englishText(speaker?.bio || speaker?.summary || fallback?.summary, ""),
        540,
      ),
      topics: uniqueBy(
        [...toArray(speaker?.categories), ...toArray(speaker?.tags), ...toArray(fallback?.topics)]
          .map((topic) => englishText(topic?.name || topic, "", { allowShort: true }))
          .filter(Boolean),
        (topic) => topic.toLowerCase(),
      ),
    },
    talks,
    events: events
      .map((event) => ({
        name: englishText(event?.name || event?.title, "", { allowShort: true }),
        url: event?.url || profileUrl,
        when: englishText(event?.when || event?.date || event?.startsAt || "", "", {
          allowShort: true,
        }),
        where: englishText(event?.where || event?.location || "", "", { allowShort: true }),
        note: englishText(event?.note || "", ""),
      }))
      .filter((event) => event.name),
  };
}
