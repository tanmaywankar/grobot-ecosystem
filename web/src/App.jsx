import TopNavbar from "./components/topNavbar.jsx";
import LeftNavbar from "./components/leftNavbar.jsx";
import logoUrl from "./assets/logoHero.png";
import placeholder from "./assets/accountPlaceholder.png";
import DeviceCard from "./components/deviceCard.jsx";
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-text-main flex flex-col px-7.5 pb-5">
      <TopNavbar logoUrl={logoUrl} placeholder={placeholder} />
      <div className="flex flex-1 gap-4 mt-2">
        <aside className=" w-20 duration-200 hover:w-56 bg-card rounded-2xl p-4 group overflow-hidden">
          <LeftNavbar />
        </aside>
        <main className="flex-1 rounded-2xl p-3">
          <p className="text-3xl">My Devices</p>
          <DeviceCard />
        </main>
      </div>
    </div>
  );
}
