import Image from "next/image";

type BrandLogoProps = {
  alt: string;
};

export function BrandLogo({ alt }: BrandLogoProps) {
  return (
    <Image
      src="/brand/nc-logo.png"
      alt={alt}
      width={787}
      height={200}
      className="h-12 w-auto max-w-full object-contain"
      style={{ width: "auto", height: "3rem" }}
      priority
    />
  );
}
