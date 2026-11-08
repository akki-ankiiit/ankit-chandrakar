import { Component } from 'react';
import { Link } from 'react-router-dom';

// Keep navigation available if a route chunk fails to load or a page cannot render.
export default class RouteErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('route-error-title')?.focus({ preventScroll: true });
    if (this.props.restoration?.current) this.props.restoration.current.restoring = false;
  }

  render() {
    if (this.state.failed) return (
      <section className="route-error container" role="alert" aria-labelledby="route-error-title">
        <p className="eyebrow">Let’s try that again</p>
        <h1 id="route-error-title" tabIndex={-1}>This page couldn’t load.</h1>
        <p>Reload to try again, or return to the portfolio.</p>
        <div><button className="pill" type="button" onClick={() => window.location.reload()}>Reload page</button><Link className="text-link" to="/">Back to the portfolio</Link></div>
      </section>
    );
    return this.props.children;
  }
}
