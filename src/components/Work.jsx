import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, designBooks, designProjects, imagery, projects } from '../data/portfolio.js';
import { Reveal, Selection } from './ui.jsx';
import Icon from './Icon.jsx';
import ProjectDialog from './ProjectDialog.jsx';

const pick = (ids) => ids.map((id) => projects.find((project) => project.id === id)).filter(Boolean);

const designThumbnail = designProjects.find((project) => project.id === 'jv-wedding').image;

function ProjectCard({ project, index, onOpen }) {
  const isDialogProject = Boolean(project.locked || (!project.caseStudy?.chapters?.length && !project.embedUrl));

  const cardInner = (
    <>
      <Selection className="project-cover">
        <img
          src={project.image}
          alt={`${project.title} — case study cover`}
          width="1200"
          height="850"
          loading="lazy"
        />
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
          to={`/work/${project.id}`}
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
  const allDesignItems = [...designBooks, ...designProjects];

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
        return {
          topline: 'From user research and architecture to scalable enterprise workflows',
          items: pick(['cryptotax', 'yesbot']),
        };
      case 'websites':
        return {
          topline: 'Editorial web design, responsive e-commerce, and digital brand experiences',
          items: pick(['blackspace', 'azure-interiors', 'atlas', 'golf-mill']),
        };
      case 'apps':
        return {
          topline: 'Enterprise platforms, conversational AI workspaces, and mobile interfaces',
          items: pick(['adhikar', 'contractorbhai', 'mistribhai', 'thanq']),
        };
      case 'design-systems':
        return {
          topline: 'Reusable component libraries, design tokens, and multi-product standards',
          items: pick(['neostra-system', 'golf-mill-system']),
        };
      case 'packaging-designs':
      default:
        return {
          topline: 'Special-edition book jackets, luxury packaging, and print collateral',
          items: allDesignItems,
        };
    }
  };

  const categoryData = getCategoryData(active);

  return (
    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="work-container">
        <Reveal className="work-heading">
          <img className="work-flower" src={imagery.flower} width="64" height="77" alt="" loading="lazy" />
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
          {active === 'packaging-designs' ? (
            <div className="design-panel gallery-transition" key="packaging-designs">
              <div className="gallery-topline">
                <span>{categoryData.topline}</span>
                <span>{allDesignItems.length} projects</span>
              </div>
              <div className="book-grid">
                {designBooks.map((book) => (
                  <article
                    key={book.id}
                    className="book-card"
                    onClick={() => setSelectedProject(book)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${book.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProject(book);
                      }
                    }}
                  >
                    <div className="book-card-cover">
                      <img src={book.image} alt={book.title} width="562" height="800" loading="lazy" />
                    </div>
                    <div className="book-card-info">
                      <h3 className="book-card-title">{book.title}</h3>
                      <p className="book-card-author">{book.author}</p>
                      <div className="book-card-rating">
                        <span className="goodreads-logo">goodreads</span>
                        <span className="book-stars" aria-label={`${book.stars} out of 5 stars`}>
                          {'★'.repeat(book.stars)}
                          {'☆'.repeat(book.maxStars - book.stars)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="design-grid">
                {designProjects.map((project) => (
                  <article
                    key={project.id}
                    className="design-card"
                    onClick={() => setSelectedProject(project)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${project.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProject(project);
                      }
                    }}
                  >
                    <div className="design-card-cover">
                      <Selection>
                        <img src={designThumbnail} alt={project.title} width="1200" height="659" loading="lazy" />
                      </Selection>
                    </div>
                    <div className="design-card-info">
                      <p className="design-card-meta">
                        <strong>{project.client}</strong> <span>| {project.category}</span>
                      </p>
                      <h3 className="design-card-title">{project.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
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
          )}
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
              const items = active === 'packaging-designs' ? allDesignItems : categoryData.items;
              const idx = items.findIndex((p) => p.id === selectedProject.id);
              const prev = (idx - 1 + items.length) % items.length;
              setSelectedProject(items[prev]);
            }}
            onNext={() => {
              const items = active === 'packaging-designs' ? allDesignItems : categoryData.items;
              const idx = items.findIndex((p) => p.id === selectedProject.id);
              const next = (idx + 1) % items.length;
              setSelectedProject(items[next]);
            }}
            position={(active === 'packaging-designs' ? allDesignItems : categoryData.items).findIndex((p) => p.id === selectedProject.id)}
            total={(active === 'packaging-designs' ? allDesignItems : categoryData.items).length}
          />
        )}
      </div>
    </section>
  );
}
