"""Full-size split PETG V2 vibrotactile headrest for 256 mm print beds.

The 300 mm body is divided at X=+90 mm, leaving the central head-contact and
actuator region in one 240 mm primary shell.  A 60 mm end cap is aligned by two
pins and retained by two independent one-piece bridges:

* an internal PETG actuator spine at the cavity ceiling; and
* the removable underside service panel.

Powered electronics remain external.

Coordinate system:
    origin: product footprint centre
    X: 300 mm product length
    Y: 140 mm front-to-rear depth
    +Z: upward from the closed underside
"""

from build123d import Align, Axis, Box, Color, Compound, Cylinder, Pos
from cadpy.assembly import AssemblyHelper, label_shape


BODY_LENGTH = 300.0
BODY_DEPTH = 140.0
BODY_BASE_Z = 0.0
BODY_TOP_Z = 80.0
BODY_HEIGHT = BODY_TOP_Z - BODY_BASE_Z
BODY_CORNER_RADIUS = 14.0
HEAD_CONTACT_EDGE_RADIUS = 10.0

SPLIT_X = 90.0
SEAM_GAP = 0.30
PRIMARY_LENGTH = SPLIT_X - SEAM_GAP / 2.0 + BODY_LENGTH / 2.0
END_CAP_LENGTH = BODY_LENGTH / 2.0 - SPLIT_X - SEAM_GAP / 2.0

CONCAVITY_RADIUS = 1000.0
CONCAVITY_CENTER_Z = 1068.0

CAVITY_LENGTH = 214.0
CAVITY_DEPTH = 112.0
CAVITY_BASE_Z = 4.0
CAVITY_TOP_Z = 53.0
CAVITY_HEIGHT = CAVITY_TOP_Z - CAVITY_BASE_Z
CAVITY_CORNER_RADIUS = 10.0

PANEL_LENGTH = 240.0
PANEL_DEPTH = 132.0
PANEL_THICKNESS = 4.0
PANEL_CORNER_RADIUS = 12.0
PANEL_RECESS_LENGTH = 242.0
PANEL_RECESS_DEPTH = 134.0
PANEL_RECESS_CLEARANCE = 1.0
PANEL_FASTENER_D = 3.4
PANEL_HEAD_RECESS_D = 6.2
PANEL_HEAD_RECESS_DEPTH = 1.5
PANEL_INSERT_ENVELOPE_D = 5.5
PANEL_INSERT_ENVELOPE_DEPTH = 8.0
PANEL_FASTENER_X = 105.0
PANEL_FASTENER_Y = 61.0
GASKET_GROOVE_OUTER_LENGTH = 226.0
GASKET_GROOVE_OUTER_DEPTH = 118.0
GASKET_GROOVE_INNER_LENGTH = 220.0
GASKET_GROOVE_INNER_DEPTH = 112.0
GASKET_GROOVE_DEPTH = 0.6
GASKET_GROOVE_OUTER_RADIUS = 13.0
GASKET_GROOVE_INNER_RADIUS = 10.0

CABLE_PORT_D = 8.0
CABLE_PORT_Z = 30.0
CABLE_GROMMET_RECESS_D = 14.0
CABLE_GROMMET_LIP = 2.5
CABLE_WALL_THICKNESS = (BODY_DEPTH - CAVITY_DEPTH) / 2.0
CABLE_GROMMET_RECESS_DEPTH = CABLE_WALL_THICKNESS - CABLE_GROMMET_LIP

# This one-piece PETG spine bridges the shell seam and carries the actuator.
SPINE_LENGTH = 210.0
SPINE_DEPTH = 100.0
SPINE_THICKNESS = 10.0
SPINE_CORNER_RADIUS = 8.0
SPINE_CLEARANCE_D = 4.5
SPINE_FASTENER_X_POSITIONS = (-75.0, 60.0, 100.0)
SPINE_FASTENER_Y = 42.0
SPINE_INSERT_ENVELOPE_D = 6.0
SPINE_INSERT_ENVELOPE_DEPTH = 8.0
STRAIN_RELIEF_HOLE_D = 3.4
STRAIN_RELIEF_X = 55.0
STRAIN_RELIEF_Y_POSITIONS = (8.0, 34.0)

ALIGNMENT_PIN_D = 6.0
ALIGNMENT_HOLE_D = 6.4
ALIGNMENT_PIN_LENGTH = 19.2
ALIGNMENT_HOLE_LENGTH = 20.0
ALIGNMENT_PIN_Y_POSITIONS = (-36.0, 36.0)
ALIGNMENT_PIN_Z = 60.0

