

export const MockupsGrid = () => {
  return (
    <section className="w-full px-4">
      <div className="w-full max-w-[1400px] mx-auto mt-16 md:mt-24 rounded-3xl bg-[#09090C] p-6 sm:p-10 md:p-16 overflow-hidden relative min-h-[70vh] md:min-h-[90vh] flex items-center justify-center shadow-2xl border border-white/5">
        {/* Subtle background glow/noise */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,90,31,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-5 bg-[url('/assets/playtime/noise.svg')] mix-blend-overlay pointer-events-none" />

        {/* Perspective Outer wrapper */}
        <div className="w-full h-full relative flex items-center justify-center scale-90 sm:scale-100" style={{ perspective: "1500px" }}>
          
          {/* Tilted cards wrapper */}
          <div 
            className="w-full h-full relative flex items-center justify-center transition-transform duration-700 ease-out"
            style={{
              transform: "rotateX(20deg) rotateY(-8deg) rotateZ(4deg)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Card 1: AL EXPERIENCE (Leftmost) */}
            <div 
              className="absolute w-[20%] aspect-[3/4] bg-[#121214] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-[10px_20px_40px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[10px_25px_50px_rgba(255,90,31,0.15)]"
              style={{
                left: "3%",
                top: "10%",
                transform: "translateZ(30px)",
              }}
            >
              <div className="text-[10px] text-white/40 font-pixel">CASE_01</div>
              <div className="text-xl font-bold uppercase text-white leading-tight rotate-180" style={{ writingMode: "vertical-lr" }}>
                AL EXPERIENCE
              </div>
              <div className="w-full h-1/3 bg-gradient-to-t from-[var(--color-accent-orange)]/20 to-transparent rounded-lg border border-[var(--color-accent-orange)]/10" />
            </div>

            {/* Card 2: VNTNR. (Top Middle-Left) */}
            <div 
              className="absolute w-[26%] aspect-[1.1] bg-[#DF634B] border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-[15px_25px_50px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[15px_30px_60px_rgba(223,99,75,0.3)]"
              style={{
                left: "26%",
                top: "2%",
                transform: "translateZ(80px)",
              }}
            >
              <div className="flex justify-between items-center text-[10px] text-white/60 font-pixel">
                <span>VNTNR. STUDIO</span>
                <span>©2026</span>
              </div>
              <div className="text-3xl font-black uppercase text-white tracking-tighter leading-none mt-4">
                VNTNR<span className="text-black">.</span>
              </div>
              <div className="text-[11px] text-white/80 font-sans mt-2">
                IDEAS / WINERIES / SUBSCRIPTIONS
              </div>
              <div className="w-full h-8 bg-white/10 rounded-md mt-4 flex items-center justify-center text-[10px] font-bold text-white">
                EXPLORE CASE
              </div>
            </div>

            {/* Card 3: Archin Design Studio (Bottom Left-Middle) */}
            <div 
              className="absolute w-[28%] aspect-[1.4] bg-[#161619] border border-white/10 rounded-xl p-4 flex flex-col gap-2 shadow-[20px_30px_60px_rgba(0,0,0,0.7)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[20px_35px_70px_rgba(255,90,31,0.2)]"
              style={{
                left: "15%",
                bottom: "-5%",
                transform: "translateZ(120px)",
              }}
            >
              <div className="w-full aspect-[16/10] bg-[#1A1A1E] rounded-lg overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,90,31,0.15),transparent)]" />
                <div className="p-3 text-white">
                  <div className="text-[9px] text-white/50 font-pixel">ARCHIN_STUDIO</div>
                  <div className="text-sm font-bold mt-1">Archin Design Studio</div>
                  <div className="mt-2 text-[8px] text-white/40">3D ARCHITECTURAL LAYOUTS</div>
                </div>
                <div className="absolute bottom-2 right-2 w-10 h-10 border border-white/10 rounded-full flex items-center justify-center bg-black/40 text-[8px] text-white">
                  CAD
                </div>
              </div>
            </div>

            {/* Card 4: sottozero (Top Right-Middle) */}
            <div 
              className="absolute w-[25%] aspect-[1.2] bg-[#A5785B] border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-[25px_35px_60px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[25px_40px_75px_rgba(165,120,91,0.3)]"
              style={{
                right: "22%",
                top: "10%",
                transform: "translateZ(90px)",
              }}
            >
              <div className="text-[9px] text-white/60 font-pixel uppercase tracking-widest">BRAND IDENTITY</div>
              <div className="text-3xl font-serif italic text-white text-center py-3">
                sottozero
              </div>
              <div className="flex justify-between items-center text-[9px] text-white/70">
                <span>CREATIVE LAB</span>
                <span>MILAN</span>
              </div>
            </div>

            {/* Card 5: CANDREVA DESIGN SHOWCASE (Bottom Middle-Right) */}
            <div 
              className="absolute w-[27%] aspect-[1.3] bg-[#0E0E10] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-[20px_30px_65px_rgba(0,0,0,0.7)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[20px_35px_75px_rgba(255,90,31,0.15)]"
              style={{
                right: "12%",
                bottom: "-2%",
                transform: "translateZ(130px)",
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-[var(--color-accent-orange)] font-bold font-pixel">CANDREVA</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-orange)]" />
              </div>
              <div className="text-base font-bold text-white uppercase mt-2">
                CANDREVA DESIGN SHOWCASE
              </div>
              <div className="w-full aspect-[21/9] bg-[#171719] rounded-lg mt-3 border border-white/5 overflow-hidden flex items-center justify-center p-2">
                <div className="grid grid-cols-3 gap-1 w-full">
                  <div className="h-6 bg-white/5 rounded border border-white/5" />
                  <div className="h-6 bg-[var(--color-accent-orange)]/20 rounded border border-[var(--color-accent-orange)]/20" />
                  <div className="h-6 bg-white/5 rounded border border-white/5" />
                </div>
              </div>
            </div>

            {/* Card 6: CREATIVE + SENS... (Rightmost) */}
            <div 
              className="absolute w-[20%] aspect-[3/4] bg-[#19191D] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-[15px_25px_50px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-500 hover:-translate-y-6 hover:shadow-[15px_30px_60px_rgba(255,90,31,0.1)]"
              style={{
                right: "2%",
                top: "20%",
                transform: "translateZ(50px)",
              }}
            >
              <div className="text-[9px] text-white/30 font-pixel">STAGE_04</div>
              <div className="text-xl font-sans font-black text-white uppercase leading-none py-4">
                CREATIVE <br/>
                <span className="text-stroke font-serif italic text-white/20">+ SENS...</span>
              </div>
              <div className="text-[9px] text-white/40 leading-tight">
                IMPACT DRIVEN SYSTEM
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
