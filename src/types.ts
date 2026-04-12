/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionConfig, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'floor3d-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// ---------------------------------------------------------------------------
// Visibility / Condition system
// ---------------------------------------------------------------------------

/**
 * A leaf condition: tests a single entity's state.
 * At least one of state, state_not, state_in, or state_not_in must be set.
 */
export interface VisibilityConditionLeaf {
  entity: string;
  state?: string;         // visible when entity.state === state
  state_not?: string;     // visible when entity.state !== state_not
  state_in?: string[];    // visible when entity.state is in list
  state_not_in?: string[]; // visible when entity.state is NOT in list
}

/**
 * A compound condition: AND/OR of child conditions.
 */
export interface VisibilityConditionGroup {
  and?: VisibilityCondition[];
  or?: VisibilityCondition[];
}

export type VisibilityCondition = VisibilityConditionLeaf | VisibilityConditionGroup;

// ---------------------------------------------------------------------------
// Anchor config
// ---------------------------------------------------------------------------

/**
 * Named anchors map a logical name to a 3D object in the scene.
 * Markers and room controls reference anchors by object_id.
 */
export interface AnchorConfig {
  id: string;       // logical name, e.g. "living_room_center"
  object_id: string; // Three.js object name in the loaded model
}

// ---------------------------------------------------------------------------
// Marker config (person / pet / device presence indicators)
// ---------------------------------------------------------------------------

export type MarkerType = 'avatar' | 'person' | 'icon' | 'dot' | 'badge';

/**
 * Maps entity state values (room names) to anchor object IDs.
 * The key is the state value of the entity (e.g. "living_room"),
 * the value is the 3D object name to use as the anchor position.
 *
 * Example:
 *   living_room: "living_room_avatar_anchor"
 *   kitchen: "kitchen_avatar_anchor"
 */
export type MarkerRoomMap = Record<string, string>;

export interface MarkerConfig {
  id: string;                    // unique identifier
  label?: string;                // display label
  entity: string;                // HA entity for room state (e.g. input_select.anas_current_room)
  type: MarkerType;              // rendering style
  person_entity?: string;        // for type:'person' — the person.* entity to get picture/name from
  image?: string;                // URL for avatar type (e.g. /local/avatars/anas.png)
  icon?: string;                 // MDI icon name for icon type (e.g. mdi:account)
  color?: string;                // CSS color for dot/icon/badge
  size?: number;                 // pixel size of marker (default 48)
  rooms: MarkerRoomMap;          // entity state → anchor object_id mapping
  hide_states?: string[];        // entity states that hide the marker (e.g. ["not_home","unknown"])
  visible_when?: VisibilityCondition; // additional visibility condition
  action?: 'more-info' | 'none'; // click action (default: more-info)
  z_offset?: number;             // vertical offset in world units above anchor
  offset_x?: number;             // manual screen-space X offset in pixels (applied after auto-stacking)
  offset_y?: number;             // manual screen-space Y offset in pixels (applied after auto-stacking)
}

// ---------------------------------------------------------------------------
// Room control config
// ---------------------------------------------------------------------------

export type RoomControlType = 'toggle' | 'more-info' | 'service-call' | 'scene-select' | 'media-toggle';

export interface RoomControlConfig {
  id: string;                     // unique identifier
  room?: string;                  // room label (optional, for documentation)
  anchor: string;                 // 3D object name to use as anchor position
  entity: string;                 // HA entity to reflect / control
  control_type: RoomControlType;
  icon?: string;                  // MDI icon (e.g. mdi:lightbulb)
  label?: string;                 // text label
  size?: number;                  // pixel size (default 40)
  color_on?: string;              // CSS color when entity is "on" / active
  color_off?: string;             // CSS color when entity is "off" / inactive
  visible_when?: VisibilityCondition;
  // For service-call type:
  service?: string;               // e.g. "light.toggle"
  service_data?: Record<string, any>;
  z_offset?: number;              // vertical offset in world units
  offset_x?: number;              // manual screen-space X offset in pixels (applied after auto-stacking)
  offset_y?: number;              // manual screen-space Y offset in pixels (applied after auto-stacking)
}

// ---------------------------------------------------------------------------
// Room animation config
// ---------------------------------------------------------------------------

