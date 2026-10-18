import { Outlet } from "react-router-dom";
import TopNavbar from "../components/topNavbar.jsx";
import LeftNavbar from "../components/leftNavbar.jsx";
import logoUrl from "../assets/logoHero.png";
import placeholder from "../assets/accountPlaceholder.png";

export default function RootLayout() {
  return (
    <div className="h-screen overflow-hidden bg-canvas text-text-main flex flex-col px-7.5 pb-5">
      <TopNavbar logoUrl={logoUrl} placeholder={placeholder} />

      <div className="flex flex-1 min-h-0 gap-4 mt-2">
        <aside className="w-20 duration-200 hover:w-56 bg-card rounded-2xl p-4 group overflow-hidden shrink-0 h-full">
          <LeftNavbar />
        </aside>

        <main className="flex-1 h-full overflow-y-auto rounded-2xl p-3 pr-4 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}