import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Instagram, Youtube, Search, LogOut } from "lucide-react";
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
  const { user, isAuthenticated } = useAuth();
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl || "");
    }
  }, [branding]);

  return (
    <nav className="border-b border-border bg-gray-100">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
            )}
          </div>
          
          {/* Center: SNS Links */}
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              YouTube
            </a>
          </div>
          
          {/* Right: Search and Login */}
          <div className="flex items-center gap-3">
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            {isAuthenticated && user?.role === 'admin' && (
              <a href="/admin" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Admin
              </a>
            )}
            {isAuthenticated && (
              <button
                className="text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => {
                  trpc.auth.logout.useMutation().mutate();
                }}
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
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
      <Route path={"/classical-music"} component={ClassicalMusicAnalysis} />
      <Route path={"/technical-content"} component={TechnicalContentAnalysis} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/hero-background"} component={AdminHeroBackground} />
      <Route path={"/admin/service-items"} component={AdminServiceItems} />
      <Route path={"/admin/section-titles"} component={AdminSectionTitles} />
      <Route path={"/concert-live"} component={ConcertLiveGallery} />
      <Route path={"/making-film"} component={MakingFilmGallery} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Navigation />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
