import matplotlib.pyplot as plt
from models import StarData
from utils import TRUNK_HALFSIZE, GALAXY_SCALE, SUN_R_TO_PARSEC
from utils import merge_lum_and_size 
from scipy.spatial.transform import Rotation as R
from io import BytesIO
import math

def map_star_data_to_unit(stars: list[StarData], max_value:float) -> list[StarData]:
    scaled_unit = 1 / max_value
    for star in stars:
        star.pos = [pos*scaled_unit for pos in star.pos]

    return stars

def get_stereographic_projection(x:float, y:float, pole:float) -> list[float]:
    # n < 1
    return [x / (1 - pole), y / (1 - pole)]

def change_pole_for_projection(current_rotation:tuple[float, float, float, float], pos:list[float]) -> list[float]:
    desired_rotation = R.from_quat(current_rotation).inv()
    return desired_rotation.apply(pos).tolist()

def draw_chart(_stars:list[StarData], chart_size:int, current_rotation:tuple[float, float, float, float]) -> bytes:
    stars = [star.model_copy() for star in _stars]
    min_star_value = .0005
    size_factor = chart_size*4
    star_factor = 6000

    print("Filtering stars by radius...")
    # filter out stars by radius
    stars = [star for star in stars if merge_lum_and_size(star.lum, star.radius) >= min_star_value]

    print("Mapping star data to unit...")
    # Convert the star data to a format that can be used by the chart [0, 1]
    stars = map_star_data_to_unit(
        stars=stars, 
        max_value=TRUNK_HALFSIZE*GALAXY_SCALE
    )

    # # Change the pole for the projection
    for star in stars:
        star.pos = change_pole_for_projection(current_rotation, star.pos)

    print("Getting 2D projection...")
    stars_2d = [StarData(
        lum=star.lum,
        pos=get_stereographic_projection(star.pos[0], star.pos[1], star.pos[2]),
        temperature=star.temperature,
        mass=star.mass,
        age=star.age,
        radius=star.radius,
        wavelength=star.wavelength
    ) for star in stars if star.pos[2] > -1 and star.pos[2] < 0]

    fig, ax = plt.subplots(figsize=(chart_size, chart_size))

    border = plt.Circle((0, 0), 1, color='navy', fill=True)
    ax.add_patch(border)

    marker_size = [merge_lum_and_size(star.lum, star.radius)*star_factor*size_factor / math.sqrt(stars[s].pos[0]**2 + stars[s].pos[1]**2 + stars[s].pos[2]**2) for s, star in enumerate(stars_2d)]

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

    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    plt.axis('off')
    
    print("Saving chart...")	
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()

    return image_png 

