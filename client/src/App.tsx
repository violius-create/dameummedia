import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Instagram, Youtube, Search, LogOut, Menu, X } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClassicalMusicAnalysis from "./pages/ClassicalMusicAnalysis";
import TechnicalContentAnalysis from "./pages/TechnicalContentAnalysis";
import AdminDashboard from "./pages/AdminDashboard";
import ConcertLiveGallery from "./pages/ConcertLiveGallery";
import MakingFilmGallery from "./pages/MakingFilmGallery";
import PostDetail from "./pages/PostDetail";
import Information from "./pages/Information";
import Price from "./pages/Price";
import Reservation from "./pages/Reservation";
import ReservationDetail from "./pages/ReservationDetail";
import ReservationBoard from "./pages/ReservationBoard";
import AdminHeroBackground from "./pages/AdminHeroBackground";
import AdminServiceItems from "./pages/AdminServiceItems";
import AdminSectionTitles from "./pages/AdminSectionTitles";

function Navigation() {
  const { data: branding } = trpc.siteBranding.get.useQuery();
  const { user, isAuthenticated, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl || "");
    }
  }, [branding]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-gray-100">
      <div className="container py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/'}>
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-8 sm:h-10 w-auto" />
          )}
          {!logoUrl && (
            <span className="text-lg sm:text-2xl font-light text-gray-800">Logo</span>
          )}
        </div>
        
        {/* Center: Navigation menu - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 flex-1 justify-center">
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline text-sm lg:text-base">
            Information
          </a>
          <a href="/price" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline text-sm lg:text-base">
            Price
          </a>
          <a href="/concert-live" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline text-sm lg:text-base">
            Concert Live
          </a>
          <a href="/making-film" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline text-sm lg:text-base">
            Making Film
          </a>
          <a href="/reservation" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline text-sm lg:text-base">
            Reservation
          </a>
        </div>
        
        {/* Right: SNS + Login */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
          <a href={branding?.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-xs sm:text-sm hover:scale-110">
            Instagram
          </a>
          <a href={branding?.youtubeUrl || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-xs sm:text-sm hover:scale-110">
            YouTube
          </a>
          {isAuthenticated && user?.role === 'admin' && (
            <a href="/admin" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-xs sm:text-sm hover:scale-110 px-2 sm:px-3 py-1 border border-gray-700 rounded hover:bg-gray-700 hover:text-white">
              Admin
            </a>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-xs sm:text-sm hover:scale-110"
            >
              Logout
            </button>
          ) : (
            <a href={getLoginUrl()} className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-xs sm:text-sm hover:scale-110">
              Login
            </a>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-4 text-gray-700 hover:text-gray-900"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-gray-50 py-4">
          <div className="container space-y-3">
            <a href="/" className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm py-2">
              Information
            </a>
            <a href="/price" className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm py-2">
              Price
            </a>
            <a href="/concert-live" className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm py-2">
              Concert Live
            </a>
            <a href="/making-film" className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm py-2">
              Making Film
            </a>
            <a href="/reservation" className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm py-2">
              Reservation
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

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
      <Route path={"/classical-music"} component={ClassicalMusicAnalysis} />
      <Route path={"/technical-content"} component={TechnicalContentAnalysis} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/hero-background"} component={AdminHeroBackground} />
      <Route path={"/admin/service-items"} component={AdminServiceItems} />
      <Route path={"/admin/section-titles"} component={AdminSectionTitles} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ErrorBoundary>
        <Navigation />
        <Router />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
