import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut, Play, Search, Instagram, Youtube } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import Footer from "@/components/Footer";
import { InstagramFeedSection } from "@/components/InstagramFeedSection";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [heroTitle, setHeroTitle] = useState('담음미디어');
  const [heroSubtitle, setHeroSubtitle] = useState('Professional Media Production');
  const [heroDescription, setHeroDescription] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const heroSectionRef = useRef<HTMLElement>(null);
  const { data: heroTextRotationData } = trpc.heroTextRotation.get.useQuery();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 50 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 50 });
  const { data: featuredConcert } = trpc.posts.getFeatured.useQuery({ category: 'concert' });
  const { data: featuredFilm } = trpc.posts.getFeatured.useQuery({ category: 'film' });
  const { data: reservationPosts } = trpc.reservations.list.useQuery({ limit: 5 });
  const { data: noticePosts } = trpc.posts.list.useQuery({ category: 'notice', limit: 5 });
  const { data: activeHeroBackground } = trpc.heroBackground.getActive.useQuery();
  const { data: section2Background } = trpc.heroBackground.getActiveBySection.useQuery('section2');
  const { data: section3Background } = trpc.heroBackground.getActiveBySection.useQuery('section3');
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();
  const { data: allSectionTitles } = trpc.sectionTitles.list.useQuery();
  const [sections, setSections] = useState<Record<string, { title: string; description: string; thumbnailGap: number; thumbnailWidth: number }>>({});
  const concertScrollRef = useRef<HTMLDivElement>(null);
  const filmScrollRef = useRef<HTMLDivElement>(null);

  // Scroll fade effect for hero section - parallax with overlap
  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const rect = heroSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrolled = -rect.top;
        // Start fading after scrolling past the viewport height
        const fadeStart = viewportHeight * 0.2;
        const fadeEnd = viewportHeight * 0.6;
        if (scrolled <= fadeStart) {
          setHeroOpacity(1);
        } else if (scrolled >= fadeEnd) {
          setHeroOpacity(0);
        } else {
          setHeroOpacity(1 - ((scrolled - fadeStart) / (fadeEnd - fadeStart)));
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero text rotation
  const heroTexts = heroTextRotationData ? [
    { title: heroTextRotationData.text1Title, description: heroTextRotationData.text1Description },
    { title: heroTextRotationData.text2Title, description: heroTextRotationData.text2Description },
    { title: heroTextRotationData.text3Title, description: heroTextRotationData.text3Description },
  ].filter(t => t.title && t.title.trim() !== '') : [];

  const rotationInterval = heroTextRotationData?.intervalMs || 2000;
  const animationType = (heroTextRotationData as any)?.animationType || 'fadeSlideUp';

  // Animation style generator based on animationType
  const getAnimationStyles = (isActive: boolean) => {
    const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
    switch (animationType) {
      case 'fadeScale':
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'scale(1)' : 'scale(0.8)',
            filter: isActive ? 'blur(0px)' : 'blur(4px)',
            transition: `opacity 0.8s ${ease}, transform 0.8s ${ease}, filter 0.8s ${ease}`,
          },
          title: {
            transform: isActive ? 'scale(1)' : 'scale(1.1)',
            transition: `transform 0.9s ${ease}`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.6s ${ease} 0.2s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'scale(1)' : 'scale(0.9)',
            transition: `opacity 0.7s ${ease} 0.15s, transform 0.7s ${ease} 0.15s`,
          },
        };
      case 'slideLeft':
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateX(0)' : 'translateX(-80px)',
            transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
          },
          title: {
            transform: isActive ? 'translateX(0)' : 'translateX(-40px)',
            transition: `transform 0.8s ${ease} 0.1s`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.5s ${ease} 0.3s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateX(0)' : 'translateX(-30px)',
            transition: `opacity 0.6s ${ease} 0.2s, transform 0.6s ${ease} 0.2s`,
          },
        };
      case 'typewriter':
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transition: `opacity 0.3s ${ease}`,
          },
          title: {
            borderRight: isActive ? '3px solid white' : '3px solid transparent',
            animation: isActive ? 'blink-caret 0.75s step-end infinite' : 'none',
            transition: `border-color 0.3s ${ease}`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.4s ${ease} 0.5s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transition: `opacity 0.5s ${ease} 0.3s`,
          },
        };
      case 'flipDown':
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'perspective(600px) rotateX(0deg)' : 'perspective(600px) rotateX(-30deg)',
            transformOrigin: 'top center',
            transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
          },
          title: {
            transform: isActive ? 'translateY(0)' : 'translateY(-20px)',
            transition: `transform 0.8s ${ease}`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.5s ${ease} 0.3s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'perspective(600px) rotateX(0deg)' : 'perspective(600px) rotateX(-15deg)',
            transition: `opacity 0.6s ${ease} 0.2s, transform 0.6s ${ease} 0.2s`,
          },
        };
      case 'glitch':
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transition: `opacity 0.15s steps(3)`,
          },
          title: {
            textShadow: isActive 
              ? '0 0 0 transparent' 
              : '2px 0 #ff0000, -2px 0 #00ff00',
            transform: isActive ? 'skewX(0deg)' : 'skewX(-5deg)',
            transition: `text-shadow 0.3s steps(5), transform 0.3s steps(3)`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.3s steps(4) 0.1s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'skewX(0deg)' : 'skewX(3deg)',
            transition: `opacity 0.2s steps(3) 0.1s, transform 0.2s steps(3) 0.1s`,
          },
        };
      case 'fadeSlideUp':
      default:
        return {
          container: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            filter: isActive ? 'blur(0px)' : 'blur(8px)',
            transition: `opacity 0.8s ${ease}, transform 0.8s ${ease}, filter 0.8s ${ease}`,
          },
          title: {
            transform: isActive ? 'translateX(0)' : 'translateX(-30px)',
            transition: `transform 0.9s ${ease}`,
          },
          line: {
            width: isActive ? '6rem' : '0rem',
            transition: `width 0.6s ${ease} 0.2s`,
          },
          desc: {
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0)' : 'translateY(15px)',
            transition: `opacity 0.7s ${ease} 0.15s, transform 0.7s ${ease} 0.15s`,
          },
        };
    }
  };

  useEffect(() => {
    if (heroTexts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentTextIndex(prev => (prev + 1) % heroTexts.length);
    }, rotationInterval);
    return () => clearInterval(timer);
  }, [heroTexts.length, rotationInterval]);
  
  const scrollConcert = (direction: 'left' | 'right') => {
    if (concertScrollRef.current) {
      const scrollAmount = 300;
      concertScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const scrollFilm = (direction: 'left' | 'right') => {
    if (filmScrollRef.current) {
      const scrollAmount = 300;
      filmScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    console.log("activeHeroBackground:", activeHeroBackground);
  }, [activeHeroBackground]);

  // siteBranding 데이터 로드
  useEffect(() => {
    if (siteBranding) {
      setHeroSubtitle(siteBranding.subtitle || 'Professional Media Production');
    }
  }, [siteBranding]);

  // 활성화된 메인 배경 영상의 제목과 설명 로드
  useEffect(() => {
    if (activeHeroBackground) {
      if (activeHeroBackground.title) {
        setHeroTitle(activeHeroBackground.title);
      }
      if (activeHeroBackground.description) {
        setHeroDescription(activeHeroBackground.description);
      }
      if (activeHeroBackground.overlayOpacity !== undefined && activeHeroBackground.overlayOpacity !== null) {
        setOverlayOpacity(activeHeroBackground.overlayOpacity);
      }
    }
  }, [activeHeroBackground]);

  // 섹션 제목 데이터 로드
  useEffect(() => {
    if (allSectionTitles) {
      const sectionMap: Record<string, { title: string; description: string; thumbnailGap: number; thumbnailWidth: number }> = {};
      allSectionTitles.forEach(section => {
        sectionMap[section.sectionKey] = {
          title: section.title,
          description: section.description || '',
          thumbnailGap: section.thumbnailGap || 24,
          thumbnailWidth: section.thumbnailWidth || 280,
        };
      });
      setSections(sectionMap);
    }
  }, [allSectionTitles]);

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const savedTitle = localStorage.getItem('heroTitle');
    const savedSubtitle = localStorage.getItem('heroSubtitle');
    const savedOpacity = localStorage.getItem('overlayOpacity');
    
    if (savedTitle) setHeroTitle(savedTitle);
    if (savedSubtitle) setHeroSubtitle(savedSubtitle);
    if (savedOpacity) setOverlayOpacity(Number(savedOpacity));
  }, []);

  return (
    <div className="min-h-screen bg-background">



      {/* Full Screen Hero Section - 100vh with parallax scroll */}
      <section 
        ref={heroSectionRef}
        className="relative"
        style={{ height: '150vh', zIndex: 1, background: 'transparent' }}
      >
        <div 
          className="sticky top-0 w-full overflow-hidden"
          style={{ 
            height: '100vh',
            visibility: heroOpacity <= 0 ? 'hidden' : 'visible',
            clipPath: heroOpacity <= 0 ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              opacity: heroOpacity,
              transform: `scale(${1 + (1 - heroOpacity) * 0.1})`,
              transition: 'transform 0.05s linear',
              willChange: 'opacity, transform',
            }}
          >
          {/* Background Media - Full Screen */}
          {activeHeroBackground?.mediaUrl ? (
            activeHeroBackground.type === 'video' ? (
              <video
                key={`video-${activeHeroBackground.id}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={activeHeroBackground.mediaUrl}
              />
            ) : (
              <img
                key={`img-${activeHeroBackground.id}`}
                className="w-full h-full object-cover"
                src={activeHeroBackground.mediaUrl}
                alt="Hero Background"
              />
            )
          ) : (
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=1200&fit=crop"
              alt="Professional Music Production"
            />
          )}

          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />

          {/* Text Content Overlay with Rotation - Vertically Centered */}
          <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-12 md:p-16 z-10">
            <div className="max-w-3xl relative w-full" style={{ minHeight: '250px' }}>
              {heroTexts.length > 0 ? (
                heroTexts.map((text, index) => {
                  const isActive = currentTextIndex === index;
                  const styles = getAnimationStyles(isActive);
                  return (
                    <div
                      key={index}
                      className="absolute inset-0 flex flex-col justify-center"
                      style={{
                        ...styles.container,
                        pointerEvents: isActive ? 'auto' : 'none',
                      }}
                    >
                      <h2 
                        className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-3 sm:mb-5"
                        style={styles.title}
                      >
                        {text.title}
                      </h2>
                      <div 
                        className="h-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mb-5"
                        style={styles.line}
                      />
                      {text.description && (
                        <p 
                          className="text-sm sm:text-lg md:text-2xl text-gray-200 leading-relaxed max-w-2xl font-light"
                          style={styles.desc}
                        >
                          {text.description}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Fallback: use existing heroTitle/heroDescription */
                <div className="flex flex-col justify-center">
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-3 sm:mb-5">
                    {heroTitle}
                  </h2>
                  <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mb-5" />
                  {heroDescription && (
                    <p className="text-sm sm:text-lg md:text-2xl text-gray-200 leading-relaxed max-w-2xl font-light">
                      {heroDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Scroll Down Indicator - dissolve fade arrows only */}
          <div 
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center scroll-indicator"
            style={{ 
              opacity: Math.min(heroOpacity, heroOpacity > 0.5 ? 1 : heroOpacity * 2),
              transition: 'opacity 0.3s ease',
            }}
          >
            <div className="scroll-dissolve-arrow">
              <svg 
                width="48" height="48" viewBox="0 0 24 24" fill="none" 
                className="text-white"
              >
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="scroll-dissolve-arrow" style={{ animationDelay: '1s', marginTop: '-16px' }}>
              <svg 
                width="48" height="48" viewBox="0 0 24 24" fill="none" 
                className="text-white"
              >
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          </div>
        </div>
      </section>

      {/* Additional Hero Sections - Section 2 and 3 Side by Side */}
      <section 
        className="relative"
        style={{
          marginTop: '-50vh',
          borderRadius: '1.5rem 1.5rem 0 0',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.3)',
          zIndex: 10,
          background: 'var(--background)',
        }}
      >
        <div className="flex md:flex-row flex-col">
          {/* Section 2: Concert Live */}
          <div className="relative h-[280px] md:h-[400px] overflow-hidden group flex-1">
            {section2Background?.mediaUrl ? (
              section2Background.type === 'video' ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={section2Background.mediaUrl}
                />
              ) : (
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={section2Background.mediaUrl}
                  alt="Concert Live"
                />
              )
            ) : (
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop"
                alt="Concert Live"
              />
            )}
            <div 
              className="absolute inset-0 bg-black transition-colors"
              style={{ opacity: (section2Background?.overlayOpacity ?? 40) / 100 }}
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10">
              <h2 className="text-3xl md:text-6xl font-bold text-white mb-4">
                {section2Background?.title || 'Concert Live'}
              </h2>
              {section2Background?.description && (
                <p className="text-lg md:text-2xl text-gray-200 max-w-xl">
                  {section2Background.description}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Making Film */}
          <div className="relative h-[280px] md:h-[400px] overflow-hidden group flex-1 md:ml-[10px]">
            {section3Background?.mediaUrl ? (
              section3Background.type === 'video' ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={section3Background.mediaUrl}
                />
              ) : (
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={section3Background.mediaUrl}
                  alt="Making Film"
                />
              )
            ) : (
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=600&fit=crop"
                alt="Making Film"
              />
            )}
            <div 
              className="absolute inset-0 bg-black transition-colors"
              style={{ opacity: (section3Background?.overlayOpacity ?? 40) / 100 }}
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10">
              <h2 className="text-3xl md:text-6xl font-bold text-white mb-4">
                {section3Background?.title || 'Making Film'}
              </h2>
              {section3Background?.description && (
                <p className="text-lg md:text-2xl text-gray-200 max-w-xl">
                  {section3Background.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Concert Live Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-12">
          <div className="mb-12">
            <a href="/concert-live" className="cursor-pointer hover:opacity-80 transition-opacity">
              <h2 className="mb-4 text-4xl font-bold tracking-tight hover:text-primary transition-colors">{sections['concert_live']?.title || '공연 영상'}</h2>
              {sections['concert_live']?.description && (
                <p className="text-lg text-muted-foreground hover:text-foreground transition-colors">{sections['concert_live'].description}</p>
              )}
            </a>
          </div>

          {/* Featured Concert Post */}
          {featuredConcert && (
            <Link href={`/posts/${featuredConcert.id}`}>
              <div className="group cursor-pointer mb-8 rounded-xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all">
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden bg-muted">
                    {featuredConcert.imageUrl ? (
                      <img
                        src={featuredConcert.imageUrl}
                        alt={featuredConcert.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-neutral-900">
                        <Play className="w-16 h-16 text-neutral-500" />
                      </div>
                    )}
                    {featuredConcert.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center bg-neutral-900">
                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 w-fit">Featured</span>
                    <h3 className="text-2xl md:text-4xl font-bold mb-3 text-white group-hover:text-orange-500 transition-colors line-clamp-2">{featuredConcert.title}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-4 mb-4 leading-relaxed">
                      {featuredConcert.content?.replace(/<[^>]*>/g, '').substring(0, 200)}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-amber-400 group-hover:gap-2 transition-all">
                      Watch Now <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Concert Posts Grid */}
          <div className="relative">
            <div 
              ref={(el) => { if (el) concertScrollRef.current = el; }}
              className="flex overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                gap: `${sections['concert_live']?.thumbnailGap || 24}px`
              }}
            >
              {concertPosts?.filter(p => p.id !== featuredConcert?.id).map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <div className="group cursor-pointer flex-shrink-0" style={{ width: `${sections['concert_live']?.thumbnailWidth || 280}px` }}>
                    <div className="relative overflow-hidden rounded-lg h-64 bg-gray-200">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Music className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <button
              onClick={() => scrollConcert('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label="이전 슬라이드"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              onClick={() => scrollConcert('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label="다음 슬라이드"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Making Film Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-12">
          <div className="mb-12">
            <a href="/making-film" className="cursor-pointer hover:opacity-80 transition-opacity">
              <h2 className="mb-4 text-4xl font-bold tracking-tight hover:text-primary transition-colors">{sections['making_film']?.title || '영상 제작'}</h2>
              {sections['making_film']?.description && (
                <p className="text-lg text-muted-foreground hover:text-foreground transition-colors">{sections['making_film'].description}</p>
              )}
            </a>
          </div>

          {/* Featured Film Post */}
          {featuredFilm && (
            <Link href={`/posts/${featuredFilm.id}`}>
              <div className="group cursor-pointer mb-8 rounded-xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all">
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden bg-muted">
                    {featuredFilm.imageUrl ? (
                      <img
                        src={featuredFilm.imageUrl}
                        alt={featuredFilm.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-neutral-900">
                        <Play className="w-16 h-16 text-neutral-500" />
                      </div>
                    )}
                    {featuredFilm.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center bg-neutral-900">
                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 w-fit">Featured</span>
                    <h3 className="text-2xl md:text-4xl font-bold mb-3 text-white group-hover:text-orange-500 transition-colors line-clamp-2">{featuredFilm.title}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-4 mb-4 leading-relaxed">
                      {featuredFilm.content?.replace(/<[^>]*>/g, '').substring(0, 200)}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-amber-400 group-hover:gap-2 transition-all">
                      Watch Now <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Film Posts Grid */}
          <div className="relative">
            <div 
              ref={(el) => { if (el) filmScrollRef.current = el; }}
              className="flex overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                gap: `${sections['making_film']?.thumbnailGap || 24}px`
              }}
            >
              {filmPosts?.filter(p => p.id !== featuredFilm?.id).map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <div className="group cursor-pointer flex-shrink-0" style={{ width: `${sections['making_film']?.thumbnailWidth || 280}px` }}>
                    <div className="relative overflow-hidden rounded-lg h-64 bg-gray-200">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Film className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <button
              onClick={() => scrollFilm('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label="이전 슬라이드"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              onClick={() => scrollFilm('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label="다음 슬라이드"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <InstagramFeedSection />

      {/* Reservation & Notice Preview Section */}
      <section className="bg-background border-t border-border overflow-hidden">
        <div className="container py-24">
          <div className="grid gap-12 md:grid-cols-2 overflow-hidden">
            {/* Reservation Preview */}
            <div>
              <div className="mb-8">
                <a href="/reservation" className="cursor-pointer hover:opacity-80 transition-opacity">
                  <h2 className="text-3xl font-bold tracking-tight hover:text-primary transition-colors border-b-2 border-border pb-3 inline-block">
                    Reservation
                  </h2>
                </a>
              </div>
              <div className="space-y-4">
                {reservationPosts && reservationPosts.length > 0 ? (
                  reservationPosts.map((reservation) => (
                    <Link key={reservation.id} href={`/reservation/${reservation.id}`}>
                      <div className="group cursor-pointer p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border overflow-hidden">
                        {/* 모바일: 2줄 (제목 / 작성자+날짜), PC: 1줄 */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate sm:max-w-[calc(100%-200px)]">
                            {reservation.eventName}
                          </h3>
                          <div className="sm:ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {reservation.status === 'completed' && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary whitespace-nowrap">
                                작업완료
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {reservation.clientName}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(reservation.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              }).replace(/\. /g, '-').replace('.', '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">예약 내역이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Notice Preview */}
            <div>
              <div className="mb-8">
                <a href="/notice" className="cursor-pointer hover:opacity-80 transition-opacity">
                  <h2 className="text-3xl font-bold tracking-tight hover:text-primary transition-colors border-b-2 border-border pb-3 inline-block">
                    Notice
                  </h2>
                </a>
              </div>
              <div className="space-y-4">
                {noticePosts && noticePosts.length > 0 ? (
                  noticePosts.map((notice) => (
                    <Link key={notice.id} href={`/posts/${notice.id}`}>
                      <div className="group cursor-pointer p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className="flex items-center gap-2 w-full">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate max-w-[calc(100%-90px)]">
                            {notice.title}
                          </h3>
                          <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }).replace(/\. /g, '-').replace('.', '')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">공지사항이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