TT25_LOWER_BODY_D = 67.0
TT25_BARE_TAB_SWEEP_D = 104.5
TT25_TOTAL_HEIGHT = 24.6
TT25_MOUNT_INTERFACE_THICKNESS = 4.0

SENSOR_SIZE = 30.0
SENSOR_THICKNESS = 2.0
SENSOR_OFFSET_X = 55.0


SHELL_COLOR = Color(0.72, 0.43, 0.20)
CAP_COLOR = Color(0.78, 0.48, 0.24)
PANEL_COLOR = Color(0.40, 0.18, 0.06)
SPINE_COLOR = Color(0.88, 0.40, 0.10)
PIN_COLOR = Color(0.95, 0.65, 0.20)
ACTUATOR_COLOR = Color(0.10, 0.12, 0.14)
SENSOR_COLOR = Color(0.12, 0.42, 0.24)


def _centered_box(length: float, depth: float, height: float, base_z: float):
    return Box(
        length,
        depth,
        height,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    ).moved(Pos(0, 0, base_z))


def _vertical_hole(diameter: float, height: float, x: float, y: float, base_z: float):
    return Cylinder(
        diameter / 2.0,
        height,
        align=(Align.CENTER, Align.CENTER, Align.MIN),
    ).moved(Pos(x, y, base_z))


