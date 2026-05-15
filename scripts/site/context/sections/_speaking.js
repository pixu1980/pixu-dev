import { buildEventView, buildTalkView } from "../_helpers.js";

function buildSpeakingSection(section, _frontmatter, data, leadHtml) {
  return {
    ...section,
    leadHtml,
    speaker: data.sessionize.speaker,
    profileLink: {
      href: data.sessionize.profileUrl,
      label: "Sessionize profile",
      kind: "link",
      isExternal: true,
    },
    talks: data.sessionize.talks.map(buildTalkView),
    events: data.sessionize.events.slice(0, 16).map(buildEventView),
  };
}

export { buildSpeakingSection };
