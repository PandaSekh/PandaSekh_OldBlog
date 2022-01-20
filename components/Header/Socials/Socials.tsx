import webconfig from "website.config.js";
import DevTo from "./svg/DevTo";
import GitHub from "./svg/Github";
import LinkedIn from "./svg/LinkedIn";
import Twitter from "./svg/Twitter";

export default function Socials() {
  return (
    <nav className="flex flex-row space-x-2">
      <a href={webconfig.social.github.url} target="_blank" rel="noreferrer">
        <GitHub />
      </a>
      <a href={webconfig.social.linkedin.url} target="_blank" rel="noreferrer">
        <LinkedIn />
      </a>
      <a href={webconfig.social.twitter.url} target="_blank" rel="noreferrer">
        <Twitter />
      </a>
      <a href={webconfig.social.devto.url} target="_blank" rel="noreferrer">
        <DevTo />
      </a>
    </nav>
  )
}