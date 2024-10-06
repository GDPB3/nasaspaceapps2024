from chart import draw_chart
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from models import PlanetData, StarData, ChartData
import pickle
from utils import get_stars_from_planet_coords

planets_list : list[PlanetData] = pickle.load(open("planets.p", "rb"))
print(f"Loaded {len(planets_list)} planets from planets.p")

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/planets", response_model=list[PlanetData])
async def planets(query:str="", count:int=len(planets_list)):
    if query == "":
        return planets_list[:count]
    else:
        return [planet for planet in planets_list if query.lower() in planet.pl_name.lower()][:count]

@app.get("/planets/names", response_model=list[str])
async def planet_names(query:str="", count:int=len(planets_list)):
    if query == "":
        return [planet.pl_name for planet in planets_list][:count]
    else:
        return [planet.pl_name for planet in planets_list if query.lower() in planet.pl_name.lower()][:count]


max_star_cache_size = 5

@app.get("/planets/{planet}/stars", response_model=list[StarData])
async def get_stars_from_planet(planet:str, limit:int = -1) -> list[StarData]:
    planets = [planet_o for planet_o in planets_list if planet.lower() == planet_o.pl_name.lower()]
    if len(planets) != 1: return []

    # Check for cache
    try:
        with open("star_cache.pkl", "rb") as f:
            star_cache : list[tuple[tuple[str, int], list[StarData]]] = pickle.load(f)
    except FileNotFoundError:
        star_cache = []
        
    for (entry_name, entry_limit), entry_data in star_cache:
        if (entry_name == planet and ((limit != -1 and limit <= entry_limit) or entry_limit == -1)):
            return entry_data

    results = await get_stars_from_planet_coords(planets[0], row_limit=limit) 

    # Save in cache
    if len(star_cache) == max_star_cache_size:
        star_cache.pop(0)

    star_cache.append(((planet, limit), results))

    with open("star_cache.pkl", "wb") as f:
        pickle.dump(star_cache, f)

    return results

@app.post("/planets/chart")
async def make_chart(data: ChartData) -> Response:
    stars = await get_stars_from_planet(data.pl_name)
    
    image = draw_chart(stars, data.chart_size, data.quaternion)

    return Response(content=image, media_type="image/png")

