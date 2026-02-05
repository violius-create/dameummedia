import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut, Play, Search, Instagram, Youtube } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [heroTitle, setHeroTitle] = useState('담음미디어');
  const [heroSubtitle, setHeroSubtitle] = useState('Professional Media Production');
  const [heroDescription, setHeroDescription] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 4 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 4 });
  const { data: activeHeroBackground } = trpc.heroBackground.getActive.useQuery();
  const { data: section2Background } = trpc.heroBackground.getActiveBySection.useQuery('section2');
  const { data: section3Background } = trpc.heroBackground.getActiveBySection.useQuery('section3');
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();
  const { data: allSectionTitles } = trpc.sectionTitles.list.useQuery();
  const [sections, setSections] = useState<Record<string, { title: string; description: string }>>({});
  
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
    }
  }, [activeHeroBackground]);

  // 섹션 제목 데이터 로드
  useEffect(() => {
    if (allSectionTitles) {
      const sectionMap: Record<string, any> = {};
      allSectionTitles.forEach((section: any) => {
        sectionMap[section.sectionKey] = {
          title: section.title,
          description: section.description || '',
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



      {/* Full Screen Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-black">
        <div className="relative w-full h-full">
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-16 z-10">
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
              </div>
              <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none mb-4">
                  {heroTitle}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full" />
              </div>
              {heroDescription && (
                <p className="text-lg md:text-2xl text-gray-100 leading-relaxed max-w-2xl font-light animate-fade-in" style={{animationDelay: '0.6s'}}>
                  {heroDescription}
                </p>
              )}
            </div>
          </div>


        </div>
      </section>



      {/* Additional Hero Sections - Section 2 and 3 Side by Side */}
      <section className="bg-background pt-[10px]">
        <div className="flex md:flex-row flex-col">
          {/* Section 2: Concert Live */}
          <div className="relative h-[400px] overflow-hidden group flex-1">
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
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {section2Background?.title || 'Concert Live'}
              </h2>
              {section2Background?.description && (
                <p className="text-xl md:text-2xl text-gray-200 max-w-xl">
                  {section2Background.description}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Making Film */}
          <div className="relative h-[400px] overflow-hidden group flex-1 md:ml-[10px]">
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
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {section3Background?.title || 'Making Film'}
              </h2>
              {section3Background?.description && (
                <p className="text-xl md:text-2xl text-gray-200 max-w-xl">
                  {section3Background.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Concert Live Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <a href="/concert-live" className="cursor-pointer hover:opacity-80 transition-opacity">
              <h2 className="mb-4 text-4xl font-bold tracking-tight hover:text-primary transition-colors">{sections['concert_live']?.title || '공연 영상'}</h2>
              {sections['concert_live']?.description && (
                <p className="text-lg text-muted-foreground hover:text-foreground transition-colors">{sections['concert_live'].description}</p>
              )}
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {concertPosts?.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="group cursor-pointer">
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
        </div>
      </section>

      {/* Making Film Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <a href="/making-film" className="cursor-pointer hover:opacity-80 transition-opacity">
              <h2 className="mb-4 text-4xl font-bold tracking-tight hover:text-primary transition-colors">{sections['making_film']?.title || '영상 제작'}</h2>
              {sections['making_film']?.description && (
                <p className="text-lg text-muted-foreground hover:text-foreground transition-colors">{sections['making_film'].description}</p>
              )}
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filmPosts?.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="group cursor-pointer">
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
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
