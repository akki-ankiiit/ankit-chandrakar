import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, designProjects, projects } from '../data/portfolio.js';
import { kSeriesCard } from '../data/k-series.js';
import { bondureCard } from '../data/bondure.js';
import { shinexCard } from '../data/shinex-crystalx.js';
import { Reveal, Selection } from './ui.jsx';
import Icon from './Icon.jsx';
import ProjectDialog from './ProjectDialog.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

const pick = (ids) => ids.map((id) => projects.find((project) => project.id === id)).filter(Boolean);

const packagingItems = [kSeriesCard, bondureCard, shinexCard, ...designProjects.filter((project) => project.id !== bondureCard.id)];

function ProjectCard({ project, index, onOpen }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [videoFailed, setVideoFailed] = useState(false);
  const isDialogProject = !project.href && Boolean(project.locked || (!project.caseStudy?.chapters?.length && !project.embedUrl));

  const cardInner = (
    <>
      <Selection className="project-cover">
        {project.thumbnailVideo && !reduceMotion && !videoFailed ? (
          <video
            src={project.thumbnailVideo.src}
            width={project.thumbnailVideo.width}
            height={project.thumbnailVideo.height}
            poster={project.thumbnailVideo.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <img
            src={project.thumbnail || project.image}
            srcSet={project.thumbnailSrcSet}
            sizes={project.thumbnailSrcSet ? '(max-width: 539px) 84vw, (max-width: 749px) calc(44vw - 9px), (max-width: 999px) calc(50vw - 60px), 440px' : undefined}
            alt={`${project.title} — case study cover`}
            width={project.imageWidth || 1200}
            height={project.imageHeight || 850}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="project-open">
          <Icon name="arrow" size={20} />
        </span>
      </Selection>
      <div className="portfolio-card-meta">
        <span>{project.client} / {project.category}</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.subtitle || project.description}</p>
      {project.tags && (
        <div className="project-tags">
          {project.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <article className="portfolio-card" style={{ '--card-delay': `${index * 50}ms` }}>
      {isDialogProject ? (
        <button
          type="button"
          className="portfolio-card-button"
          onClick={() => onOpen(project)}
          aria-label={`View ${project.title}`}
        >
          {cardInner}
        </button>
      ) : (
        <Link
          className="portfolio-card-button"
          to={project.href || `/work/${project.id}`}
          data-project-link={project.id}
          aria-label={`Read ${project.title} case study`}
        >
          {cardInner}
        </Link>
      )}
    </article>
  );
}

export default function Work({ active = 'case-studies', onCategoryChange }) {
  const setActive = onCategoryChange;
  const tabs = useRef([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const onTabKeyDown = (event, index) => {
    const actions = { ArrowRight: (index + 1) % categories.length, ArrowLeft: (index + categories.length - 1) % categories.length, Home: 0, End: categories.length - 1 };
    if (actions[event.key] === undefined) return;
    event.preventDefault();
    const next = actions[event.key];
    setActive(categories[next].id);
    tabs.current[next]?.focus();
  };

  const scrollToTop = () => {
    const section = document.getElementById('work');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryData = (catId) => {
    switch (catId) {
      case 'case-studies':
      default:
        return {
          topline: 'From user research and architecture to scalable enterprise workflows',
          items: pick(['contractorbhai', 'adhikar', 'atlas', 'cryptotax', 'yesbot']).map((project) => (
            project.id === 'atlas' ? { ...project, href: '/work/atlas-brand' }
              : project.id === 'adhikar' ? { ...project, ...project.appCover, href: '/work/adhikar-brand' } : project
          )),
        };
      case 'websites':
        return {
          topline: 'Editorial web design, responsive e-commerce, and digital brand experiences',
          items: pick(['mistribhai', 'blackspace', 'azure-interiors', 'golf-mill']),
        };
      case 'design-systems':
        return {
          topline: 'Reusable component libraries, design tokens, and multi-product standards',
          items: pick(['neostra-system', 'neostra-dsar', 'neostra-cpmp']),
        };
      case 'packaging-designs':
        return {
          topline: 'Packaging systems, brand identities, and print collateral',
          items: packagingItems,
        };
      case 'brand-design':
        return {
          topline: 'Brand identities, visual languages, and expressions across products',
          items: pick(['neostra', 'thanq']).map((project) => (
            project.id === 'thanq' ? { ...project, href: '/work/thanq' } : project
          )),
        };
    }
  };

  const categoryData = getCategoryData(active);
  const dialogItems = active === 'packaging-designs' ? packagingItems : categoryData.items;

  return (
    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="work-container">
        <Reveal className="work-heading">
          <img className="work-flower" src="/assets/imagery/my-work-icon.svg" width="74" height="56" alt="" loading="lazy" />
          <h2 id="work-title">My work</h2>
          <div className="folder-tabs" role="tablist" aria-label="Work categories">
            {categories.map((category, index) => (
              <button
                key={category.id}
                ref={(element) => { tabs.current[index] = element; }}
                id={`tab-${category.id}`}
                role="tab"
                aria-selected={active === category.id}
                aria-controls="work-panel"
                tabIndex={active === category.id ? 0 : -1}
                className={`folder-tab ${active === category.id ? 'is-active' : ''}`}
                onClick={() => setActive(category.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                <Selection><img src={category.folder} alt="" width="52" height="44" /></Selection>
                <span className="folder-name">{category.label}</span>
                <span className="folder-dot" />
              </button>
            ))}
          </div>
        </Reveal>

        <div id="work-panel" role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0} className="work-panel">
          <div className="gallery-transition" key={active}>
            <div className="gallery-topline">
              <span>{categoryData.topline}</span>
              <span>{categoryData.items.length} projects</span>
            </div>
            <div className="portfolio-grid">
              {categoryData.items.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpen={setSelectedProject}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="back-to-top">
          <Selection>
            <button type="button" className="back-to-top-btn" onClick={scrollToTop} aria-label="Back to top">
              <span aria-hidden="true">★</span>
              <span>Back to top</span>
            </button>
          </Selection>
        </div>

        {selectedProject && (
          <ProjectDialog
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onPrevious={() => {
              const items = dialogItems;
              const idx = items.findIndex((p) => p.id === selectedProject.id);
              const prev = (idx - 1 + items.length) % items.length;
              setSelectedProject(items[prev]);
            }}
            onNext={() => {
              const items = dialogItems;
              const idx = items.findIndex((p) => p.id === selectedProject.id);
              const next = (idx + 1) % items.length;
              setSelectedProject(items[next]);
            }}
            position={dialogItems.findIndex((p) => p.id === selectedProject.id)}
            total={dialogItems.length}
          />
        )}
      </div>
    </section>
  );
}
