import PagesNav from "./PagesNav/PagesNav";
import Socials from "./Socials/Socials";
import Title from "./Title/Title";

export default function Header() {
  return (
    <header className="flex md:flex-row flex-col md:justify-around md:items-baseline items-center mt-3 mb-8 gap-y-2">
      <div className="flex md:flex-row flex-col items-center md:items-baseline md:gap-2 gap-y-2">
        <Title />
        <PagesNav />
      </div>
      <Socials />
    </header>
  )
}