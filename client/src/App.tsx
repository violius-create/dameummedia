import { Router as WouterRouter, Route, Switch } from "wouter";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import PostDetail from "@/pages/PostDetail";
import CreatePost from "@/pages/CreatePost";
import EditPost from "@/pages/EditPost";
import ConcertLiveGallery from "@/pages/ConcertLiveGallery";
import MakingFilmGallery from "@/pages/MakingFilmGallery";
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
      <Route path="/concert-live/new" component={(props) => <CreatePost {...props} category="concert" />} />
      <Route path="/making-film/new" component={(props) => <CreatePost {...props} category="film" />} />
      <Route path="/posts/:id/edit" component={EditPost} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter>
      <Router />
    </WouterRouter>
  );
}
