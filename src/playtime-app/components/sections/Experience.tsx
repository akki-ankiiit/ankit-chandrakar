

const experiences = [
  { role: "Founder at Ankit", year: "2024-Now" },
  { role: "Brand Designer at Google", year: "2023-2024" },
  { role: "Web Designer at Shopify", year: "2018-2023" },
  { role: "Junior Designer at Meta", year: "2015-2018" },
];

export const Experience = () => {
  return (
    <section id="resume" className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
      
      {/* Top Split Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-32">
        {/* Left Image Card */}
        <div className="relative rounded-[32px] overflow-hidden bg-black h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&q=80&w=1000" 
            alt="Designer" 
            className="w-full h-full object-cover opacity-80"
          />
          {/* Social Icons */}
          <div className="absolute bottom-6 left-6 flex gap-2 z-10">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white">X</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white">In</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white">Dr</a>
          </div>

          {/* Rotating Badge */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 z-20 animate-[spin_10s_linear_infinite]">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white drop-shadow-xl">
              <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
              <text fontSize="9.5">
                <textPath href="#curve" startOffset="0">
                  AWARD WINNING DESIGNER - SINCE 2020 - 
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex flex-col justify-center">
          <p className="text-xl md:text-2xl font-medium leading-relaxed mb-12">
            A creative designer based in London, UK. He has a passion for crafting digital experiences that leave a lasting impact. He enjoys experimenting with motion design and interactive visuals in his spare time.
          </p>
          
          <div className="w-full border-t border-gray-300 mb-8"></div>
          
          <div className="flex flex-col gap-6">
            {experiences.map((exp, i) => (
              <div key={i} className="flex justify-between items-center w-full text-sm font-medium">
                <span>{exp.role}</span>
                <span className="text-[var(--color-text-secondary)]">{exp.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>



    </section>
  );
};
