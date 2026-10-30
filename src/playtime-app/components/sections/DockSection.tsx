
import { Dock, type DockItemData } from "../interactive/Dock";

const DOCK_ICONS: DockItemData[] = [
  {
    id: "sketch",
    label: "Sketch",
    icon: "https://framerusercontent.com/images/yieIiJs4Io7H7OOyb6VdJo0GV0.png",
  },
  {
    id: "space",
    label: "Space",
    icon: "https://framerusercontent.com/images/im1xDU711IpwQ1F5LPcC1GOimnY.png",
  },
  {
    id: "framer",
    label: "Framer",
    icon: "https://framerusercontent.com/images/ePXPTROVtwQLiZqZStiqzXTuUY.png",
  },
  {
    id: "figma",
    label: "Figma",
    icon: "https://framerusercontent.com/images/NSuwBm1Ae0XDznilg4YotSLMGs.png",
  },
  {
    id: "perplexity",
    label: "Perplexity",
    icon: "https://framerusercontent.com/images/jpPYF21UL4eqW0jY5ci2gXiF8g.png",
  },
  {
    id: "affinity",
    label: "Affinity",
    icon: "https://framerusercontent.com/images/Cpz5XY0tXRwjJk2qPKBGR7r7n7w.webp?width=128&height=128",
  },
  {
    id: "premierpro",
    label: "Premier Pro",
    icon: "https://framerusercontent.com/images/yB86US72kIebEfzKG1gek1J0xU.webp?width=128&height=128",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    icon: "https://framerusercontent.com/images/XFk7LcfzW6Rw4Tt04qBUaaVsveU.webp?width=128&height=128",
  },
  {
    id: "primevideo",
    label: "Prime Video",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/57/f8/22/57f82253-772d-895e-b521-a8c35a0a5b99/Placeholder.mill/128x128bb-75.webp",
  },
];

export const DockSection = () => {
  return (
    <section className="relative w-full h-[60vh] flex flex-col items-center justify-end font-sans bg-[#0a0a0b] overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 w-full h-px bg-white/5" />

      {/* Background radial gradient to give it a cinematic feel */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(255,255,255,0.05)_0%,transparent_50%)]" />

      {/* Center text just for presentation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/20">
          Hover the Dock
        </h2>
      </div>

      {/* The Dock */}
      <div className="relative z-10 w-full">
        <Dock items={DOCK_ICONS} />
      </div>
    </section>
  );
};
