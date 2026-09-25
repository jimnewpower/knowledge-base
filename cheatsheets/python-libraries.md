# Python library reference

> Baseline: Python 3.11+ project context; choose package releases supporting the deployed interpreter. Package versions are project-pinned. Reviewed: 2026-09-25.

A starting catalog for automation, service integration, scientific computing, and GIS[^gis]. Library names link to primary documentation. Selection guidance is an engineering recommendation for this collection, not a ranking or a requirement to install every package.

Related: [Python](python.md), [Java libraries](java-libraries.md), [scientific model integration](scientific-model-integration.md), [dependency security](software-supply-chain.md).

## Start with the standard library

These modules ship with Python; do not install similarly named packages to obtain them. Availability of some modules depends on the interpreter build. See the [Python standard library reference](https://docs.python.org/3/library/) and select your interpreter version.

| Need | Built-in modules | Selection guidance |
|------|------------------|--------------------|
| Paths, files, temporary work | `pathlib`, `shutil`, `tempfile` | Use context managers and explicit text encodings |
| Structured files | `json`, `csv`, `tomllib` | Suitable for ordinary JSON[^json], delimited files, and TOML[^toml] configuration; `tomllib` reads TOML and requires Python 3.11+ |
| SQLite | `sqlite3` | Direct SQL[^sql] for an embedded database; define transactions and connection ownership |
| Command-line programs | `argparse`, `subprocess`, `logging` | Parse arguments, run child processes, and report diagnostics without a framework |
| Time and numeric values | `datetime`, `zoneinfo`, `decimal`, `statistics` | Check whether these satisfy the task before adding a scientific stack |
| Tests and isolation | `unittest`, `unittest.mock` | Built-in test runner and replacement of external collaborators |
| Concurrent work | `concurrent.futures`, `asyncio` | Choose threads, processes, or async I/O[^i-o] based on the actual workload |

## HTTP[^http], validation, and data access

The package column gives the distribution name used in dependency declarations; the import column gives a common module entry point. They are not always identical.

| Library / official reference | Package / import | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [Requests](https://requests.readthedocs.io/en/latest/) | `requests` / `requests` | Straightforward synchronous HTTP calls. Reuse a session and set timeouts explicitly |
| [HTTPX](https://www.python-httpx.org/) | `httpx` / `httpx` | HTTP clients with synchronous and asynchronous interfaces. Reuse and close clients; set timeout and concurrency budgets |
| [Pydantic](https://docs.pydantic.dev/latest/) | `pydantic` / `pydantic` | Validate external data against typed models. Choose coercion versus strict validation deliberately; annotations alone do not validate input |
| [SQLAlchemy](https://docs.sqlalchemy.org/en/20/) | `SQLAlchemy` / `sqlalchemy` | SQL expression building or ORM[^orm] persistence. Select Core or ORM intentionally; install the database driver and own the session/transaction lifecycle |
| [Beautiful Soup](https://pypi.org/project/beautifulsoup4/) | `beautifulsoup4` / `bs4` | Navigate and extract data from HTML[^html]/XML[^xml]. Choose the parser explicitly; parsing a document does not fetch it or run JavaScript |
| [openpyxl](https://openpyxl.readthedocs.io/en/stable/) | `openpyxl` / `openpyxl` | Read/write `.xlsx` workbook structures and styles. It is not an Excel calculation engine or a legacy `.xls` reader |

Requests and HTTPX are alternative client choices for many tasks; pick the one that fits the application's concurrency model. Keep network retrieval, validation, and persistence as explicit boundaries so failures can be tested separately.

## Scientific computing and analysis

| Library / official reference | Package / import | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [NumPy](https://numpy.org/doc/stable/) | `numpy` / `numpy` | Typed multidimensional arrays and vectorized numerical operations. Make shapes, dtypes, units, and missing-value rules explicit |
| [SciPy](https://docs.scipy.org/doc/scipy/) | `scipy` / `scipy` | Optimization, interpolation, integration, statistics, and other numerical algorithms on NumPy arrays. Verify tolerances and algorithm assumptions |
| [pandas](https://pandas.pydata.org/docs/) | `pandas` / `pandas` | Tabular cleaning, joins, aggregation, and time-series work. Validate keys, missing values, and dtypes; budget memory for intermediate tables |
| [Matplotlib](https://matplotlib.org/stable/users/index.html) | `matplotlib` / `matplotlib.pyplot` | Scientific figures and static exports. Set units, labels, scales, and output size explicitly; close figures in batch jobs |
| [scikit-learn](https://scikit-learn.org/stable/) | `scikit-learn` / `sklearn` | Preprocessing, conventional machine learning, and model evaluation. Fit preprocessing on training data and evaluate with splits matching real deployment |

NumPy supplies arrays, SciPy supplies numerical algorithms, and pandas supplies labeled tables; they complement each other. Keep numerical acceptance criteria and input provenance beside the model, as described in [scientific model integration](scientific-model-integration.md).

## Geospatial

| Library / official reference | Package / import | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [Shapely](https://shapely.readthedocs.io/en/stable/) | `shapely` / `shapely` | Planar geometry operations and topology. It does not transform coordinate reference systems; geographic degrees are not metric distances |
| [pyproj](https://pyproj4.github.io/pyproj/stable/) | `pyproj` / `pyproj` | Coordinate transformations and geodesic calculations through PROJ. Specify CRS[^crs], axis conventions, and required transformation resources |
| [GeoPandas](https://geopandas.org/en/stable/) | `geopandas` / `geopandas` | Spatial tables, vector-file workflows, and spatial joins. Distinguish assigning CRS metadata from transforming coordinates |
| [Rasterio](https://rasterio.readthedocs.io/en/stable/) | `rasterio` / `rasterio` | Geospatial raster I/O through GDAL[^gdal]. Preserve CRS, transform, nodata/masks, and band semantics; process large rasters in windows |

Use GeoPandas for feature tables, Shapely for geometry, pyproj for coordinate transformations, and Rasterio for grids. Validate known coordinates and units across language boundaries; see [geospatial correctness](geospatial-correctness.md) and [raster GIS](raster-gis.md).

## Testing

| Library / official reference | Package / import | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [pytest](https://docs.pytest.org/en/stable/) | `pytest` / `pytest` | Fixtures, parametrization, and readable assertions. Keep fixture dependencies visible and test outcomes rather than implementation details |
| [Hypothesis](https://hypothesis.readthedocs.io/en/latest/) | `hypothesis` / `hypothesis` | Generate cases to check invariants, round trips, and boundary behavior. Define valid input strategies and meaningful properties |

Keep test dependencies separate from application runtime dependencies. Combine representative examples with generated cases for parsers, numerical boundaries, and transformations; see [testing](testing.md).

## Dependency selection and maintenance

1. Use a project virtual environment and its interpreter to manage packages; see the [Python environment setup](python.md#isolated-environment).
2. Declare direct dependencies and compatible Python versions in the project's packaging configuration. Capture resolved versions and hashes where repeatability requires them.
3. Check the selected release's Python support and wheel availability for each target OS[^os]/architecture. NumPy, GDAL, GEOS[^geos], and PROJ dependencies make native compatibility part of delivery.
4. Keep the environment installation method consistent. Verify native library versions when mixing package managers or system GIS installations.
5. Test imports and representative operations in the packaged/deployed environment, including CRS transformations, file reads, and database access. A successful dependency resolver run cannot establish runtime correctness.

Documentation links using `stable` or `latest` move over time. Select documentation matching the locked release before copying API[^api] examples. See [software supply-chain security](software-supply-chain.md) for dependency inventory and review.

[^gis]: Geographic Information System.
[^json]: JavaScript Object Notation.
[^toml]: Tom's Obvious, Minimal Language.
[^sql]: Structured Query Language.
[^i-o]: Input/Output.
[^http]: Hypertext Transfer Protocol.
[^orm]: Object-Relational Mapping (or Mapper, depending on context).
[^html]: Hypertext Markup Language.
[^xml]: Extensible Markup Language.
[^crs]: Coordinate Reference System.
[^gdal]: Geospatial Data Abstraction Library.
[^os]: Operating System.
[^geos]: Geometry Engine, Open Source.
[^api]: Application Programming Interface — the contract through which software components interact.
