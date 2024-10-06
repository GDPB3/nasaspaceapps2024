import matplotlib.pyplot as plt
from models import PlanetData, StarData
# from utils import TRUNK_HALFSIZE, GALAXY_SCALE, SUN_R_TO_PARSEC
from utils import SUN_R_TO_PARSEC
import json
from scipy.spatial.transform import Rotation as R

default_pole = [0, 0, 1]

TRUNK_HALFSIZE = 50
GALAXY_SCALE = 10000

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

def get_stereographic_projection(x:float, y:float, pole:float) -> list[float]:
    # n < 1
    return [x / (1 - pole), y / (1 - pole)]

def change_pole_for_projection(pole:list[int], pos:list[float]) -> list[float]:
    if pole[0] != 0:
        rotation_axis = 'y'
        if pole[0] < 0:
            rotation_angle = 90
        else:
            rotation_angle = -90
    elif pole[1] != 0:
        rotation_axis = 'x'
        if pole[1] < 0:
            rotation_angle = 90
        else:
            rotation_angle = -90
    else:
        rotation_axis = 'x'
        rotation_angle = 180

    rotation = R.from_euler(rotation_axis, rotation_angle, degrees=True)
    return rotation.apply(pos).tolist()

def draw_chart(stars:list[StarData], output:str, position: list[int] = default_pole):
    chart_size = 80
    min_star_size = 2
    size_factor = chart_size*8

    print("Resize stars...")
    stars = [StarData(
        lum=star.lum,
        pos=star.pos,
        temperature=star.temperature,
        mass=star.mass,
        age=star.age,
        radius=star.radius * 1/(SUN_R_TO_PARSEC*GALAXY_SCALE),
        wavelength=star.wavelength
        ) for star in stars]
    
    print("Filtering stars by radius...")
    # filter out stars by radius
    stars = [star for star in stars if star.radius >= min_star_size]

    print("Mapping star data to unit...")
    # Convert the star data to a format that can be used by the chart [0, 1]
    stars = map_star_data_to_unit(
        stars=stars, 
        max_value=TRUNK_HALFSIZE*GALAXY_SCALE
    )

    if position != default_pole:
        print("Changing pole for projection...")
        stars = [StarData(
            lum=star.lum,
            pos=change_pole_for_projection(position, star.pos),
            temperature=star.temperature,
            mass=star.mass,
            age=star.age,
            radius=star.radius,
            wavelength=star.wavelength
        ) for star in stars]

    print("Getting 2D projection...")
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

    marker_size = [star.radius*size_factor for star in stars_2d]

    print("Drawing stars...")
    ax.scatter(
        [star.pos[0] for star in stars_2d], 
        [star.pos[1] for star in stars_2d] , 
        s=marker_size, 
        color='white', 
        marker='.', 
        linewidths=0, 
        zorder=2
    )

    # horizon = plt.Circle((0, 0), radius=1, transform=ax.transData)
    # for col in ax.collections:
    #     col.set_clip_path(horizon)

    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    plt.axis('off')
    plt.savefig(output)

if __name__ == "__main__":
    print("Loading stars...")
    # stars = pkl.load(open("data.pkl", "rb"))
    stars = json.load(open("smth.json", "r"))
    stars = [StarData(**star) for star in stars]
    draw_chart(stars, 'charts/bchart.png')
    draw_chart(stars, 'charts/bchart1.png', position=[1, 0, 0])
    draw_chart(stars, 'charts/bchart2.png', position=[0, 1, 0])
    draw_chart(stars, 'charts/bchart3.png', position=[0, 0, -1])
    draw_chart(stars, 'charts/bchart4.png', position=[-1, 0, 0])
    draw_chart(stars, 'charts/bchart5.png', position=[0, -1, 0])
