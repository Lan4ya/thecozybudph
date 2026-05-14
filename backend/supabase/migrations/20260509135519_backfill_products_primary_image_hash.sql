UPDATE products p
SET primary_image_hash = h.hash
FROM (
  SELECT
    id,
    image_urls,
    image_hashes,
    primary_image_url,
    (
      array_position(image_urls, primary_image_url)
    ) AS idx
  FROM products
) sub
CROSS JOIN LATERAL (
  SELECT sub.image_hashes[sub.idx] AS hash
) h
WHERE p.id = sub.id
  AND sub.idx IS NOT NULL;
