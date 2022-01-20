export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="mb-4 text-center left-2/4 mx-auto">
      <small>
        Copyright&copy; {year} Alessio Franceschi.
      </small>
	  <style jsx>{`
	 	 footer::before {
			display: block;
			content: '';
			width: 5rem;
			height: 1px;
			margin: 23px auto;
			background-color: #d5d5d5;
		}
	  `}</style>
    </footer>
  );
}