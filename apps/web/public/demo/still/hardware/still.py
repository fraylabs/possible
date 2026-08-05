"""STEP-first exterior concept for the fictional Still focus device.

The dimensions here communicate form and assembly intent only. They are not
validated for electronics, ergonomics, connector fit, manufacturing, or use.
"""

from build123d import Align, Box, Color, Cylinder, Location, RectangleRounded, extrude
from cadpy.assembly import AssemblyHelper


# Unvalidated enclosure-body design target.
BODY_WIDTH = 72.0
BODY_DEPTH = 72.0
BODY_HEIGHT = 18.0
OUTER_CORNER_RADIUS = 10.0

# Assumed enclosure construction for concept communication.
BASE_HEIGHT = 12.0
FACEPLATE_HEIGHT = BODY_HEIGHT - BASE_HEIGHT
SHELL_WALL = 2.4
SHELL_FLOOR = 2.4

# Assumed display envelope and placement.
DISPLAY_WIDTH = 50.0
DISPLAY_DEPTH = 35.0
DISPLAY_THICKNESS = 0.8
DISPLAY_CORNER_RADIUS = 3.0
DISPLAY_CENTER_Y = -7.5
DISPLAY_TOP_Z = 17.8
DISPLAY_BOTTOM_Z = DISPLAY_TOP_Z - DISPLAY_THICKNESS
DISPLAY_POCKET_CLEARANCE = 0.6
DISPLAY_POCKET_DEPTH = 1.2

# Assumed dial/button geometry and placement.
DIAL_DIAMETER = 15.0
DIAL_HEIGHT = 5.0
DIAL_CENTER_X = 0.0
DIAL_CENTER_Y = 24.0
DIAL_BOTTOM_Z = BODY_HEIGHT
RING_OUTER_DIAMETER = 18.0
RING_INNER_DIAMETER = 15.8
RING_HEIGHT = 0.6

# Assumed exterior USB-C-sized concept opening. No connector geometry is modeled.
USB_OPENING_WIDTH = 12.0
USB_OPENING_HEIGHT = 4.5
USB_OPENING_CENTER_Z = 6.0


WARM_OFF_WHITE = Color(0.91, 0.89, 0.83)
WARM_SHADOW = Color(0.70, 0.68, 0.62)
NEAR_BLACK = Color(0.05, 0.05, 0.045)
EINK_GRAY = Color(0.55, 0.56, 0.52)
SIGNAL_ORANGE = Color(1.0, 0.22, 0.02)


def rounded_prism(width: float, depth: float, height: float, radius: float):
    """Create a centered rounded rectangle extruded from Z=0."""

    profile = RectangleRounded(width, depth, radius)
    return extrude(profile, amount=height)


def make_lower_shell():
    outer = rounded_prism(BODY_WIDTH, BODY_DEPTH, BASE_HEIGHT, OUTER_CORNER_RADIUS)
    inner = rounded_prism(
        BODY_WIDTH - 2 * SHELL_WALL,
        BODY_DEPTH - 2 * SHELL_WALL,
        BASE_HEIGHT,
        OUTER_CORNER_RADIUS - SHELL_WALL,
    ).moved(Location((0, 0, SHELL_FLOOR)))
    shell = outer - inner

    # Overshoot the rear wall in Y so this is an unambiguous through-cut.
    usb_tool = Box(
        USB_OPENING_WIDTH,
        SHELL_WALL + 2.0,
        USB_OPENING_HEIGHT,
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(Location((0, BODY_DEPTH / 2, USB_OPENING_CENTER_Z)))
    return shell - usb_tool


def make_faceplate():
    faceplate = rounded_prism(
        BODY_WIDTH,
        BODY_DEPTH,
        FACEPLATE_HEIGHT,
        OUTER_CORNER_RADIUS,
    )

    pocket = rounded_prism(
        DISPLAY_WIDTH + 2 * DISPLAY_POCKET_CLEARANCE,
        DISPLAY_DEPTH + 2 * DISPLAY_POCKET_CLEARANCE,
        DISPLAY_POCKET_DEPTH + 0.2,
        DISPLAY_CORNER_RADIUS + DISPLAY_POCKET_CLEARANCE,
    ).moved(
        Location(
            (
                0,
                DISPLAY_CENTER_Y,
                FACEPLATE_HEIGHT - DISPLAY_POCKET_DEPTH,
            )
        )
    )

    dial_bore = Cylinder(
        radius=5.0,
        height=FACEPLATE_HEIGHT + 2.0,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    ).moved(Location((DIAL_CENTER_X, DIAL_CENTER_Y, -1.0)))
    return faceplate - pocket - dial_bore


def make_display_insert():
    return rounded_prism(
        DISPLAY_WIDTH,
        DISPLAY_DEPTH,
        DISPLAY_THICKNESS,
        DISPLAY_CORNER_RADIUS,
    )


def make_signal_ring():
    outer = Cylinder(
        radius=RING_OUTER_DIAMETER / 2,
        height=RING_HEIGHT,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    )
    inner = Cylinder(
        radius=RING_INNER_DIAMETER / 2,
        height=RING_HEIGHT + 0.2,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    ).moved(Location((0, 0, -0.1)))
    return outer - inner


def make_dial():
    dial = Cylinder(
        radius=DIAL_DIAMETER / 2,
        height=DIAL_HEIGHT,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    )
    # A shallow index groove makes rotational intent readable in the review render.
    groove = Box(
        1.1,
        DIAL_DIAMETER * 0.42,
        0.5,
        align=(Align.CENTER, Align.MIN, Align.MIN),
    ).moved(Location((0, 0, DIAL_HEIGHT - 0.25)))
    return dial - groove


def gen_step():
    """Return the labeled, statically placed Still exterior assembly."""

    assembly = AssemblyHelper("still_exterior_concept")

    assembly.add(make_lower_shell(), "lower_shell", color=WARM_SHADOW)

    faceplate = make_faceplate().moved(Location((0, 0, BASE_HEIGHT)))
    assembly.add(faceplate, "faceplate", color=WARM_OFF_WHITE)

    display = make_display_insert().moved(
        Location((0, DISPLAY_CENTER_Y, DISPLAY_BOTTOM_Z))
    )
    assembly.add(display, "eink_face", color=EINK_GRAY)

    signal_ring = make_signal_ring().moved(
        Location((DIAL_CENTER_X, DIAL_CENTER_Y, BODY_HEIGHT))
    )
    assembly.add(signal_ring, "signal_ring", color=SIGNAL_ORANGE)

    dial = make_dial().moved(
        Location((DIAL_CENTER_X, DIAL_CENTER_Y, DIAL_BOTTOM_Z))
    )
    assembly.add(dial, "rotary_press_dial", color=NEAR_BLACK)

    return assembly.build()
