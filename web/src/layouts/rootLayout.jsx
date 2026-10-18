import { Outlet } from "react-router-dom";
import TopNavbar from "../components/topNavbar.jsx";
import LeftNavbar from "../components/leftNavbar.jsx";
import BottomNavbar from "../components/bottomNavbar.jsx";
import logoUrl from "../assets/logoHero.png";
import placeholder from "../assets/accountPlaceholder.png";

export default function RootLayout() {
  return (
    <div className="fixed inset-0 md:relative md:h-screen overflow-hidden bg-canvas text-text-main flex flex-col md:px-7.5 md:pb-5">
      <header className="shrink-0 w-full z-40 bg-canvas px-3 md:px-0">
        <TopNavbar logoUrl={logoUrl} placeholder={placeholder} />
      </header>

      <div className="flex flex-1 min-h-0 gap-4 mt-0 md:mt-2 mb-2.5 md:mb-0 px-3 md:px-0 overflow-hidden">
        <aside className="hidden md:block w-20 duration-200 hover:w-56 bg-card rounded-2xl p-4 group overflow-hidden shrink-0 h-full">
          <LeftNavbar />
        </aside>

        <main className="flex-1 h-full overflow-hidden md:overflow-y-auto rounded-2xl p-0 md:p-3 md:pr-4 outline-none">
          <Outlet />
        </main>
      </div>

      <div className="shrink-0 w-full z-50 md:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
}
