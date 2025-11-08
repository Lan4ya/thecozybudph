const ProductColorVariants = ({
  colorVariants,
}: {
  colorVariants: string[];
}) => {
  return (
    <div className="flex gap-2 mx-auto [&>span:nth-child(n+4)]:max-[400px]:hidden">
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

export default ProductColorVariants;
