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
      className="h-8 w-auto max-w-full object-contain sm:h-12"
      priority
    />
  );
}
