const ProductColorVariantCircles = ({
  colorVariants,
}: {
  colorVariants: string[];
}) => {
  return (
    <div className="flex gap-2 [&>span:nth-child(n+3)]:max-[400px]:hidden [&>span:nth-child(n+4)]:max-[450px]:hidden">
      {colorVariants.map((color) => (
        <span
          key={color}
          className="rounded-full size-4 border border-gray-400"
          style={{ background: color }}
        ></span>
      ))}
    </div>
  );
};

export default ProductColorVariantCircles;