export type AnimationType = 'music_notes' | 'ac_flow';

export interface AnimationConfig {
  id: string;                       // unique identifier
  entity: string;                   // HA entity driving the animation
  anchor: string;                   // 3D object name used as anchor
  type: AnimationType;
  z_offset?: number;                // vertical shift in world units
  offset_x?: number;                // screen-space X nudge in px
  offset_y?: number;                // screen-space Y nudge in px
  visible_when?: VisibilityCondition;
  // music_notes
  active_state?: string;            // entity state that triggers animation (default: 'playing')
  color?: string;                   // note color (default: golden)
  // ac_flow — snowflake icon, colored by HVAC mode
  color_cool?: string;              // icon color when cooling (default: sky blue)
  color_heat?: string;              // icon color when heating (default: orange)
  color_fan?: string;               // icon color when fan-only (default: light gray)
}

// ---------------------------------------------------------------------------
// Original card config (extended with new fields)
// ---------------------------------------------------------------------------

// TODO Add your configuration elements here for type-checking
export interface Floor3dCardConfig {
  type: string;
  path: string;
  name: string;
  font: string;
  attribute: string;
  objfile: string;
  mtlfile: string;
  objectlist: string;
  style: string;
  header: string;
  backgroundColor: string;
  globalLightPower: string;
  hideLevelsMenu: string;
  initialLevel: number;
  selectionMode: string;
  editModeNotifications: string;
  shadow: string;
  entities: any;
  lock_camera: string;
  click: string;
  action: string;
  overlay: string;
  width: number;
  height: number | string; // px number (e.g. 400) or any CSS value (e.g. "100vh", "50%")
  overlay_bgcolor: string;
  overlay_fgcolor: string;
  overlay_alignment: string;
  overlay_width: string;
  overlay_height: string;
  overlay_font: string;
  overlay_fontsize: string;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  entity: string;
  entity_template: string;
  cover: any;
  type3d: string;
  object_id: string;
  object_groups: any;
  object_group: string;
  zoom_areas: any;
  objects: any;
  lumens: number;
  decay: number;
  distance: number;
  colorcondition: any;
  light: any;
  door: any;
  doortype: string;
  extralightmode: string;
  room: any;
  zoom: string;
  elevation: number;
  transparency: number;
  show_axes: string;
  label: string;
  label_text: string;
  side: string;
  direction: string;
  degrees: number;
  percentage: number;
  hinge: string;
  pane: string;
  text: any;
  gesture: any;
  rotate: any;
  round_per_second: number;
  axis: string;
  span: string;
  vertical_alignment: string;
  textbgcolor: string;
  textfgcolor: string;
  camera_position: any;
  camera_rotate: any;
  camera_target: any;
  light_direction: any;
  light_target: string;
  radius: number;
  sky: string;
  north: any;
  x: number;
  y: number;
  z: number;
  hide: any;
  show: any;
  state: string;
  target: any;
  domain: string;
  camera: string;
  service: string;
  color: string;
  show_warning: boolean;
  show_error: boolean;

  // --- New: Anchors ---
  anchors?: AnchorConfig[];

  // --- New: Markers (person/pet/device presence) ---
  markers?: MarkerConfig[];

  // --- New: Room controls ---
  room_controls?: RoomControlConfig[];

  // --- New: Room animations ---
  animations?: AnimationConfig[];

  // --- New: Zoom control ---
  hide_zoom_areas_ui?: string; // 'yes' hides the built-in zoom selector in the bottom-left

  // --- New: Zoom entity ---
  // Set to an input_select (or any HA entity whose state is the zoom area name).
  // floor3d-card watches this entity and flies the camera to the matching zoom area
  // whenever the state changes.  When the user clicks a zoom button in the card the
  // entity is also updated, so automations / other cards can read the current zoom.
  zoom_entity?: string;
}

export interface EntityFloor3dCardConfig {
  hide: any;
  entity: string;
  type3d: 'light' | 'color' | 'hide' | 'text';
  object_id: string;
  lumens: number;
  conditions: ConditionsFloor3dCardConfig[];
  state: string;
}

export interface ConditionsFloor3dCardConfig {
  condition: string;
  state: string;
  color: string;
}
