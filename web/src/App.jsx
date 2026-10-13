import TopNavbar from "./components/topNavbar.jsx";

import logoUrl from './assets/logoHero.png';
import placeholder from './assets/accountPlaceholder.png';
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-text-main flex flex-col items-center">
      <TopNavbar
      logoUrl = {logoUrl}
      placeholder={placeholder}
      />
    </div>
  );
}