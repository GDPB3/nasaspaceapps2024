import pyvo as vo
from models import PlanetData
import pickle
import math
from utils import negone_or

# Use a TAP client when returning large data sets. If you're downloading the entire PS or PSCompPars tables in VOTable format,
# your web browser may struggle to display all of the results. Try using a client like TOPCAT, pyVO, or TAP+.
service = vo.dal.TAPService("https://exoplanetarchive.ipac.caltech.edu/TAP")


def get_planets():
    result = service.search(
        "select distinct(pl_name), hostname, ra, dec, sy_dist, sy_mnum, disc_year, disc_facility, pl_orbper, st_rotp, pl_rade, pl_masse from ps"
    )

    planets = []
    for row in result:
        # PlanetData stores floats as python floats, the api returns np.float64.
        # I hope this is not an issue.
        # *WE* hope 🙏
        pl_name = row["pl_name"]
        hostname = row["hostname"]
        ra = negone_or(row["ra"])
        dec = negone_or(row["dec"])
        sy_dist = negone_or(row["sy_dist"]) 
        sy_mnum = int(negone_or(row["sy_mnum"]))
        disc_year = int(negone_or(row["disc_year"]))
        pl_orbper = negone_or(row["pl_orbper"]) 
        st_rotp = negone_or(row["st_rotp"]) 
        pl_rade = negone_or(row["pl_rade"]) 
        pl_masse = negone_or(row["pl_masse"]) 
        disc_facility = row["disc_facility"]
        planets.append(
            PlanetData(
                pl_name=pl_name, 
                hostname=hostname, 
                ra=ra, 
                dec=dec, 
                sy_dist=sy_dist,
                sy_mnum=sy_mnum,
                disc_year=disc_year,
                pl_orbper=pl_orbper,
                st_rotp=st_rotp,
                pl_rade=pl_rade,
                pl_masse=pl_masse,
                disc_facility=disc_facility
            )
        )

    unique_planets = []
    seen_names = set()
    for planet in planets:
        if planet.pl_name not in seen_names:
            unique_planets.append(planet)
            seen_names.add(planet.pl_name)

    return unique_planets


if __name__ == "__main__":
    planets = get_planets()
    pickle.dump(planets, open("planets.p", "wb"))
    print(f"Saved {len(planets)} planets to planets.p")
