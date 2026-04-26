export function buildPublicData(frontmatter, data, profileImage, profile) {
  return {
    generatedAt: new Date().toISOString(),
    metadata: {
      title: profile.headline,
      description: profile.description,
    },
    profile: {
      name: profile.name,
      headline: profile.headline,
      description: profile.description,
      summary: profile.description,
      image: profileImage,
      links: frontmatter.links,
      sourceStatus: {
        github: data.github.status,
        sessionize: data.sessionize.status,
        linkedin: data.linkedin.status,
      },
    },
    github: data.github,
    sessionize: data.sessionize,
    linkedin: data.linkedin,
  };
}
