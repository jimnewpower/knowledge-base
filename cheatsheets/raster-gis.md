# Raster GIS[^gis] and GeoTIFF[^geotiff] cheat sheet

> Baseline: GeoTools 35 coverage concepts and GDAL[^gdal] 3.x commands; verify driver/option support in the installed release. Reviewed: 2026-09-24.

A raster combines sample values with a grid, spatial reference, and validity rules. Matching dimensions alone does not make two rasters comparable.

Related: [geospatial correctness](geospatial-correctness.md), [batch processing](batch-processing.md), [JavaFX](javafx.md).

## Inspect before combining

| Property | Question |
|----------|----------|
| CRS[^crs] and units | Are horizontal/vertical coordinates understood and compatible? |
| Extent and resolution | Which area and cell size does the grid represent? |
| Grid origin/rotation | Do corresponding cells actually overlap? |
| Pixel interpretation | Is the sample associated with an area or a point? |
| Bands | What variable, unit, scale, offset, and ordering does each band use? |
| Validity | NoData sentinel, mask, alpha, NaN, or a combination? |
| Data type | Can the output represent interpolated values and NoData? |

Zero may be a valid measurement. An alpha band, a mask, and a NoData sentinel are not interchangeable in every operation. Record whether calculations use raw sample values or scaled physical values.

## Pixel to world

For GDAL's affine geotransform, coordinates use pixel/line positions measured from the upper-left corner:

```text
X = GT(0) + column * GT(1) + row * GT(2)
Y = GT(3) + column * GT(4) + row * GT(5)

For the center of cell (column, row), use (column + 0.5, row + 0.5).
For a north-up grid, GT(2) and GT(4) are zero; GT(5) is usually negative.
```

Do not add the half-cell offset twice when another API[^api] already gives cell-center coordinates. Invert the full transform for rotated grids; subtracting the origin and dividing by resolution is insufficient. See [GDAL geotransforms](https://gdal.org/en/stable/tutorials/geotransforms_tut.html).

## Reprojection and resampling

| Data | Starting choice | Check |
|------|-----------------|-------|
| Land-cover/category IDs[^id] | Nearest neighbor | Output remains meaningful category codes |
| Continuous elevation | Bilinear, subject to analysis needs | Smoothing, edge behavior, vertical units |
| Coarser continuous summaries | Average or domain-specific aggregation | Valid-data weighting and conservation requirements |
| Masks | Explicit validity policy | Interpolation must not invent valid observations |

Example shell commands require GDAL and a correctly georeferenced source. This is specifically a categorical raster in Colorado intended for UTM[^utm] zone 13N; choose the real target CRS/resolution for other data.

Example abbreviations: EPSG[^epsg].

```bash
gdalinfo source.tif
gdalwarp -t_srs EPSG:32613 -tr 30 30 -tap -r near source.tif aligned.tif
gdalinfo aligned.tif
```

`-tap` aligns output bounds to resolution multiples; it does not guarantee matching an arbitrary reference raster's origin and extent. For raster algebra, specify the complete target grid and verify it afterward. Assigning a CRS label does not reproject samples. Set source/output NoData deliberately when metadata is missing or needs conversion; guessing a sentinel can erase real measurements.

## Java and large datasets

GeoTools coverage readers expose grid geometry, sample dimensions, and coverage data. Inspect the grid-to-CRS transform and validity metadata before sampling. Dispose readers and release coverage/image resources according to their ownership and reader contract; lazy image access can extend resource lifetime.

Read windows/regions at an appropriate resolution. Tiling and overviews reduce unnecessary work; a Cloud Optimized GeoTIFF also depends on suitable layout and HTTP[^http] range support for efficient remote reads. Estimate decompressed memory from dimensions, bands, sample size, and intermediate copies rather than compressed file size.

## References

- [GDAL warp options](https://gdal.org/en/stable/programs/gdalwarp.html)
- [GeoTools coverage library](https://docs.geotools.org/latest/userguide/library/coverage/index.html)
- [Cloud Optimized GeoTIFF driver](https://gdal.org/en/stable/drivers/raster/cog.html)

[^gis]: Geographic Information System.
[^geotiff]: Geographic Tagged Image File Format — a tagged raster image format with georeferencing metadata.
[^gdal]: Geospatial Data Abstraction Library.
[^crs]: Coordinate Reference System.
[^api]: Application Programming Interface — the contract through which software components interact.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^utm]: Universal Transverse Mercator.
[^http]: Hypertext Transfer Protocol.
[^epsg]: European Petroleum Survey Group — the historical organization whose name identifies the coordinate-reference registry and its codes.
