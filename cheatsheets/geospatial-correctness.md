# Geospatial correctness with GeoTools and JTS cheat sheet

> Baseline: GeoTools 35.x API names, JTS 1.20, Java 21; CRS operations require appropriate authority data and transformation resources. Reviewed: 2026-09-24.

Geometry is coordinates **plus a spatial reference and interpretation**. Plausible-looking output can still have wrong axis order, units, topology, or measurement semantics.

Related: [integration transformation](integration-transformation.md), [data structures](data-structures.md), [JavaFX](javafx.md), [testing](testing.md).

## Keep these operations distinct

| Operation | Changes coordinate values? | Meaning |
|-----------|----------------------------|---------|
| Assign/declare a CRS | No | Describe the coordinates already present |
| Reproject/transform | Yes, as required by the operation | Convert between source and target reference systems |
| Set JTS SRID | No | Set an integer identifier; it does not perform transformation |
| Swap X/Y | Yes | Repair a known axis-order mismatch, not a general CRS conversion |

Validate the source CRS instead of guessing from numeric ranges. EPSG authority axis order and common GIS longitude/latitude conventions can differ. `CRS.decode(code, true)` requests longitude-first ordering where applicable; it is an explicit convention, not a repair for unknown input. Sources: [CRS utilities](https://docs.geotools.org/stable/userguide/library/referencing/crs.html), [axis order](https://docs.geotools.org/stable/userguide/library/referencing/order.html).

## Example: project a Colorado point

Java method-body fragment. Requires GeoTools `gt-referencing`, `gt-main`, an EPSG authority plugin such as `gt-epsg-hsql` on the same 35.x version, and compatible JTS. Imports belong at class level; the enclosing method can declare `throws Exception`.

```java
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;

var source = CRS.decode("EPSG:4326", true);
var target = CRS.decode("EPSG:32613");
var transform = CRS.findMathTransform(source, target, false);
var point = new GeometryFactory().createPoint(new Coordinate(-105.0, 40.0));
var projected = JTS.transform(point, transform);
projected.setSRID(32613);
```

The input convention is X=longitude, Y=latitude in degrees. UTM zone 13N fits this example's location; choose a CRS appropriate to the actual region and accuracy needs. `setSRID` labels the transformed result. Strict lookup avoids silently allowing missing datum-shift information; it does not certify survey accuracy. See [GeoTools JTS utilities](https://docs.geotools.org/stable/userguide/library/jts/jts.html).

## Measure and validate deliberately

| Concern | Practical rule |
|---------|----------------|
| Distance/area/buffer | JTS operations are planar; units follow the coordinates, and area uses squared units |
| Geographic coordinates | A buffer distance in degrees is not meters; use an appropriate projection or geodesic method |
| Web Mercator | Useful for display; distortion can make ground measurements unsuitable |
| Empty/invalid geometry | Check both; topological validity does not establish business validity or correct CRS |
| Precision | Choose tolerances from data accuracy and units; arbitrary rounding can change topology |
| Repair | Preserve the original and record why/how it changed; repair can alter type or area |

JTS does not enforce CRS compatibility between operands. Transform/verify both inputs before intersection or distance calculations. Z values do not make ordinary JTS overlay a full 3D solid operation. See [JTS Geometry](https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/Geometry.html).

## Indexes and resource ownership

Spatial indexes commonly return envelope candidates; apply the exact geometry predicate afterward when required. A stale index over mutated geometries can miss results, so rebuild or update it according to the index's contract.

Close feature iterators with try-with-resources and dispose a `DataStore` when its owner is finished; do not dispose a shared store after one query. Avoid collecting large feature sets merely to count or scan them. See [GeoTools FeatureCollection](https://docs.geotools.org/stable/userguide/library/main/collection.html).

## Suggested fixtures

- Known control points with expected coordinates and tolerances; a round trip alone can hide matching forward/reverse mistakes.
- Longitude/latitude reversal, region boundaries, and antimeridian cases.
- Empty, self-intersecting, narrow, and multipart geometries.
- Meter/foot mismatches and area-unit conversions.
- Repeated datastore reads followed by file replacement/deletion to detect leaked handles.

## References

- [GeoTools — CRS utilities](https://docs.geotools.org/stable/userguide/library/referencing/crs.html)
- [GeoTools — axis order](https://docs.geotools.org/stable/userguide/library/referencing/order.html)
- [GeoTools — JTS utilities](https://docs.geotools.org/stable/userguide/library/jts/jts.html)
- [JTS 1.20 — Geometry](https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/Geometry.html)
- [GeoTools — FeatureCollection](https://docs.geotools.org/stable/userguide/library/main/collection.html)
