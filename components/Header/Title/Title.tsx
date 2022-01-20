import Link from "next/link";

export default function Title() {
  return (
    <>
      <Link href="/" passHref>
        <a className="text-center md:text-left text-5xl">
          <h1>Alessio <strong>Franceschi</strong></h1>
        </a>
      </Link>
    </>
  )
}