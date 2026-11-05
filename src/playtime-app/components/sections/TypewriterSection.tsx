import { TypewriterDisplay } from '../typewriter/TypewriterDisplay';
import { TypewriterEditor } from '../typewriter/TypewriterEditor';

/** Playtime section: a presentation sheet that types itself, then a sheet the visitor can write on. */
export const TypewriterSection = () => (
  <section className="typewriter-section" aria-labelledby="typewriter-heading">
    <header className="typewriter-heading">
      <p>Pull up a chair</p>
      <h2 id="typewriter-heading">Typewriter</h2>
    </header>
    <div className="typewriter-stack">
      <TypewriterDisplay
        text={"Hello, welcome to my little corner of the internet.\n\nTake your time. Write me a letter below, one key at a time."}
        typingSpeed={70}
        minLines={5}
        seed={7}
        fontSize={24}
        inkVariation={0.75}
        paperGrain={0.35}
        characterImperfection={0.6}
      />
      <TypewriterEditor
        initialText=""
        placeholder="Dear Ankit,"
        minLines={9}
        seed={42}
        fontSize={24}
        inkVariation={0.75}
        paperGrain={0.35}
        characterImperfection={0.6}
        ariaLabel="Write a letter on the typewriter"
      />
    </div>
  </section>
);
