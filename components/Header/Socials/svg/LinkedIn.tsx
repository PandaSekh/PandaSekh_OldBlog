export default function LinkedIn() {
  return (
    // group and group-hover will make so that an hover on the whole icon will activate the fill (otherwise only an hover on the rect will activate it)
    <svg className="w-6 h-6 group" fill="#fff" aria-label="LinkedIn" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="15%" fill="#a2a2a2" className="group-hover:fill-current text-linkedin"/>
      <circle cx="142" cy="138" r="37"/>
      <path d="M244 194v198M142 194v198" stroke="#fff" strokeWidth="66"/>
      <path d="M276 282c0-20 13-40 36-40 24 0 33 18 33 45v105h66V279c0-61-32-89-76-89-34 0-51 19-59 32"/>
    </svg>
  )
}