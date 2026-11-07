export default function HelixWalkthrough() {
  return (
    <section className="helix-walkthrough" aria-labelledby="helix-walkthrough-title">
      <h2 id="helix-walkthrough-title">A two-minute path through the prototype</h2>
      <p>These routes and control labels were inspected in the live demo. Agent runs are simulated and all values are demo data, including predicted properties and scores.</p>
      <ol>
        <li><strong>Find the work in progress.</strong> Open <a href="https://helixlab-one.vercel.app/projects" target="_blank" rel="noreferrer">Projects ↗</a>. Compare the current-stage and crew-status columns: waiting for the lab, running, failed, and low confidence are shown separately.</li>
        <li><strong>Review a recommendation before acting.</strong> Open <a href="https://helixlab-one.vercel.app/projects/p-gyp" target="_blank" rel="noreferrer">Gypsum plaster — Interior machine-applied ↗</a>. In Pathways, inspect P1–P3, their compositions, predicted-versus-target values, cost, and constraint flags. The low-confidence notice identifies extrapolated dosage and limited supporting sources.</li>
        <li><strong>Keep the next decision human.</strong> Inspect the <em>Compare</em>, <em>Request a variant</em>, and <em>Select &amp; design trials</em> controls. They separate comparison and revision from choosing a candidate for trials; a displayed score is not an approval or a lab result.</li>
        <li><strong>Inspect a blocked run.</strong> Open <a href="https://helixlab-one.vercel.app/projects/p-pce" target="_blank" rel="noreferrer">PCE superplasticiser — RMC slump retention ↗</a>. Its failed Literature stage exposes <em>Retry</em> and <em>Ask Lumen</em>, while downstream stages remain waiting.</li>
      </ol>
      <p className="helix-score-note"><strong>Reading the numbers:</strong> “Overall,” target match, cost, and availability are separate demo fields. Their calculation and scientific interpretation are not established by this prototype. They should not be read as calibrated confidence or validated material performance.</p>
    </section>
  );
}
