import { buildAboutSection } from "./_about.js";
import { buildPortfolioSection } from "./_portfolio.js";
import { buildSpeakingSection } from "./_speaking.js";
import { buildContactSection } from "./_contact.js";

const SECTION_BUILDERS = {
  about: buildAboutSection,
  portfolio: buildPortfolioSection,
  speaking: buildSpeakingSection,
  contact: buildContactSection,
};

export { SECTION_BUILDERS };
