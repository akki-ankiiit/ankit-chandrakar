import { projectOverviews } from './project-overviews.js';

export const projectMetas = Object.fromEntries(Object.entries(projectOverviews).map(([id, project]) => [id, {
  path: `/work/${({ atlas: 'atlas-brand', adhikar: 'adhikar-brand' })[id] || id}`,
  siteUrl: 'https://ankit.devs.surf',
  title: `${project.title} — Product design by Ankit Chandrakar`,
  description: project.description,
  image: project.image,
  imageAlt: `${project.title} — ${project.domain}`,
}]));
