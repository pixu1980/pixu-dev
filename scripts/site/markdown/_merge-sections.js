export function mergeSectionsForRender(sections) {
  const clonedSections = sections.map((section) => ({ ...section }));
  const aboutSection = clonedSections.find((section) => section.slug === "about");
  const contactSection = clonedSections.find((section) => section.slug === "contact");

  if (aboutSection && contactSection) {
    aboutSection.contactHtml = contactSection.bodyHtml;
  }

  return clonedSections.filter((section) => section.slug !== "contact");
}
