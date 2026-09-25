# Scientific model and data integration cheat sheet

> Baseline: Java applications integrating Python/C models, batch calculations, and geospatial data; workflow recommendations are engineering synthesis. Reviewed: 2026-09-25.

A model result needs enough provenance to explain which inputs, assumptions, and executable produced it. Successful process exit is only one part of acceptance.

Related: [batch processing](batch-processing.md), [geospatial correctness](geospatial-correctness.md), [raster GIS](raster-gis.md)[^gis], [integration transformation](integration-transformation.md).

## Choose the integration boundary

| Boundary | Useful when | Cost to account for |
|----------|-------------|---------------------|
| In-process Java library | Compatible runtime, predictable memory and threading | Model failure and resource use affect the UI[^ui]/server |
| JNI[^jni]/native library | Tight C integration or frequent large data exchange | ABI[^abi], architecture, memory ownership, native crashes |
| Child process | Existing CLI[^cli] model, Python environment, crash isolation | Startup, file protocol, cancellation, concurrent output streams |
| Remote job API[^api] | Shared compute, long jobs, independently operated model | Authentication, job identity, polling, retries and data movement |

For a child process, pass an argument list, set a known working directory, drain stdout and stderr concurrently, impose a deadline, and define termination of descendants. Publish outputs from an isolated run directory only after validation; partial files are not completed results.

## Input/output contract

| Record | Include |
|--------|---------|
| Input identity | Immutable source version/checksum, selection/filter, schema version |
| Physical meaning | Units, datum/CRS[^crs], axis order, time zone/time scale, coordinate epoch if relevant |
| Missing values | Null/NoData sentinel, valid ranges, whether interpolation is allowed |
| Model identity | Code/artifact digest, parameter set, dependency/native-library versions |
| Numerical execution | Random seed and generator, precision, hardware/threading assumptions |
| Result evidence | Run ID[^id], completion state, output hashes, diagnostics, uncertainty and quality flags |

Unit conversion and resampling change data meaning: record them as transformations. Distinguish observed, interpolated, and modeled values. Store uncertainty alongside a value when the consumer needs it; extra decimal places do not establish accuracy.

## Validation and repeatability

- Check schema, units, dimensions, finite values, and allowed ranges before execution.
- Use an analytical case or independently established benchmark, then a representative production-sized fixture.
- Compare with a justified absolute/relative tolerance: `abs(actual - expected) <= atol + rtol * abs(expected)`. Near zero, the absolute term matters. Treat NaN and infinities explicitly.
- Test sensitivity to parameter changes and scientific invariants such as conservation where applicable.
- Repeat a fixed-seed run and measure numerical variation. Parallel reductions, native libraries, and hardware can defeat bitwise equality.
- Retry a run under a stable input identity; deduplicate publication and keep failed-run diagnostics.

Separate software regression evidence from scientific validation of the model's applicability. Both have owners and acceptance criteria.

## References

- [NIST measurement uncertainty guidance](https://www.nist.gov/publications/guidelines-evaluating-and-expressing-uncertainty-nist-measurement-results)[^nist]
- [Java Process API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Process.html)
- [NumPy random-number reproducibility policy](https://numpy.org/doc/stable/reference/random/compatibility.html)

[^gis]: Geographic Information System.
[^ui]: User Interface.
[^jni]: Java Native Interface.
[^abi]: Application Binary Interface — the compiled calling and data-layout contract between components.
[^cli]: Command-Line Interface.
[^api]: Application Programming Interface — the contract through which software components interact.
[^crs]: Coordinate Reference System.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^nist]: National Institute of Standards and Technology.
