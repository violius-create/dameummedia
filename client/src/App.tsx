import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Home as HomeIcon } from "lucide-react";
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

function Navigation() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">담</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">담음미디어</h1>
              <p className="text-xs text-muted-foreground">YouTube Channel Growth Strategy</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="text-sm font-medium">HOME</span>
          </button>
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
      <Route path={"/post/:id"} component={PostDetail} />
      <Route path={"/information"} component={Information} />
      <Route path={"/price"} component={Price} />
      <Route path={"/reservation-board"} component={ReservationBoard} />
      <Route path={"/reservation"} component={Reservation} />
      <Route path={"/reservation/:id"} component={ReservationDetail} />
      <Route path={"/classical-music"} component={ClassicalMusicAnalysis} />
      <Route path={"/technical-content"} component={TechnicalContentAnalysis} />
      <Route path={"/admin"} component={AdminDashboard} />
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
