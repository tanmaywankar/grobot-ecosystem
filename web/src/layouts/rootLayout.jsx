import { Outlet } from "react-router-dom";
import TopNavbar from "../components/topNavbar.jsx";
import LeftNavbar from "../components/leftNavbar.jsx";
import BottomNavbar from "../components/bottomNavbar.jsx";
import logoUrl from "../assets/logoHero.png";
import placeholder from "../assets/accountPlaceholder.png";

export default function RootLayout() {
  return (
    <div className="fixed inset-0 md:relative md:h-screen overflow-hidden bg-canvas text-text-main flex flex-col md:pb-5">
      <header className="shrink-0 w-full z-40 bg-canvas px-3 md:px-7.5">
        <TopNavbar logoUrl={logoUrl} placeholder={placeholder} />
      </header>

      <div className="flex flex-1 min-h-0 gap-4 mt-0 md:mt-2 mb-2.5 md:mb-0 px-3 md:px-0 md:pl-7.5 overflow-hidden">
        {/* Fixed slot reserves 80px so main content never contracts when sidebar expands */}
        <div className="hidden md:block relative w-20 shrink-0 h-full">
          <aside className="absolute top-0 left-0 w-20 hover:w-56 duration-200 bg-card rounded-2xl p-4 group overflow-hidden h-full z-30 shadow-2xl transition-all">
            <LeftNavbar />
          </aside>
        </div>

        {/* Full-bleed main: scrollbar sits at right edge of screen while inner content is centered */}
        <main className="flex-1 h-full overflow-hidden md:overflow-y-auto rounded-3xl md:rounded-none p-0 outline-none">
          <div className="w-full max-w-6xl mx-auto h-full px-0 md:px-4 lg:px-8 py-0 md:py-2">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="shrink-0 w-full z-50 md:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
}
