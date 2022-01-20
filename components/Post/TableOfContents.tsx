// https://www.emgoto.com/react-table-of-contents/
import { useEffect, useState } from "react";

export default function TableOfContents() {
  const { nestedHeadings } = useHeadingsData();
  return (
    <nav aria-label="Table of contents" className="prose">
      <h3>Table of Contents</h3>
      <Headings headings={nestedHeadings || []} />
    </nav>
  );
}

const Headings = ({ headings }: {headings: TOCElement[]}) => (
  <ul>
    {headings.map((heading) => (
      <li key={heading.id}>
      <a href={`#${heading.id}`}
        onClick={(e) => {
          e.preventDefault();
          document.querySelector(`#${heading.id}`)?.scrollIntoView({
            behavior: "smooth"
          });
        }}
      >{heading.title}</a>
      {heading && heading.items && heading.items?.length > 0 && (
        <ul>
          {heading?.items?.map((child) => (
            <li key={child.id}>
              <a href={`#${child.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#${child.id}`)?.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              >{child.title}</a>
            </li>
          ))}
        </ul>
      )}
    </li>
    ))}
  </ul>
);

const useHeadingsData = () => {
  const [nestedHeadings, setNestedHeadings] = useState<TOCElement[]>();

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll<HTMLElement>("h2, h3, h4")
    );

    const newNestedHeadings: TOCElement[] = getNestedHeadings(headingElements);
    setNestedHeadings(newNestedHeadings);
  }, []);

  return { nestedHeadings };
};

const getNestedHeadings = (headingElements: HTMLElement[]) => {
  const nestedHeadings: TOCElement[] = [];

  headingElements.forEach((heading) => {
    const { innerText: title, id } = heading;

    if (heading.nodeName === "H2") {
      nestedHeadings.push({ id, title, items: [] });
    } else if (heading.nodeName === "H3" && nestedHeadings.length > 0 && nestedHeadings[nestedHeadings.length - 1] !== undefined) {
      nestedHeadings[nestedHeadings.length - 1]?.items?.push({
        id,
        title,
      });
    }
  });

  return nestedHeadings;
};

interface TOCElement {
  id: string,
  title: string,
  items?: TOCElement[],
}