const { useState, useEffect, useRef } = React;

const SensoryUI = () => {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [sceneMode, setSceneMode] = useState('night');
  const [particles, setParticles] = useState([]);
  const [rainDrops, setRainDrops] = useState([]);
  const [lightRays, setLightRays] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [uiVisible, setUiVisible] = useState(true);
  const [language, setLanguage] = useState('ja'); // ja, en, ko
  const scrollTimeoutRef = useRef(null);
  const breathingPhaseRef = useRef(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const mouseTimeoutRef = useRef(null);

  const scenes = {
    night: {
      name: '夜風',
      gradient: 'from-slate-900 via-indigo-950 to-slate-900',
      particleColor: 'rgba(200, 220, 255, 0.3)',
      glowColor: 'rgba(100, 150, 255, 0.1)',
      direction: 'horizontal',
      breathingCycle: 4,
      content: 'profile'
    },
    deep: {
      name: '深海',
      gradient: 'from-slate-900 via-cyan-950 to-slate-800',
      particleColor: 'rgba(100, 180, 200, 0.25)',
      glowColor: 'rgba(80, 150, 180, 0.08)',
      direction: 'still',
      breathingCycle: 7,
      pressure: true,
      content: 'project'
    },
    sky: {
      name: '晴れた空',
      gradient: 'from-sky-300 via-blue-200 to-amber-50',
      particleColor: 'rgba(255, 255, 255, 0.15)',
      glowColor: 'rgba(255, 248, 220, 0.2)',
      direction: 'steady',
      breathingCycle: 5,
      dry: true,
      content: 'works'
    },
    rain: {
      name: '雨の空',
      gradient: 'from-slate-500 via-gray-600 to-slate-600',
      particleColor: 'rgba(200, 210, 220, 0.2)',
      glowColor: 'rgba(180, 190, 200, 0.12)',
      direction: 'gather',
      breathingCycle: 3,
      humid: true,
      content: 'contact'
    }
  };

  const currentScene = scenes[sceneMode];

  // 翻訳テキスト
  const translations = {
    ja: {
      udonConcept: '香川の讃岐うどんを実際に茹で、1本ずつ文字に形成。"食とデザインの融合"をテーマに、遊び心あるフォントを開発。手仕事のゆらぎをデジタルに取り込み、温度感ある書体へ昇華。',
      achievement: 'Booth販売数 600件突破',
      tool: 'Illustrator',
      gagConcept: '誰でも気軽に投稿できる空気をつくるため、意図的に"手抜き風"のイラストを採用。明るい配色とゆるいモチーフで、"笑いの入口"をやさしくデザイン。',
      gagTool: 'Illustrator, V0, VScode',
      role: 'デザイン、コーディング、イラスト',
      contactText: 'お仕事のご相談はこちらからお願いします。',
      emailNote: '※ [at] を @ に変えてください'
    },
    en: {
      udonConcept: 'Boiled Sanuki udon from Kagawa and shaped each strand into letters. Developed a playful font themed "fusion of food and design." Incorporated the fluctuation of handwork into digital, sublimating it into a typeface with warmth.',
      achievement: 'Over 600 sales on Booth',
      tool: 'Illustrator',
      gagConcept: 'To create an atmosphere where anyone can post casually, intentionally adopted "rough-style" illustrations. Designed the "entrance to laughter" gently with bright colors and loose motifs.',
      gagTool: 'Illustrator, V0, VScode',
      role: 'Design, Coding, Illustration',
      contactText: 'Please contact me for work inquiries.',
      emailNote: '※ Replace [at] with @'
    },
    ko: {
      udonConcept: '가가와의 사누키 우동을 실제로 삶아 한 가닥씩 문자로 형성. "음식과 디자인의 융합"을 테마로 유쾌한 폰트를 개발. 수작업의 흔들림을 디지털로 담아 온도감 있는 서체로 승화.',
      achievement: 'Booth 판매 600건 돌파',
      tool: 'Illustrator',
      gagConcept: '누구나 부담 없이 게시할 수 있는 분위기를 만들기 위해 의도적으로 "러프 스타일" 일러스트를 채택. 밝은 배색과 여유로운 모티프로 "웃음의 입구"를 부드럽게 디자인.',
      gagTool: 'Illustrator, V0, VScode',
      role: '디자인, 코딩, 일러스트',
      contactText: '업무 문의는 이쪽으로 부탁드립니다.',
      emailNote: '※ [at]을 @로 바꿔주세요'
    }
  };

  const t = translations[language];

  // マウス位置の追跡
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });

      setUiVisible(true);
      clearTimeout(mouseTimeoutRef.current);
      
      mouseTimeoutRef.current = setTimeout(() => {
        setUiVisible(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // シーンの自動切り替え
  useEffect(() => {
    const sceneOrder = ['night', 'deep', 'sky', 'rain'];
    const interval = setInterval(() => {
      setSceneProgress(prev => {
        const next = prev + 1;
        const sceneIndex = Math.floor(next / 150) % 4;
        setSceneMode(sceneOrder[sceneIndex]);
        return next % 600;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // 粒子・光・雨の初期化
  useEffect(() => {
    const particleCount = sceneMode === 'deep' ? 25 : sceneMode === 'sky' ? 15 : 40;
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      size: sceneMode === 'deep' 
        ? Math.random() * 2 + 0.5 
        : sceneMode === 'sky'
        ? Math.random() * 0.8 + 0.3
        : Math.random() * 3 + 1,
      speedX: sceneMode === 'sky' 
        ? 0.15 
        : sceneMode === 'deep'
        ? 0
        : (Math.random() - 0.5) * 0.3,
      speedY: sceneMode === 'deep'
        ? 0
        : sceneMode === 'rain'
        ? 0
        : (Math.random() - 0.5) * 0.2,
      opacity: sceneMode === 'sky' ? 0.2 : Math.random() * 0.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      wigglePhase: Math.random() * Math.PI * 2
    }));
    setParticles(newParticles);

    if (sceneMode === 'sky') {
      const rays = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: Math.random() * 60 + 10,
        width: Math.random() * 100 + 150,
        opacity: Math.random() * 0.1 + 0.05,
        delay: i * 0.8
      }));
      setLightRays(rays);
      
      // キラキラ用の追加データ
      const sparkles = Array.from({ length: 15 }, (_, i) => ({
        id: `sparkle-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 2,
        delay: Math.random() * 3
      }));
      setLightRays([...rays, ...sparkles]);
    }

    if (sceneMode === 'rain') {
      const drops = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 50 + 100,
        y: Math.random() * 100 - 20,
        length: Math.random() * 15 + 10,
        speed: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.3 + 0.2,
        delay: Math.random() * 2
      }));
      setRainDrops(drops);
    }
  }, [sceneMode]);

  // スクロール速度の検出
  useEffect(() => {
    let lastScroll = window.scrollY;
    let lastTime = Date.now();

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTime;
      
      if (timeDiff > 0) {
        const velocity = Math.abs(currentScroll - lastScroll) / timeDiff;
        setScrollVelocity(Math.min(velocity * 50, 10));
      }

      lastScroll = currentScroll;
      lastTime = currentTime;

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollVelocity(0);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 粒子と雨のアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      const cycle = currentScene.breathingCycle || 4;
      // スクロール速度で呼吸が速くなる
      const breathingSpeed = 0.02 / cycle * (1 + scrollVelocity * 0.3);
      breathingPhaseRef.current += breathingSpeed;
      
      setParticles(prev => prev.map(p => {
        let newX = p.x;
        let newY = p.y;
        
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const mouseEffect = Math.max(0, 15 - distance) / 15;
        
        if (sceneMode === 'deep') {
          const wiggle = Math.sin(breathingPhaseRef.current * 3 + p.wigglePhase) * 0.15;
          newX = p.x + wiggle - dx * mouseEffect * 0.3;
          newY = p.y + Math.cos(breathingPhaseRef.current * 2 + p.phase) * 0.1 - dy * mouseEffect * 0.3;
        } else if (sceneMode === 'sky') {
          newX = p.x + p.speedX - dx * mouseEffect * 0.2;
          newY = p.y - dy * mouseEffect * 0.2;
        } else if (sceneMode === 'rain') {
          const gather = Math.sin(breathingPhaseRef.current * 4 + p.phase) * 0.2;
          newX = p.x + gather * 0.3 - dx * mouseEffect * 0.15;
          newY = p.y + gather * 0.2 - dy * mouseEffect * 0.15;
        } else {
          newX = p.x + p.speedX * (1 + scrollVelocity * 0.5) - dx * mouseEffect * 0.25;
          newY = p.y + p.speedY * (1 + scrollVelocity * 0.3) - dy * mouseEffect * 0.25;
          
          const breathe = Math.sin(breathingPhaseRef.current + p.phase) * 0.1;
          newY += breathe;
        }

        if (newX > 100) newX = sceneMode === 'sky' ? 0 : 100;
        if (newX < 0) newX = sceneMode === 'sky' ? 100 : 0;
        if (newY > 100) newY = 0;
        if (newY < 0) newY = 100;

        return { ...p, x: newX, y: newY };
      }));

      if (sceneMode === 'rain') {
        setRainDrops(prev => prev.map(drop => {
          let newY = drop.y + drop.speed;
          let newX = drop.x - drop.speed * 0.5;
          
          if (newY > 110 || newX < -20) {
            newY = -10;
            newX = Math.random() * 50 + 100;
          }
          
          return { ...drop, x: newX, y: newY };
        }));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [scrollVelocity, sceneMode, currentScene, mousePos]);

  const ContentCard = ({ children, delay = 0, isDark = false }) => (
    <div
      className="backdrop-blur-md p-6 md:p-8 transition-opacity duration-1000 max-w-3xl w-full"
      style={{
        background: isDark ? 'rgba(50, 50, 50, 0.25)' : 'rgba(255, 255, 255, 0.08)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        opacity: uiVisible ? 1 : 0.3
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
        e.currentTarget.style.background = isDark ? 'rgba(50, 50, 50, 0.35)' : 'rgba(255, 255, 255, 0.12)';
        e.currentTarget.style.transition = 'all 0.3s ease-out';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.background = isDark ? 'rgba(50, 50, 50, 0.25)' : 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transition = 'all 0.3s ease-out';
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden cursor-none">
      {/* 言語切り替えボタン */}
      <div 
        className="fixed top-6 right-6 z-50 flex gap-2 transition-opacity duration-1000"
        style={{ opacity: uiVisible ? 1 : 0.3 }}
      >
        {['ja', 'en', 'ko'].map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 rounded-md text-xs font-light tracking-wide transition-all duration-300 ${
              language === lang 
                ? 'bg-white/20 text-white/90' 
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
            style={{
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {lang === 'ja' ? '日本語' : lang === 'en' ? 'EN' : '한국어'}
          </button>
        ))}
      </div>

      {/* 背景グラデーション */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br ${currentScene.gradient} transition-all duration-[2000ms]`}
        style={{
          // スクロール速度で呼吸のリズムと振幅が変わる
          opacity: 0.85 + Math.sin(breathingPhaseRef.current * 0.5) * (0.15 + scrollVelocity * 0.02),
          transform: `scale(${1 + scrollVelocity * 0.01})`,
          filter: `brightness(${1 + scrollVelocity * 0.05}) ${sceneMode === 'rain' ? 'saturate(0.7)' : 'saturate(1)'}`
        }}
      />

      {/* 視界の端をぼかす */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.3) 100%)',
          opacity: uiVisible ? 0.2 : 0.5
        }}
      />

      {/* 光のにじみ */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-[800ms]"
        style={{
          background: sceneMode === 'deep'
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${currentScene.glowColor}, transparent 50%)`
            : sceneMode === 'sky'
            ? `radial-gradient(circle at 50% 30%, ${currentScene.glowColor}, transparent 70%)`
            : sceneMode === 'rain'
            ? `radial-gradient(ellipse at 50% 50%, ${currentScene.glowColor}, transparent 80%)`
            : `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${currentScene.glowColor}, transparent 70%)`,
          transform: sceneMode === 'sky' 
            ? 'scale(1)' 
            : `scale(${1 + scrollVelocity * 0.02})`,
          transition: 'all 0.6s ease-out',
          filter: sceneMode === 'rain' ? 'blur(40px)' : sceneMode === 'deep' ? 'blur(60px)' : 'blur(20px)'
        }}
      />

      {/* 粒子 */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(p => {
          const densityBoost = sceneMode === 'deep' && scrollVelocity < 0.5 ? 1.3 : 1;
          const rainFade = sceneMode === 'rain' && scrollVelocity < 0.5 ? 0.8 : 1;
          
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const brightnessBoost = Math.max(0, 20 - distance) / 20;
          
          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size * densityBoost}px`,
                height: `${p.size * densityBoost}px`,
                backgroundColor: currentScene.particleColor,
                opacity: (sceneMode === 'sky' 
                  ? p.opacity * 0.6
                  : sceneMode === 'rain'
                  ? p.opacity * rainFade * (1 - scrollVelocity * 0.1)
                  : p.opacity * (1 - scrollVelocity * 0.05)) * (1 + brightnessBoost * 0.5),
                filter: sceneMode === 'rain' 
                  ? 'blur(3px)' 
                  : sceneMode === 'sky'
                  ? 'blur(0.5px)'
                  : sceneMode === 'deep'
                  ? 'blur(1.5px)'
                  : 'blur(1px)',
                transition: sceneMode === 'rain' 
                  ? 'opacity 0.5s ease-out' 
                  : 'opacity 0.4s ease-out',
                boxShadow: sceneMode === 'deep' 
                  ? `0 0 ${p.size * 3 * (1 + brightnessBoost)}px ${currentScene.particleColor}` 
                  : 'none'
              }}
            />
          );
        })}
      </div>

      {/* 晴れた空：光の筋とキラキラ */}
      {sceneMode === 'sky' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {lightRays.map(item => {
            // キラキラ
            if (item.id.toString().startsWith('sparkle')) {
              return (
                <div
                  key={item.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${item.left}%`,
                    top: `${item.top}%`,
                    width: `${item.size}px`,
                    height: `${item.size}px`,
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent)',
                    animation: `sparkle ${2 + item.delay}s ease-in-out infinite`,
                    animationDelay: `${item.delay}s`,
                    filter: 'blur(1px)'
                  }}
                />
              );
            }
            // 光の筋
            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  right: '-10%',
                  top: `${item.top}%`,
                  width: `${item.width}px`,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, rgba(255, 248, 220, ${item.opacity}), transparent)`,
                  transform: 'rotate(-15deg)',
                  filter: 'blur(1px)',
                  animation: `lightShift ${8 + item.delay}s ease-in-out infinite`,
                  animationDelay: `${item.delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {/* 雨の空：雨粒 */}
      {sceneMode === 'rain' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {rainDrops.map(drop => (
            <div
              key={drop.id}
              className="absolute"
              style={{
                left: `${drop.x}%`,
                top: `${drop.y}%`,
                width: '1.5px',
                height: `${drop.length}px`,
                background: `linear-gradient(180deg, transparent, rgba(200, 210, 220, ${drop.opacity}))`,
                transform: 'rotate(25deg)',
                filter: 'blur(0.5px)',
                animationDelay: `${drop.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* カスタムカーソル */}
      <div
        className="fixed pointer-events-none transition-opacity duration-500 z-50"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${currentScene.glowColor.replace('0.1', '0.3')}, transparent)`,
          filter: 'blur(15px)',
          opacity: uiVisible ? 0.6 : 0
        }}
      />

      {/* コンテンツ */}
      <div className="relative z-10">
        {/* 夜風：プロフィール */}
        {currentScene.content === 'profile' && (
          <div className="min-h-screen flex items-center justify-center p-8">
            <div 
              className="text-center transition-opacity duration-1000"
              style={{ opacity: uiVisible ? 1 : 0.3 }}
            >
              <h1 className="text-5xl md:text-7xl text-white/90 font-light mb-4 tracking-widest" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>
                Hitomi Tsuboi
              </h1>
              <p className="text-lg md:text-xl text-white/60 font-light tracking-widest" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>
                Portfolio
              </p>
            </div>
          </div>
        )}

        {/* 深海：うどんフォント */}
        {currentScene.content === 'project' && (
          <div className="min-h-screen flex items-center justify-center p-8">
            <ContentCard delay={1}>
              <h2 className="text-lg md:text-xl text-white/80 font-light mb-4 tracking-wide">
                うどんフォント
              </h2>
              
              {/* 画像 */}
              <div className="mb-4 rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                <img 
                  src="https://raw.githubusercontent.com/momonotsubo/portfolio/main/images/udon-font.jpg" 
                  alt="うどんフォント" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Concept</h3>
                  <p className="text-xs md:text-sm font-light">
                    {t.udonConcept}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Achievement</h3>
                    <p className="text-white/80 font-light text-xs">{t.achievement}</p>
                  </div>
                  <div>
                    <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Tool</h3>
                    <p className="text-white/80 font-light text-xs">{t.tool}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href="https://tsubochi.booth.pm/items/2154120" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white/90 transition-colors duration-300 text-xs tracking-wide"
                  >
                    Booth →
                  </a>
                  <a 
                    href="https://www.instagram.com/udonfont/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white/90 transition-colors duration-300 text-xs tracking-wide"
                  >
                    Instagram →
                  </a>
                </div>
              </div>
            </ContentCard>
          </div>
        )}

        {/* 晴れた空：その他の作品 */}
        {currentScene.content === 'works' && (
          <div className="min-h-screen flex items-center justify-center p-8">
            <ContentCard delay={2} isDark={true}>
              <h2 className="text-lg md:text-xl text-white/80 font-light mb-4 tracking-wide">
                ギャグ投稿アプリ
              </h2>
              
              {/* 画像 */}
              <div className="mb-4 rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                <img 
                  src="https://raw.githubusercontent.com/momonotsubo/portfolio/main/images/gag-app.jpg" 
                  alt="ギャグ投稿アプリ" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Concept</h3>
                  <p className="text-xs md:text-sm font-light">
                    {t.gagConcept}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Tool</h3>
                    <p className="text-white/80 font-light text-xs">{t.gagTool}</p>
                  </div>
                  <div>
                    <h3 className="text-white/50 text-xs mb-1 tracking-wider uppercase">Role</h3>
                    <p className="text-white/80 font-light text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>
        )}

        {/* 雨：コンタクト */}
        {currentScene.content === 'contact' && (
          <div className="min-h-screen flex items-center justify-center p-8">
            <ContentCard delay={3}>
              <h2 className="text-xl md:text-2xl text-white/80 font-light mb-6 tracking-wide">
                Contact
              </h2>
              <p className="text-base text-white/60 font-light leading-relaxed mb-6">
                {t.contactText}
              </p>
              <div className="mt-6">
                <p className="text-white/70 text-sm font-light">
                  hitomitsuboiportforio[at]gmail.com
                </p>
                <p className="text-white/40 text-xs mt-2">
                  {t.emailNote}
                </p>
              </div>
            </ContentCard>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<SensoryUI />, document.getElementById('root'));