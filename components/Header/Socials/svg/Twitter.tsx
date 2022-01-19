export default function Twitter() {
  return (
    // group and group-hover will make so that an hover on the whole icon will activate the fill (otherwise only an hover on the rect will activate it)
    <svg className="w-6 h-6 group" aria-label="Twitter" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="15%" fill="#a2a2a2" className="group-hover:fill-current text-twitter"/>
      <path d="M437 152a72 72 0 01-40 12a72 72 0 0032-40a72 72 0 01-45 17a72 72 0 00-122 65a200 200 0 01-145-74a72 72 0 0022 94a72 72 0 01-32-7a72 72 0 0056 69a72 72 0 01-32 1a72 72 0 0067 50a200 200 0 01-105 29a200 200 0 00309-179a200 200 0 0035-37" fill="#fff"/>
    </svg>
  )
}