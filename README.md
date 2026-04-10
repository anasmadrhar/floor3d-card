# Floor3D Card — Your Home as a Digital Twin

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/adizanni/floor3d-card.svg?style=for-the-badge)](https://github.com/adizanni/floor3d-card/releases)

Render an interactive 3D model of your home directly in a Lovelace card and bind every object in the scene to a Home Assistant entity — lights, doors, covers, sensors, cameras, and more. Walk through your digital twin and control your home in real time.

---

## Installation

### HACS (recommended)

Search for **floor3d** in **HACS → Frontend** and install. After installing, add the card resource:

```yaml
# configuration.yaml  (or via Settings → Dashboards → Resources)
lovelace:
  resources:
    - url: /hacsfiles/floor3d-card/floor3d-card.js
      type: module
```

### Manual

Download `floor3d-card.js` from the [latest release](https://github.com/adizanni/floor3d-card/releases) and place it in `/config/www/`. Then add the resource:

```yaml
lovelace:
  resources:
    - url: /local/floor3d-card.js
      type: module
```

---

## Preparing Your 3D Model

### Recommended tool — SweetHome3D

[SweetHome3D](http://www.sweethome3d.com/) is free and works well. Model your home, then export via **3D View → Export to OBJ format**. Copy the resulting files (`*.obj`, `*.mtl`, textures) to a subfolder of `/config/www/`.

### GLB format (faster)

Convert the OBJ export to a single binary GLB file for faster loading:

```bash
npm install -g obj2gltf
obj2gltf --checkTransparency -i home.obj -o home.glb
```

Copy only `home.glb` to `/config/www/`. No `.mtl` or texture files needed.

### Tips

- Place the upper-left corner of your floor plan at **0, 0** in the modeling tool for correct camera behaviour.
- Use the [ExportToHASS SweetHome3D plugin](https://github.com/adizanni/ExportToHASS) to preserve object IDs across re-exports.
- To find object IDs: load the card with no entity bindings, then **double-click** any object in edit mode — a popup shows its ID and the current camera position.

---

## Basic Card Configuration

```yaml
type: custom:floor3d-card
name: My Home
path: /local/my_home/          # folder containing the model files
objfile: home.glb              # .glb (recommended) or .obj
# mtlfile: home.mtl            # only needed for .obj format
height: 500                    # card height in pixels (default 400)
backgroundColor: '#aaaaaa'
globalLightPower: '0.8'
header: 'yes'
shadow: 'no'
lock_camera: 'no'
```

### Top-Level Options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | string | **required** | `custom:floor3d-card` |
| `name` | string | `Floor 3d` | Card title |
| `path` | string | **required** | URL path to the folder holding model files |
| `objfile` | string | **required** | Model filename (`.glb` or `.obj`) |
| `mtlfile` | string | — | Material file (`.obj` models only) |
| `height` | number | `400` | Card height in pixels |
| `backgroundColor` | string | `#aaaaaa` | Canvas background: hex color, color name, or `transparent` |
| `globalLightPower` | number/string | `0.5` | Ambient light intensity (0–1) or a numeric sensor entity ID |
| `header` | `yes`/`no` | `yes` | Show the card title bar |
| `shadow` | `yes`/`no` | `no` | Enable light shadows (impacts performance) |
| `extralightmode` | `yes`/`no` | `no` | Limit simultaneous shadow-casting lights to the GPU maximum |
| `lock_camera` | `yes`/`no` | `no` | Disable orbit / zoom / pan |
| `click` | `yes`/`no` | `no` | Enable click events on 3D objects |
| `show_axes` | `yes`/`no` | `no` | Show X/Y/Z axes (useful when setting up spotlights) |
| `sky` | `yes`/`no` | `no` | Render sky, ground, and sun driven by `sun.sun` |
| `north` | object | `{x:0, z:1}` | North direction on the X-Z plane (used with `sky: yes`) |
| `editModeNotifications` | `yes`/`no` | `yes` | Double-click popups in edit mode |
| `selectionMode` | `yes`/`no` | `no` | Select multiple objects (IDs logged to console) |
| `hideLevelsMenu` | `yes`/`no` | `no` | Hide the floor-level selector |
| `initialLevel` | number | — | Level index shown on load |
| `style` | string | — | Inline CSS applied to the `ha-card` element |

---

## Camera

### Setting the default camera position

In edit mode, double-click an empty area of the model to log the current camera YAML to the console and clipboard. Paste into your config:

```yaml
camera_position:
  x: 609.3
  y: 905.5
  z: 376.6
camera_rotate:
  x: -1.093
  y: 0.520
  z: 0.764
camera_target:
  x: 37.4
  y: 18.6
  z: -82.6
```

---

## Zoom Areas

Zoom areas let you jump the camera to a specific room. The card smoothly animates the camera fly-to (750 ms cubic ease-in-out).

```yaml
zoom_areas:
  - name: living_room           # unique name — also the input_select option value
    object_id: LivingRoom_floor # 3D object used to calculate the zoom target
    distance: 600               # camera distance from the target (cm)
    direction:                  # camera approach vector
      x: 0
      y: 1
      z: 0
    level: 0                    # (optional) show this level when zoomed in

  - name: kitchen
    object_id: Kitchen_floor
    distance: 400
```

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | **required** | Unique zoom area identifier |
| `object_id` | string | **required** | 3D object that defines the zoom target |
| `distance` | number | `500` | Camera distance from target in model units |
| `direction` | object | `{x:0,y:1,z:0}` | Camera approach direction vector |
| `level` | number | — | Show this floor level when zoom is active |

### Hiding the zoom selector UI

```yaml
hide_zoom_areas_ui: 'yes'   # hides the bottom-left zoom dropdown
```

### Controlling zoom from Home Assistant (zoom_entity)

Bind zoom to an `input_select` helper so automations and other cards can both **read and set** the current zoom:

```yaml
zoom_entity: input_select.floor3d_zoom
```

**How it works:**
- When the `input_select` state changes → card flies to the matching zoom area.
- When the user clicks a zoom button in the card → the `input_select` is updated.
- Set the state to `reset` to return to the default camera position.

**Setting up the helper** (Settings → Helpers → Add → Dropdown):
- Options: one per zoom area `name`, plus `reset`

**Triggering from a Button card:**
```yaml
type: button
name: Living Room
tap_action:
  action: call-service
  service: input_select.select_option
  data:
    entity_id: input_select.floor3d_zoom
    option: living_room
```

**Automation — zoom to occupied room:**
```yaml
alias: Follow room presence
trigger:
  - platform: state
    entity_id: input_select.anas_room
action:
  - service: input_select.select_option
    data:
      entity_id: input_select.floor3d_zoom
      option: "{{ trigger.to_state.state }}"
```

---

## Entity Bindings

Bind 3D objects to Home Assistant entities via the `entities` list.

```yaml
entities:
  - entity: light.living_room
    type3d: light
    object_id: LivingRoom_ceiling_lamp
    light:
      lumens: 800
      decay: 1
      distance: 300
```

### Common entity fields

| Field | Type | Description |
|---|---|---|
| `entity` | string | HA entity ID (or `<object_group>` reference) |
| `type3d` | string | Binding type — see sections below |
| `object_id` | string | 3D object name in the model |
| `entity_template` | string | JS template: `'[[[ if ($entity > 25) { "hot" } ]]]'` |
| `action` | string | On-click: `more-info`, `overlay`, or `default` |

---

### Light

Illuminates a point in the scene. Tracks brightness, color, and color temperature.

```yaml
- entity: light.kitchen
  type3d: light
  object_id: Kitchen_pendant
  light:
    lumens: 600          # max brightness (0–4000)
    color: '#ffddaa'     # static color (overridden by HA color attrs)
    decay: 1             # light falloff rate (0–2)
    distance: 400        # effect radius in model units
    shadow: 'no'         # override global shadow for this light
    vertical_alignment: top   # top/middle/bottom — avoids lamp blocking itself
    light_target: TV_screen   # makes it a spotlight aimed at this object
```

---

### Hide / Show

Hide or reveal a 3D object based on entity state.

```yaml
- entity: binary_sensor.front_door
  type3d: hide
  object_id: FrontDoor_open_state
  hide:
    state: 'off'         # hide the object when entity state equals this

- entity: binary_sensor.rain
  type3d: show
  object_id: Umbrella
  show:
    state: 'on'          # show the object when entity state equals this
```

---

### Color

Paint a 3D object a different color depending on entity state.

```yaml
- entity: sensor.living_room_temp
  type3d: color
  object_id: Thermometer
  entity_template: '[[[ if ($entity > 25) { "hot" } else { "cool" } ]]]'
  colorcondition:
    - state: hot
      color: '#ff4444'
    - state: cool
      color: '#4444ff'
```

---

### Text

Render entity state as text on a flat plane object (TV screen, picture frame, display).

```yaml
- entity: sensor.living_room_temp
  type3d: text
  object_id: TempDisplay_plane
  text:
    span: 60%
    font: verdana
    textbgcolor: '#000000'
    textfgcolor: '#ffffff'
    attribute: temperature   # optional — show an attribute instead of state
```

---

### Door

Animate a door or window opening and closing.

```yaml
- entity: binary_sensor.front_door
  type3d: door
  object_id: FrontDoor
  door:
    doortype: swing          # swing or slide
    direction: inner         # inner or outer (swing only)
    side: left               # up/down/left/right — hinge side
    degrees: 90              # open angle (swing) or percentage (slide)
    hinge: FrontDoor_hinge   # object_id of the hinge (optional)
    pane: FrontDoor_pane     # object_id of the moving panel (optional)
```

---

### Cover

Animate covers (blinds, roller shutters) based on `current_position` attribute.

```yaml
- entity: cover.living_room_blind
  type3d: cover
  object_id: LivingRoom_blind
  cover:
    doortype: slide
    side: up
    direction: inner
    percentage: 100
```

---

### Rotate

Continuously rotate an object (fans, turbines, etc.).

```yaml
- entity: fan.ceiling_fan
  type3d: rotate
  object_id: CeilingFan_blades
  rotate:
    axis: y
    round_per_second: 2
```

---

### Room

Highlight a room with a translucent parallelepiped and an optional state label.

```yaml
- entity: sensor.living_room_motion
  type3d: room
  object_id: LivingRoom_floor_room
  room:
    elevation: 240
    transparency: 60
    color: '#aaffaa'
    label: 'yes'
    span: 50%
    font: verdana
    textbgcolor: '#00000000'
    textfgcolor: '#ffffff'
  colorcondition:
    - state: 'on'
      color: '#ff0000'
    - state: 'off'
      color: '#00ff00'
```

---

### Gesture

Call a service when a 3D object is double-clicked.

```yaml
- entity: switch.coffee_maker
  type3d: gesture
  object_id: CoffeeMaker
  gesture:
    domain: switch
    service: toggle
```

---

### Camera

Show a camera feed popup when an object is double-clicked.

```yaml
- entity: camera.front_door
  type3d: camera
  object_id: FrontDoor_camera_mount
```

---

## Object Groups

Group multiple objects so they respond to one entity binding. Reference a group with `<group_name>` syntax.

```yaml
object_groups:
  - object_group: LivingRoomLights
    objects:
      - object_id: Lamp_1
      - object_id: Lamp_2
      - object_id: Lamp_3

entities:
  - entity: light.living_room
    type3d: light
    object_id: <LivingRoomLights>
    light:
      lumens: 800
```

---

## Overlay Panel

Show entity name and state in a floating panel when objects are clicked.

```yaml
overlay: 'yes'
click: 'yes'
overlay_bgcolor: 'rgba(0,0,0,0.6)'
overlay_fgcolor: '#ffffff'
overlay_alignment: top-left   # top-left, top-right, bottom-left, bottom-right
overlay_width: '33'           # percentage of card width
overlay_height: '20'          # percentage of card height
overlay_font: verdana
overlay_fontsize: 14px

entities:
  - entity: sensor.living_room_temp
    type3d: color
    object_id: Thermometer
    action: overlay             # clicking shows state in the overlay panel
```

---

## Anchors

Named anchors attach logical positions to 3D objects. Markers, room controls, and animations all reference anchors.

```yaml
anchors:
  - id: living_room_center      # logical name used by markers/controls/animations
    object_id: LivingRoom_floor # any object in the scene
  - id: kitchen_center
    object_id: Kitchen_island
  - id: ac_unit_living
    object_id: AC_unit_living_room
```

---

## Markers

Markers render floating HTML elements above 3D anchors to show where people, pets, or devices are. They animate smoothly between rooms when the entity state changes.

### Marker types

| Type | Description |
|---|---|
| `person` | Round avatar from a `person.*` entity (uses entity picture) |
| `avatar` | Round image from a custom URL |
| `icon` | MDI icon |
| `dot` | Filled circle |
| `badge` | Label badge |

### Example — person marker

```yaml
anchors:
  - id: living_room_center
    object_id: LivingRoom_floor
  - id: kitchen_center
    object_id: Kitchen_floor

markers:
  - id: anas_marker
    entity: input_select.anas_current_room   # state = current room name
    type: person
    person_entity: person.anas               # pulls picture + name
    size: 52
    hide_states:
      - not_home
      - unknown
    rooms:
      living_room: living_room_center        # entity state → anchor id
      kitchen: kitchen_center
      bedroom: bedroom_center
```

### Example — device icon marker

```yaml
markers:
  - id: robot_vacuum
    entity: input_select.vacuum_room
    type: icon
    icon: mdi:robot-vacuum
    color: '#4fc3f7'
    size: 40
    rooms:
      living_room: living_room_center
      kitchen: kitchen_center
    visible_when:
      entity: vacuum.roborock
      state_not: docked
```

### Marker options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | string | **required** | Unique identifier |
| `entity` | string | **required** | Entity whose state is the current room name |
| `type` | string | **required** | `person`, `avatar`, `icon`, `dot`, or `badge` |
| `person_entity` | string | — | `person.*` entity (for `type: person`) |
| `image` | string | — | Image URL (for `type: avatar`) |
| `icon` | string | — | MDI icon name (for `type: icon`) |
| `color` | string | — | CSS color |
| `size` | number | `48` | Marker size in pixels |
| `rooms` | map | **required** | `room_state_value: anchor_id` mapping |
| `hide_states` | list | — | States that hide the marker |
| `visible_when` | condition | — | Additional visibility condition |
| `action` | string | `more-info` | Click action: `more-info` or `none` |
| `z_offset` | number | `0` | Vertical shift in model units |
| `offset_x` | number | `0` | Screen-space X offset in pixels |
| `offset_y` | number | `0` | Screen-space Y offset in pixels |

---

## Room Controls

Floating icon buttons anchored to 3D positions for quick room-level control.

```yaml
room_controls:
  - id: living_lights_btn
    anchor: living_room_center   # anchor id from the anchors list
    entity: light.living_room
    control_type: toggle
    icon: mdi:lightbulb
    color_on: '#ffdd55'
    color_off: 'rgba(255,255,255,0.3)'
    size: 44
    z_offset: 50

  - id: living_media_btn
    anchor: living_room_center
    entity: media_player.living_room_tv
    control_type: more-info
    icon: mdi:television
    size: 44
    offset_x: 56              # stack horizontally next to first button
```

### Control types

| Type | Description |
|---|---|
| `toggle` | Calls `homeassistant.toggle` on click |
| `more-info` | Opens the more-info dialog |
| `service-call` | Calls a custom `service` with `service_data` |
| `scene-select` | Activates a scene entity |
| `media-toggle` | Plays / pauses a media player |

### Room control options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | string | **required** | Unique identifier |
| `anchor` | string | **required** | Anchor ID from `anchors` |
| `entity` | string | **required** | HA entity to reflect and control |
| `control_type` | string | **required** | See table above |
| `icon` | string | — | MDI icon name |
| `label` | string | — | Text label |
| `size` | number | `40` | Button size in pixels |
| `color_on` | string | — | CSS color when entity is active |
| `color_off` | string | — | CSS color when entity is inactive |
| `service` | string | — | Service to call (for `service-call` type) |
| `service_data` | map | — | Data passed to the service |
| `visible_when` | condition | — | Visibility condition |
| `z_offset` | number | `0` | Vertical shift in model units |
| `offset_x` | number | `0` | Screen-space X offset in pixels |
| `offset_y` | number | `0` | Screen-space Y offset in pixels |

---

## Room Animations

Animated overlays anchored to 3D positions — music notes above speakers, airflow from AC units.

### Music notes

Shows animated floating ♪♫ notes above an anchor when a media player is playing.

```yaml
animations:
  - id: living_room_music
    type: music_notes
    entity: media_player.living_room_speaker
    anchor: living_room_center
    active_state: playing      # default: 'playing'
    color: 'rgba(255,215,80,0.95)'
    z_offset: 80
```

### AC airflow

Shows expanding arc ripples from an AC unit. Color changes automatically with HVAC mode (cool / heat / fan-only).

```yaml
animations:
  - id: living_ac_flow
    type: ac_flow
    entity: climate.living_room_ac
    anchor: ac_unit_living
    direction: down-right      # see direction options below
    color_cool: 'rgba(100,200,255,0.85)'
    color_heat: 'rgba(255,130,50,0.85)'
    color_fan:  'rgba(220,220,220,0.7)'
    z_offset: 20
```

#### Direction options

| Value | Visual |
|---|---|
| `up` | Arcs drift upward |
| `down` | Arcs drift downward |
| `left` | Arcs drift left |
| `right` | Arcs drift right |
| `up-left` | Circles drift diagonally up-left |
| `up-right` | Circles drift diagonally up-right |
| `down-left` | Circles drift diagonally down-left |
| `down-right` | Circles drift diagonally down-right (ideal for wall-mounted units) |

### Animation options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | string | **required** | Unique identifier |
| `type` | string | **required** | `music_notes` or `ac_flow` |
| `entity` | string | **required** | HA entity driving the animation |
| `anchor` | string | **required** | Anchor ID from `anchors` |
| `active_state` | string | `playing` | State that activates the animation (music_notes) |
| `color` | string | golden | Note color (music_notes) |
| `direction` | string | `up` | Airflow direction (ac_flow) |
| `color_cool` | string | blue | Particle color in cooling mode |
| `color_heat` | string | orange | Particle color in heating mode |
| `color_fan` | string | grey | Particle color in fan-only mode |
| `z_offset` | number | `0` | Vertical shift in model units |
| `offset_x` | number | `0` | Screen-space X nudge in pixels |
| `offset_y` | number | `0` | Screen-space Y nudge in pixels |
| `visible_when` | condition | — | Visibility condition |

---

## Visibility Conditions

`visible_when` can be used on markers, room controls, and animations. It supports simple leaf conditions and compound AND/OR logic.

### Leaf condition

```yaml
visible_when:
  entity: binary_sensor.someone_home
  state: 'on'
```

Available operators: `state`, `state_not`, `state_in`, `state_not_in`.

### Compound condition (AND)

```yaml
visible_when:
  and:
    - entity: input_boolean.show_markers
      state: 'on'
    - entity: person.anas
      state_not: not_home
```

### Compound condition (OR)

```yaml
visible_when:
  or:
    - entity: sensor.mode
      state: home
    - entity: sensor.mode
      state: guest
```

---

## Sky and Sun

Render a realistic sky, ground, and sun position based on `sun.sun`.

```yaml
sky: 'yes'
north:
  x: -1
  z: 0
```

Add a transparent slab object in SweetHome3D named `transparent_slab*` to prevent sunlight from shining through the ceiling.

---

## Full Configuration Example

```yaml
type: custom:floor3d-card
name: Home
path: /local/my_home/
objfile: home.glb
height: 550
backgroundColor: '#cccccc'
globalLightPower: '0.7'
header: 'yes'
shadow: 'no'
lock_camera: 'no'
hide_zoom_areas_ui: 'no'
zoom_entity: input_select.floor3d_zoom

camera_position:
  x: 609.3
  y: 905.5
  z: 376.6
camera_target:
  x: 37.4
  y: 18.6
  z: -82.6

zoom_areas:
  - name: living_room
    object_id: LivingRoom_floor
    distance: 500
  - name: kitchen
    object_id: Kitchen_floor
    distance: 400

anchors:
  - id: living_room_center
    object_id: LivingRoom_floor
  - id: kitchen_center
    object_id: Kitchen_floor
  - id: ac_unit_living
    object_id: AC_LivingRoom

markers:
  - id: anas
    entity: input_select.anas_room
    type: person
    person_entity: person.anas
    size: 52
    hide_states: [not_home, unknown]
    rooms:
      living_room: living_room_center
      kitchen: kitchen_center

room_controls:
  - id: living_lights
    anchor: living_room_center
    entity: light.living_room
    control_type: toggle
    icon: mdi:lightbulb
    color_on: '#ffdd55'
    color_off: 'rgba(255,255,255,0.25)'
    size: 44
    z_offset: 60

animations:
  - id: living_music
    type: music_notes
    entity: media_player.living_room
    anchor: living_room_center
    active_state: playing
    z_offset: 90
  - id: living_ac
    type: ac_flow
    entity: climate.living_room_ac
    anchor: ac_unit_living
    direction: down-right
    z_offset: 20

entities:
  - entity: light.kitchen
    type3d: light
    object_id: Kitchen_lamp
    light:
      lumens: 600
      decay: 1
      distance: 350
  - entity: binary_sensor.front_door
    type3d: door
    object_id: FrontDoor
    door:
      doortype: swing
      direction: inner
      side: left
      degrees: 90
```

---

## Credits

Original card by [adizanni](https://github.com/adizanni/floor3d-card).  
Room-aware smart home features (markers, room controls, animations, zoom entity, diagonal AC wind) added by [anasmadrhar](https://github.com/anasmadrhar).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/AndyHA)
