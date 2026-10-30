import { PocketPlayer } from "../interactive/PocketPlayer";

export const PocketPlayerSection = () => {
  return (
    <section className="w-full py-32 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Title */}
      <div className="absolute top-16 w-full text-center z-0">
        <p className="text-[10px] tracking-[0.3em] text-[#888] uppercase mb-2">Music Player</p>
        <h2 className="text-xl tracking-widest text-[var(--color-text-primary)] font-serif uppercase">Pocket Vibes</h2>
      </div>

      <div className="z-10 mt-12 flex justify-center w-full">
        <PocketPlayer />
      </div>
    </section>
  );
};
