import { Router as WouterRouter, Route, Switch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, LogIn, Instagram, Youtube, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import PostDetail from "@/pages/PostDetail";
import CreatePost from "@/pages/CreatePost";
import EditPost from "@/pages/EditPost";
import ConcertLiveGallery from "@/pages/ConcertLiveGallery";
import MakingFilmGallery from "@/pages/MakingFilmGallery";
import NoticeGallery from "@/pages/NoticeGallery";
import Information from "@/pages/Information";
import Price from "@/pages/Price";
import Reservation from "@/pages/Reservation";
import ReservationBoard from "@/pages/ReservationBoard";
import ReservationDetail from "@/pages/ReservationDetail";
import ClassicalMusicAnalysis from "@/pages/ClassicalMusicAnalysis";
import TechnicalContentAnalysis from "@/pages/TechnicalContentAnalysis";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminHeroBackground from "@/pages/AdminHeroBackground";
import AdminServiceItems from "@/pages/AdminServiceItems";
import AdminSectionTitles from "@/pages/AdminSectionTitles";
import AdminFooterSettings from "@/pages/AdminFooterSettings";
import AdminBoardLayoutSettings from "@/pages/AdminBoardLayoutSettings";
import AdminInstagramPosts from "@/pages/AdminInstagramPosts";
import AdminHeroTextRotation from "@/pages/AdminHeroTextRotation";
import AdminInformation from "@/pages/AdminInformation";
import AdminBoard from "@/pages/AdminBoard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/posts/:id"} component={PostDetail} />
      <Route path={"/post/:id"} component={PostDetail} />
      <Route path={"/information"} component={Information} />
      <Route path={"/price"} component={Price} />
      <Route path={"/reservation"} component={ReservationBoard} />
      <Route path={"/reservation/new"} component={Reservation} />
      <Route path={"/reservation/:id"} component={ReservationDetail} />
      <Route path={"/concert-live"} component={ConcertLiveGallery} />
      <Route path={"/making-film"} component={MakingFilmGallery} />
      <Route path={"/notice"} component={NoticeGallery} />
      <Route path={"/classical-music"} component={ClassicalMusicAnalysis} />
      <Route path={"/technical-content"} component={TechnicalContentAnalysis} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/hero-background"} component={AdminHeroBackground} />
      <Route path={"/admin/service-items"} component={AdminServiceItems} />
      <Route path={"/admin/section-titles"} component={AdminSectionTitles} />
      <Route path={"/admin/footer-settings"} component={AdminFooterSettings} />
      <Route path={"/admin/board-layout-settings"} component={AdminBoardLayoutSettings} />
      <Route path={"/admin/instagram-posts"} component={AdminInstagramPosts} />
        <Route path="/admin/hero-text-rotation" component={AdminHeroTextRotation} />
      <Route path="/admin/information" component={AdminInformation} />
      <Route path="/admin-board" component={AdminBoard} />
      <Route path="/concert-live/new" component={(props) => <CreatePost {...props} category="concert" />} />
      <Route path="/making-film/new" component={(props) => <CreatePost {...props} category="film" />} />
      <Route path="/notice/new" component={(props) => <CreatePost {...props} category="notice" />} />
      <Route path="/posts/:id/edit" component={EditPost} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              {siteBranding?.logoUrl ? (
                <img
                  src={siteBranding.logoUrl}
                  alt={siteBranding.title || '담음미디어'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="text-lg font-bold text-foreground">{siteBranding?.title || '담음미디어'}</div>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 justify-center flex-1">
            <Link href="/information">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Information
              </Button>
            </Link>
            <Link href="/price">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Price
              </Button>
            </Link>
            <Link href="/concert-live">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Concert Live
              </Button>
            </Link>
            <Link href="/making-film">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Making Film
              </Button>
            </Link>
            <Link href="/reservation">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Reservation
              </Button>
            </Link>
            <Link href="/notice">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Notice
              </Button>
            </Link>
          </div>

          {/* Right Side - SNS and Auth */}
          <div className="hidden md:flex items-center gap-2">
            <a href={siteBranding?.instagramUrl || "https://www.instagram.com/dameum_media"} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="text-muted-foreground hover:bg-muted flex items-center gap-1">
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </Button>
            </a>
            <a href={siteBranding?.youtubeUrl || "https://www.youtube.com/@dameum_media"} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="text-muted-foreground hover:bg-muted flex items-center gap-1">
                <Youtube className="h-5 w-5" />
                <span>Youtube</span>
              </Button>
            </a>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hover:text-neutral-400 transition-colors">
                      Admin
                    </Button>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link href="/admin-board">
                    <Button variant="outline" size="sm" className="hover:text-neutral-400 transition-colors flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      관리자게시판
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="flex items-center gap-2 hover:text-neutral-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:text-neutral-400 transition-colors">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link href="/information" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Information
              </Button>
            </Link>
            <Link href="/price" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Price
              </Button>
            </Link>
            <Link href="/concert-live" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Concert Live
              </Button>
            </Link>
            <Link href="/making-film" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Making Film
              </Button>
            </Link>
            <Link href="/reservation" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Reservation
              </Button>
            </Link>
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex gap-2">
                <a href={siteBranding?.instagramUrl || "https://www.instagram.com/dameum_media"} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                </a>
                <a href={siteBranding?.youtubeUrl || "https://www.youtube.com/@dameum_media"} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Youtube className="h-4 w-4 mr-2" />
                    YouTube
                  </Button>
                </a>
              </div>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full hover:text-neutral-400 transition-colors">
                        Admin
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin-board" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full hover:text-neutral-400 transition-colors flex items-center justify-center gap-1">
                        <Shield className="h-3 w-3" />
                        관리자게시판
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 hover:text-neutral-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <a href={getLoginUrl()} className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 hover:text-neutral-400 transition-colors">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <WouterRouter>
      <Navigation />
      <Router />
    </WouterRouter>
  );
}
