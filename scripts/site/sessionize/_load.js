import { fetchJson, fetchText } from "../_fetch.js";
import { toArray } from "../_text.js";
import { isEnglishTalk } from "./_language.js";
import { parseSessionizeApiData } from "./_parse-api.js";
import {
  parseSessionizeEvents,
  parseSessionizeSpeaker,
  parseSessionizeTalks,
} from "./_parse-html.js";

export function loadStoredSessionizeData(config, stored = {}) {
  return {
    label: "Sessionize",
    status: stored?.status || "fallback",
    profileUrl: stored?.profileUrl || config?.profile || "",
    speaker: {
      name: stored?.speaker?.name || "",
      headline: stored?.speaker?.headline || "",
      image: stored?.speaker?.image || "",
      summary: stored?.speaker?.summary || "",
      topics: toArray(stored?.speaker?.topics),
    },
    talks: toArray(stored?.talks)
      .filter(isEnglishTalk)
      .map((talk) => ({ ...talk, relatedRepos: toArray(talk.relatedRepos) })),
    events: toArray(stored?.events),
  };
}

export async function loadSessionizeData(config, fallback) {
  const fallbackSpeaker = fallback?.speaker || {};
  const base = {
    label: "Sessionize",
    status: "fallback",
    profileUrl: config?.profile || "",
    speaker: {
      name: "",
      headline: fallback?.speakerHeadline || fallbackSpeaker.headline || "",
      image: "",
      summary: fallback?.summary || fallbackSpeaker.summary || "",
      topics: toArray(fallback?.topics || fallbackSpeaker.topics),
    },
    talks: toArray(fallback?.talks)
      .filter(isEnglishTalk)
      .map((talk) => ({ ...talk, relatedRepos: [] })),
    events: toArray(fallback?.events),
  };
  if (!config?.profile) return base;

  try {
    if (config.api) {
      const apiResponse = await fetchJson(config.api);
      const apiData = parseSessionizeApiData(
        apiResponse,
        config.profile,
        fallback,
        config.preferredLanguage || "en",
      );
      if (apiData.talks.length) {
        return {
          ...base,
          status: "live",
          speaker: {
            ...base.speaker,
            ...apiData.speaker,
            topics: apiData.speaker.topics.length ? apiData.speaker.topics : base.speaker.topics,
          },
          talks: apiData.talks,
          events: apiData.events.length ? apiData.events : base.events,
        };
      }
    }

    const response = await fetchText(config.profile);
    const speaker = parseSessionizeSpeaker(response, fallback);
    const talks = parseSessionizeTalks(response, config.profile, config.preferredLanguage || "en");
    const events = parseSessionizeEvents(response, config.profile);
    return {
      ...base,
      status: "live",
      speaker: {
        ...base.speaker,
        ...speaker,
        topics: speaker.topics.length ? speaker.topics : base.speaker.topics,
      },
      talks: talks.length ? talks : base.talks.filter(isEnglishTalk),
      events: events.length ? events : base.events,
    };
  } catch (error) {
    console.warn(`Sessionize sync fallback: ${error?.message || "unknown error"}`);
    return base;
  }
}
