from models import StarData, PlanetData
import math, time
from astroquery.gaia import Gaia
from astropy.table import Table
import numpy as np
import numba

TRUNK_HALFSIZE = 50 
GALAXY_SCALE = 10000
SUN_R_TO_PARSEC = 696_340.0 / 30_856_775_814_914.0

@numba.jit(cache=True)
def merge_lum_and_size(lum: float, size: float) -> float:
    return size * (math.log10(lum + 1) / 3 + 1)

negone_or = lambda v: -1 if math.isnan(v) else v  
COLUMNS = ["ap.radius_flame", "gs.ra", "gs.dec", "gs.distance_gspphot", "gs.pseudocolour", "ap.lum_flame", "ap.mass_flame", "ap.age_flame", "ap.teff_gspphot"]

@numba.jit(cache = True)
def ra_to_car(ra:float, dec:float, dist:float) -> np.ndarray:
    return np.array((dist * math.cos(dec) * math.cos(ra),
                     dist * math.cos(dec) * math.sin(ra),
                     dist * math.sin(dec)),
        dtype=np.float32)

@numba.jit(cache=True)
def mark_valid(base_pos:np.ndarray, stars: np.ndarray, mark_array: np.ndarray) -> None:
    RADIUS = 0
    RA = 1
    DEC = 2
    DIST = 3
    COLOUR = 4

    for i in range(0, len(stars)):
        # Change coord system
        ra = math.radians(stars[i][RA])
        dec = math.radians(stars[i][DEC])
        dist = stars[i][DIST]
        pos = ra_to_car(ra, dec, dist) - base_pos

        # Remove it if its out of the sphere centered on the planet 
        if (pos[0]**2 + pos[1]**2 + pos[2]**2) >= TRUNK_HALFSIZE**2:
            mark_array[i] = False 
            continue

        # Mark it as valid
        mark_array[i] = True

        # Scale the coords 
        stars[i][RA] = pos[0] * GALAXY_SCALE
        stars[i][DEC] = pos[1] * GALAXY_SCALE
        stars[i][DIST] = pos[2] * GALAXY_SCALE

        # Convert the sun radius to parsecs (for ease of use on the frontend) 
        stars[i][RADIUS] = stars[i][RADIUS] * GALAXY_SCALE * SUN_R_TO_PARSEC

        # Convert the wavelength
        stars[i][COLOUR] = 1000.0 / stars[i][COLOUR]


async def get_stars_from_planet_coords(
    planet: PlanetData,
    row_limit: int = 100000,
    trunk_halfsize: float = TRUNK_HALFSIZE,
) -> list[StarData]:
    # Get query 
    start_time = time.time()
    dist_min, dist_max = planet.sy_dist - trunk_halfsize, planet.sy_dist + trunk_halfsize 

    if dist_min > 0:
        radius = math.degrees(math.acos(trunk_halfsize / planet.sy_dist))
        print(f"r: {radius}")
        stmt = f"""
        SELECT
            {f'TOP {row_limit}' if row_limit > 0 else ''}
            {', '.join(COLUMNS)},
            DISTANCE(
                POINT('ICRS', {Gaia.MAIN_GAIA_TABLE_RA}, {Gaia.MAIN_GAIA_TABLE_DEC}),
                POINT('ICRS', {planet.ra}, {planet.dec})
            ) AS dist
        FROM
            gaiadr3.gaia_source AS gs
        JOIN
            gaiadr3.astrophysical_parameters AS ap
        ON
            gs.SOURCE_ID = ap.SOURCE_ID
        WHERE
            1 = CONTAINS(
                POINT('ICRS', {Gaia.MAIN_GAIA_TABLE_RA}, {Gaia.MAIN_GAIA_TABLE_DEC}),
                CIRCLE('ICRS', {planet.ra}, {planet.dec}, {radius})
            )
            AND ap.lum_flame IS NOT NULL
            AND gs.distance_gspphot < {dist_max} AND gs.distance_gspphot > {dist_min}
    """
    else:
        print("too close")
        stmt = f"""
        SELECT
            {f'TOP {row_limit}' if row_limit > 0 else ''}
            {', '.join(COLUMNS)}
        FROM
            gaiadr3.gaia_source AS gs
        JOIN
            gaiadr3.astrophysical_parameters AS ap
        ON
            gs.SOURCE_ID = ap.SOURCE_ID
        WHERE
            gs.distance_gspphot < {dist_max}
            AND ap.lum_flame IS NOT NULL
    """

    job = Gaia.launch_job_async(stmt)
    results = job.get_results()
    assert(isinstance(results, Table))
    print(f"Fetched {len(results)} rows in {time.time() - start_time} secs")

    ## Parse a lot of data
    start_time = time.time()
    data_np = results.as_array()
    data_np = data_np.data
    mark_array = np.zeros(shape=(len(data_np), ), dtype=np.bool)
    assert(isinstance(data_np, np.ndarray))
    del results

    # Mark valid
    base_pos = ra_to_car(math.radians(planet.ra), math.radians(planet.dec), planet.sy_dist)
    mark_valid(base_pos, data_np, mark_array)

    new_data = data_np[np.where(mark_array == True)]
    print(len(data_np), len(new_data))

    # Make things
    stars : list[StarData] = []

    for col in new_data:
        col_nm = lambda name: col[COLUMNS.index(name)]
        stars.append(
            StarData(
                pos = [col_nm("gs.ra"), col_nm("gs.dec"), col_nm("gs.distance_gspphot")],
                radius = negone_or(col_nm("ap.radius_flame")),
                wavelength=negone_or(col_nm("gs.pseudocolour")),
                lum = col_nm("ap.lum_flame"),
                temperature = negone_or(col_nm("ap.teff_gspphot")),
                mass = negone_or(col_nm("ap.mass_flame")),
                age = negone_or(col_nm("ap.age_flame"))
            )
        )
    print(f"Parsing the data took {time.time() - start_time} secs")

    return stars

