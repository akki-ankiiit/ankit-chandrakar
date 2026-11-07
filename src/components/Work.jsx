import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, designProjects, projects } from '../data/portfolio.js';
import { kSeriesCard } from '../data/k-series.js';
import { bondureCard } from '../data/bondure.js';
import { shinexCard } from '../data/shinex-crystalx.js';
import { Reveal, Selection } from './ui.jsx';
import Icon from './Icon.jsx';
import useInView from '../hooks/useInView.js';
import ProjectDialog from './ProjectDialog.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

const pick = (ids) => ids.map((id) => projects.find((project) => project.id === id)).filter(Boolean);

const packagingItems = [kSeriesCard, bondureCard, shinexCard, ...designProjects.filter((project) => project.id !== bondureCard.id)];

// Card evidence stays local: project pages can evolve independently of the gallery.
const productCards = {
  'neostra-dsar': {
    title: 'Neostra · Privacy workflows',
    category: 'Privacy SaaS',
    subtitle: 'Manage data subject requests through clear enterprise privacy workflows.',
    href: '/work/neostra-dsar',
    role: 'Lead Product Designer',
    evidence: 'Product design',
    coverAlt: 'Neostra DSAR — data subject request management product design',
    image: '/assets/portfolio-evidence/neostra-requests.webp',
    imageWidth: 1440,
    imageHeight: 1000,
    thumbnailSrcSet: '/assets/portfolio-evidence/neostra-requests-960.webp 960w, /assets/portfolio-evidence/neostra-requests.webp 1440w',
    tags: ['DSAR management', 'Enterprise workflows'],
  },
  helix: {
    category: 'Materials R&D',
    subtitle: 'Review candidate formulations, constraints, and simulated agent work before planning a lab trial.',
    href: '/work/helix',
    evidence: 'Interactive prototype',
    tags: ['Human-in-the-loop AI', 'Formulation workflows'],
  },
  contractorbhai: {
    category: 'Relationship management',
    subtitle: 'Give relationship managers contractor context, occasion reminders, and personalized messaging.',
    evidence: 'Product design',
    tags: ['Field sales', 'Contractor relationships'],
  },
  atlas: {
    client: 'Selected work',
    category: 'Field sales',
    subtitle: 'Find nearby projects and show relevant local product evidence during sales visits.',
    href: '/work/atlas-brand',
    role: 'Product Designer',
    evidence: 'Product design',
    tags: ['Map-based discovery', 'Sales enablement'],
  },
  adhikar: {
    category: 'Contractor loyalty',
    subtitle: 'Help contractors track points, explore rewards, and share their project portfolios.',
    href: '/work/adhikar-brand',
    evidence: 'Product design',
    tags: ['Rewards', 'Contractor portfolios'],
  },
  yesbot: {
    subtitle: 'Connect knowledge sources, configure a business chatbot, and review conversations.',
    evidence: 'Product design',
  },
  cryptotax: {
    subtitle: 'Connect wallets, review transactions, and navigate cryptocurrency tax reporting.',
    evidence: 'Product design',
  },
};

const productCard = (project) => ({ ...project, ...(project.id === 'adhikar' ? project.appCover : {}), ...productCards[project.id] });

function ProjectCard({ project, index, onOpen }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoRef, videoInView] = useInView('300px');
  const isDialogProject = !project.href && Boolean(project.locked || (!project.caseStudy?.chapters?.length && !project.embedUrl));

  const cardInner = (
    <>
      <Selection className="project-cover">
        {project.thumbnailVideo && !reduceMotion && !videoFailed ? (
          videoInView ? (
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
              ref={videoRef}
              src={project.thumbnailVideo.poster}
              alt={project.coverAlt || `${project.title} — project cover`}
              width={project.thumbnailVideo.width}
              height={project.thumbnailVideo.height}
              loading="lazy"
              decoding="async"
            />
          )
        ) : (
          <img
            src={project.thumbnail || project.image}
            srcSet={project.thumbnailSrcSet}
            sizes={project.thumbnailSrcSet ? '(max-width: 539px) 84vw, (max-width: 749px) calc(44vw - 9px), (max-width: 999px) calc(50vw - 60px), 440px' : undefined}
            alt={project.coverAlt || `${project.title} — project cover`}
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
      {project.evidence && (
        <dl className="card-evidence">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Evidence</dt><dd>{project.evidence}</dd></div>
        </dl>
      )}
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
          aria-label={`View ${project.title}${project.evidence ? ` — ${project.evidence.toLowerCase()}` : ' project'}`}
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
          topline: 'Privacy, AI-assisted operations, and tools for people in the field',
          items: pick(['neostra-dsar', 'helix', 'contractorbhai', 'atlas', 'adhikar']).map(productCard),
          supporting: pick(['yesbot', 'cryptotax']).map(productCard),
        };
      case 'websites':
        return {
          topline: 'Editorial web design, responsive e-commerce, and digital brand experiences',
          items: pick(['blackspace', /* 'azure-interiors', */ 'golf-mill']),
        };
      case 'design-systems':
        return {
          topline: 'Shared product foundations, plus related consent and preference workflows',
          items: pick(['neostra-system', 'neostra-cpmp']),
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
  const dialogItems = [...categoryData.items, ...(categoryData.supporting || [])];

  return (
    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="work-container">
        <Reveal className="work-heading">
          <img className="work-flower" src="/assets/imagery/my-work-icon.svg" width="74" height="56" alt="" loading="lazy" />
          <h2 id="work-title">Selected work</h2>
          <p className="work-intro">Product workflows first. Explore websites, systems, packaging, and brand work in the folders below.</p>
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
            {categoryData.supporting && (
              <section className="supporting-work" aria-labelledby="supporting-work-title">
                <h3 id="supporting-work-title">More product examples</h3>
                <p>Earlier explorations in conversational AI and fintech.</p>
                <div className="portfolio-grid">
                  {categoryData.supporting.map((project, index) => <ProjectCard key={project.id} project={project} index={categoryData.items.length + index} onOpen={setSelectedProject} />)}
                </div>
              </section>
            )}
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
