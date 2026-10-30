import { WaterRippleImage } from "./WaterRippleImage";

export const WaterRippleDemo = () => {
  return (
    <div className="w-full bg-[var(--color-bg-primary)] min-h-screen flex flex-col pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 w-full space-y-24">
        
        {/* Intro */}
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Fluid Reality</h2>
          <p className="text-white/60 max-w-2xl text-lg">
            A highly optimized WebGL water ripple engine. Move your cursor to create drag wakes, or click to displace the water mass. 
          </p>
        </div>

        {/* 1. Hero Mode */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white/80 uppercase tracking-widest text-sm">1. Hero (Auto Ripples + Interactive)</h3>
          <div className="relative w-full h-[600px] rounded-3xl overflow-hidden group">
            <WaterRippleImage 
              src="/water.jpg"
              fit="cover"
              className="w-full h-full"
              autoRipples={true}
              interactive={true}
              trigger="both"
              rippleInterval={1200}
              overlayColor="#0a0a0c"
              overlayOpacity={0.1}
            />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6">
              <h1 className="text-white text-5xl md:text-7xl tracking-widest font-serif drop-shadow-2xl opacity-95 uppercase">
                Oceans
              </h1>
            </div>
          </div>
        </div>

        {/* Grid for 2 and 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 2. Click-only mode */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white/80 uppercase tracking-widest text-sm">2. Click Only</h3>
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <WaterRippleImage 
                src="/water.jpg"
                fit="cover"
                className="w-full h-full"
                autoRipples={false}
                interactive={true}
                trigger="click"
                damping={0.94}
              />
              <div className="absolute top-6 left-6 pointer-events-none bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-white font-medium tracking-wide">Pond Surface</p>
                <p className="text-white/70 text-sm">Tap to drop a stone</p>
              </div>
            </div>
          </div>

          {/* 3. Experimental mode */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white/80 uppercase tracking-widest text-sm">3. Deep Distortion</h3>
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <WaterRippleImage 
                src="/water.jpg"
                fit="cover"
                className="w-full h-full"
                autoRipples={true}
                interactive={true}
                trigger="both"
                rippleSize={0.15}
                pointerStrength={1.5}
                clickStrength={1.5}
                waveSpeed={0.4}
                overlayColor="#001122"
                overlayOpacity={0.4}
              />
              <div className="absolute top-6 left-6 pointer-events-none bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-white font-medium tracking-wide">Tidal Wave</p>
                <p className="text-white/70 text-sm">High distortion & speed</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
