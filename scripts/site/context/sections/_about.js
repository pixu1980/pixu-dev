function buildAboutSection(section, _frontmatter, _data, leadHtml) {
  return {
    ...section,
    leadHtml,
  };
}

export { buildAboutSection };
