/* eslint-disable @next/next/no-img-element */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/icon.svg"
      alt=""
      width={size}
      height={size}
      className="drop-shadow-[0_0_10px_#00E5FF55]"
    />
  );
}
