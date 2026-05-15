import { buildAboutSection } from "./_about.js";
import { buildPortfolioSection } from "./_portfolio.js";
import { buildSpeakingSection } from "./_speaking.js";

const SECTION_BUILDERS = {
  about: buildAboutSection,
  portfolio: buildPortfolioSection,
  speaking: buildSpeakingSection,
};

export { SECTION_BUILDERS };