def _horizontal_x_hole(diameter: float, length: float, x: float, y: float, z: float):
    return Cylinder(
        diameter / 2.0,
        length,
        rotation=(0, 90, 0),
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(Pos(x, y, z))


def _rounded_centered_box(
    length: float,
    depth: float,
    height: float,
    base_z: float,
    corner_radius: float,
):
    solid = _centered_box(length, depth, height, base_z)
    return solid.fillet(corner_radius, solid.edges().filter_by(Axis.Z))


def make_full_split_ready_shell():
    outer = _centered_box(BODY_LENGTH, BODY_DEPTH, BODY_HEIGHT, BODY_BASE_Z)
    outer = outer.fillet(BODY_CORNER_RADIUS, outer.edges().filter_by(Axis.Z))

    concavity_tool = Cylinder(
        CONCAVITY_RADIUS,
        BODY_DEPTH + 30.0,
        rotation=(90, 0, 0),
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(Pos(0, 0, CONCAVITY_CENTER_Z))
    shell = outer - concavity_tool

    contact_surface_lower_z = CONCAVITY_CENTER_Z - CONCAVITY_RADIUS
    contact_perimeter_edges = [
        edge
        for edge in shell.edges()
        if edge.bounding_box().min.Z >= contact_surface_lower_z - 1e-6
    ]
    if len(contact_perimeter_edges) != 8:
        raise ValueError(
            "Expected eight head-contact perimeter edges before softening, "
            f"found {len(contact_perimeter_edges)}"
        )
    shell = shell.fillet(HEAD_CONTACT_EDGE_RADIUS, contact_perimeter_edges)

    panel_recess = _rounded_centered_box(
        PANEL_RECESS_LENGTH,
        PANEL_RECESS_DEPTH,
        PANEL_THICKNESS + PANEL_RECESS_CLEARANCE,
        -PANEL_RECESS_CLEARANCE,
        PANEL_CORNER_RADIUS,
    )
    shell = shell - panel_recess

    cavity = _rounded_centered_box(
        CAVITY_LENGTH,
        CAVITY_DEPTH,
        CAVITY_HEIGHT,
        CAVITY_BASE_Z,
        CAVITY_CORNER_RADIUS,
    )
    shell = shell - cavity

    cable_port = Cylinder(
        CABLE_PORT_D / 2.0,
        24.0,
        rotation=(90, 0, 0),
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(Pos(0, BODY_DEPTH / 2.0 - 6.0, CABLE_PORT_Z))
    shell = shell - cable_port

    cable_grommet_recess = Cylinder(
        CABLE_GROMMET_RECESS_D / 2.0,
        CABLE_GROMMET_RECESS_DEPTH,
        rotation=(90, 0, 0),
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(
        Pos(
            0,
            BODY_DEPTH / 2.0 - CABLE_GROMMET_RECESS_DEPTH / 2.0,
            CABLE_PORT_Z,
        )
    )
    shell = shell - cable_grommet_recess

    for x in (-PANEL_FASTENER_X, PANEL_FASTENER_X):
        for y in (-PANEL_FASTENER_Y, PANEL_FASTENER_Y):
            shell = shell - _vertical_hole(
                PANEL_INSERT_ENVELOPE_D,
                PANEL_INSERT_ENVELOPE_DEPTH,
                x,
                y,
                PANEL_THICKNESS,
            )

    for x in SPINE_FASTENER_X_POSITIONS:
        for y in (-SPINE_FASTENER_Y, SPINE_FASTENER_Y):
            shell = shell - _vertical_hole(
                SPINE_INSERT_ENVELOPE_D,
                SPINE_INSERT_ENVELOPE_DEPTH,
                x,
                y,
                CAVITY_TOP_Z - 0.5,
            )

    for y in ALIGNMENT_PIN_Y_POSITIONS:
        shell = shell - _horizontal_x_hole(
            ALIGNMENT_HOLE_D,
            ALIGNMENT_HOLE_LENGTH,
            SPLIT_X,
            y,
            ALIGNMENT_PIN_Z,
        )

    return shell


def make_primary_shell():
    shell = make_full_split_ready_shell()
    max_x = SPLIT_X - SEAM_GAP / 2.0
    cutter = Box(
        PRIMARY_LENGTH,
        BODY_DEPTH + 20.0,
        BODY_HEIGHT + 20.0,
        align=(Align.MIN, Align.CENTER, Align.MIN),
    ).moved(Pos(-BODY_LENGTH / 2.0, 0, -10.0))
    primary = shell & cutter
    if abs(primary.bounding_box().max.X - max_x) > 1e-6:
        raise ValueError("Primary shell split plane drifted")
    return label_shape(
        primary,
        "split_v2_primary_shell",
        color=SHELL_COLOR,
    )


def make_end_cap():
    shell = make_full_split_ready_shell()
    min_x = SPLIT_X + SEAM_GAP / 2.0
    cutter = Box(
        END_CAP_LENGTH,
        BODY_DEPTH + 20.0,
        BODY_HEIGHT + 20.0,
        align=(Align.MIN, Align.CENTER, Align.MIN),
    ).moved(Pos(min_x, 0, -10.0))
    cap = shell & cutter
    if abs(cap.bounding_box().min.X - min_x) > 1e-6:
        raise ValueError("End-cap split plane drifted")
    return label_shape(
        cap,
        "split_v2_end_cap",
        color=CAP_COLOR,
    )


def make_service_panel():
    panel = _rounded_centered_box(
        PANEL_LENGTH,
        PANEL_DEPTH,
        PANEL_THICKNESS,
        0.0,
        PANEL_CORNER_RADIUS,
    )
    for x in (-PANEL_FASTENER_X, PANEL_FASTENER_X):
        for y in (-PANEL_FASTENER_Y, PANEL_FASTENER_Y):
            panel = panel - _vertical_hole(
                PANEL_FASTENER_D,
                PANEL_THICKNESS + 2.0,
                x,
                y,
                -1.0,
            )
            panel = panel - _vertical_hole(
                PANEL_HEAD_RECESS_D,
                PANEL_HEAD_RECESS_DEPTH + 1.0,
                x,
                y,
                -1.0,
            )

    gasket_outer = _rounded_centered_box(
        GASKET_GROOVE_OUTER_LENGTH,
        GASKET_GROOVE_OUTER_DEPTH,
        GASKET_GROOVE_DEPTH + 1.0,
        PANEL_THICKNESS - GASKET_GROOVE_DEPTH,
        GASKET_GROOVE_OUTER_RADIUS,
    )
    gasket_inner = _rounded_centered_box(
        GASKET_GROOVE_INNER_LENGTH,
        GASKET_GROOVE_INNER_DEPTH,
        GASKET_GROOVE_DEPTH + 2.0,
        PANEL_THICKNESS - GASKET_GROOVE_DEPTH - 1.0,
        GASKET_GROOVE_INNER_RADIUS,
    )
    panel = panel - (gasket_outer - gasket_inner)
    return label_shape(
        panel,
        "split_v2_structural_service_panel",
        color=PANEL_COLOR,
    )


def make_actuator_spine():
    spine = _rounded_centered_box(
        SPINE_LENGTH,
        SPINE_DEPTH,
        SPINE_THICKNESS,
        CAVITY_TOP_Z - SPINE_THICKNESS,
        SPINE_CORNER_RADIUS,
    )
    for x in SPINE_FASTENER_X_POSITIONS:
        for y in (-SPINE_FASTENER_Y, SPINE_FASTENER_Y):
            spine = spine - _vertical_hole(
                SPINE_CLEARANCE_D,
                SPINE_THICKNESS + 2.0,
                x,
                y,
                CAVITY_TOP_Z - SPINE_THICKNESS - 1.0,
            )
    for y in STRAIN_RELIEF_Y_POSITIONS:
        spine = spine - _vertical_hole(
            STRAIN_RELIEF_HOLE_D,
            SPINE_THICKNESS + 2.0,
            STRAIN_RELIEF_X,
            y,
            CAVITY_TOP_Z - SPINE_THICKNESS - 1.0,
        )
    return label_shape(
        spine,
        "split_v2_petg_actuator_spine",
        color=SPINE_COLOR,
    )


def make_alignment_pin(y: float):
    pin = Cylinder(
        ALIGNMENT_PIN_D / 2.0,
        ALIGNMENT_PIN_LENGTH,
        rotation=(0, 90, 0),
        align=(Align.CENTER, Align.CENTER, Align.CENTER),
    ).moved(Pos(SPLIT_X, y, ALIGNMENT_PIN_Z))
    return label_shape(
        pin,
        "split_v2_alignment_pin",
        "front" if y > 0 else "rear",
        color=PIN_COLOR,
    )


def make_tt25_envelope():
    mount_z = CAVITY_TOP_Z - SPINE_THICKNESS
    mount_sweep = Cylinder(
        TT25_BARE_TAB_SWEEP_D / 2.0,
        TT25_MOUNT_INTERFACE_THICKNESS,
        align=(Align.CENTER, Align.CENTER, Align.MAX),
    ).moved(Pos(0, 0, mount_z))
    lower_body = Cylinder(
        TT25_LOWER_BODY_D / 2.0,
        TT25_TOTAL_HEIGHT - TT25_MOUNT_INTERFACE_THICKNESS,
        align=(Align.CENTER, Align.CENTER, Align.MAX),
    ).moved(Pos(0, 0, mount_z - TT25_MOUNT_INTERFACE_THICKNESS))
    return label_shape(
        Compound(children=[mount_sweep, lower_body]),
        "tt25_8_received_part_envelope",
        color=ACTUATOR_COLOR,
    )


def make_sensor_coupon():
    coupon = _centered_box(
        SENSOR_SIZE,
        SENSOR_SIZE,
        SENSOR_THICKNESS,
        CAVITY_TOP_Z - SENSOR_THICKNESS,
    ).moved(Pos(SENSOR_OFFSET_X, 0, 0))
    return label_shape(
        coupon,
        "internal_accelerometer_coupon",
        color=SENSOR_COLOR,
    )


def make_split_product_body():
    assembly = AssemblyHelper("split_v2_product_body")
    assembly.add(
        make_primary_shell(),
        "split_v2_primary_shell",
        color=SHELL_COLOR,
    )
    assembly.add(
        make_end_cap(),
        "split_v2_end_cap",
        color=CAP_COLOR,
    )
    assembly.add(
        make_service_panel(),
        "split_v2_structural_service_panel",
        color=PANEL_COLOR,
    )
    return assembly.build()


def make_split_engineering_assembly():
    assembly = AssemblyHelper("split_v2_engineering")
    assembly.add(
        make_primary_shell(),
        "split_v2_primary_shell",
        color=SHELL_COLOR,
    )
    assembly.add(
        make_end_cap(),
        "split_v2_end_cap",
        color=CAP_COLOR,
    )
    assembly.add(
        make_service_panel(),
        "split_v2_structural_service_panel",
        color=PANEL_COLOR,
    )
    assembly.add(
        make_actuator_spine(),
        "split_v2_petg_actuator_spine",
        color=SPINE_COLOR,
    )
    for y in ALIGNMENT_PIN_Y_POSITIONS:
        assembly.add(
            make_alignment_pin(y),
            "split_v2_alignment_pin",
            "front" if y > 0 else "rear",
            color=PIN_COLOR,
        )
    assembly.add(
        make_tt25_envelope(),
        "tt25_8_received_part_envelope",
        color=ACTUATOR_COLOR,
    )
    assembly.add(
        make_sensor_coupon(),
        "internal_accelerometer_coupon",
        color=SENSOR_COLOR,
    )
    return assembly.build()


def gen_step():
    return make_split_engineering_assembly()
