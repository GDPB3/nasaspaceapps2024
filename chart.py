import matplotlib.pyplot as plt
from models import PlanetData, StarData
from utils import TRUNK_HALFSIZE
import json

def is_point_inside_sphere(point: list[float], sphere_radius: float) -> bool:
    return sum([pos**2 for pos in point]) <= sphere_radius**2

def map_star_data_to_unit(stars: list[StarData], max_value:float) -> list[StarData]:
    scaled_unit = 1 / max_value
    return [StarData(
        lum=star.lum,
        pos=[pos_value*scaled_unit for pos_value in star.pos],
        temperature=star.temperature,
        mass=star.mass,
        age=star.age,
        radius=star.radius,
        wavelength=star.wavelength
    ) for star in stars]

def get_stereographic_projection(x:float, y:float, z:float) -> list[float]:
    return [x / (1 - z), y / (1 - z)]

def draw_chart(stars:list[StarData]):
    chart_size = 10
    max_star_size = 100
    limiting_magnitude = 10 # brightness

    # Convert the star data to a format that can be used by the chart [0, 1]
    stars = map_star_data_to_unit(
        [star for star in stars 
        if is_point_inside_sphere(star.pos, TRUNK_HALFSIZE)], 
        max_value=TRUNK_HALFSIZE
    )

    stars_2d = [StarData(
        lum=star.lum,
        pos=get_stereographic_projection(star.pos[0], star.pos[1], star.pos[2]),
        temperature=star.temperature,
        mass=star.mass,
        age=star.age,
        radius=star.radius,
        wavelength=star.wavelength
    ) for star in stars if star.pos[2] < 1]

    fig, ax = plt.subplots(figsize=(chart_size, chart_size))
    
    border = plt.Circle((0, 0), 1, color='navy', fill=True)
    ax.add_patch(border)

    ax.scatter(
        [star.pos[0] for star in stars_2d], 
        [star.pos[1] for star in stars_2d] , 
        s=[star.radius for star in stars_2d], 
        color='white', 
        marker='.', 
        linewidths=0, 
        zorder=2
    )

    horizon = plt.Circle((0, 0), radius=1, transform=ax.transData)
    for col in ax.collections:
        col.set_clip_path(horizon)

    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    plt.axis('off')
    plt.show()

if __name__ == "__main__":
    stars = json.load(open("smth.json", "r"))
    stars = [StarData(**star) for star in stars]
    draw_chart(stars)
