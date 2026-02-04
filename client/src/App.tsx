import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Instagram, Youtube, Search, LogOut } from "lucide-react";
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
            <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
          )}
          {!logoUrl && (
            <span className="text-2xl font-light text-gray-800">Logo</span>
          )}
        </div>
        
        {/* Center: Navigation menu */}
        <div className="flex items-center gap-8 flex-1 justify-center">
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline">
            Information
          </a>
          <a href="/price" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline">
            Price
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline">
            Concert Live
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline">
            Making Film
          </a>
          <a href="/reservation" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:scale-105 hover:underline">
            Reservation
          </a>
        </div>
        
        {/* Right: SNS + Login */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <a href={branding?.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm hover:scale-110">
            Instagram
          </a>
          <a href={branding?.youtubeUrl || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm hover:scale-110">
            YouTube
          </a>
          {isAuthenticated && user?.role === 'admin' && (
            <a href="/admin" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm hover:scale-110 px-3 py-1 border border-gray-700 rounded hover:bg-gray-700 hover:text-white">
              Admin
            </a>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm hover:scale-110"
            >
              Logout
            </button>
          ) : (
            <a href={getLoginUrl()} className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 text-sm hover:scale-110">
              Login
            </a>
          )}
        </div>
      </div>
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
      <TooltipProvider>
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  );
}
