import Image from "next/image";

export default function CustomImage({
  src,
  alt,
  width,
  height,
  layout,
  center,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  layout?: "fixed" | "intrinsic" | "responsive";
  center: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: center ? "center" : "",
      }}
    >
      <Image
        src={`/image/${src}`}
        width={width || 500}
        height={height || 500}
        alt={alt}
        layout={layout || "intrinsic"}
        priority
      />
    </div>
  );
}