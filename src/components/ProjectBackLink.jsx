import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import '../styles/project-back-link.css';

export default function ProjectBackLink({ state, label = 'Back to selected work', className = '' }) {
  return (
    <Link className={`project-back-link ${className}`} to="/#work" state={state} aria-label={label} title={label}>
      <Icon name="arrow" size={20} />
    </Link>
  );
}
