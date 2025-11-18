export const ProductDetailSkeleton = () => {
  return (
    <>
      {/* Skeleton for carousel */}
      <section className="relative bg-muted/30">
        <div className="custom-container max-w-6xl mx-auto px-4 py-8">
          <div className="aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden bg-muted animate-pulse" />
        </div>
      </section>

      {/* Skeleton for content */}
      <section className="custom-container max-w-6xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
          </div>
        </div>
      </section>
    </>
  );
};
