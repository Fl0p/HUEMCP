# Philips Hue API Documentation (Summary)

This document summarizes the endpoints available in the **Philips Hue API v1** and **API v2**.  It lists the major endpoints and provides a high‑level description of request and response structures.  Where available, example field names have been pulled from the official documentation, which is subject to change.  For complete details, refer to the Philips Hue developer portal.

## Hue API v1

The Hue API v1 is a RESTful interface available on the bridge.  Requests are made to paths under `/api/<username>` where `<username>` is the application’s API key.  All v1 endpoints return JSON and many require a *whitelisted* user.  The sections below outline the main endpoint groups.

### Lights API

| Endpoint                            | Method   | Description                                                                                                                                                            | Notes                                                                                                                                                                                                 |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/lights`            | `GET`    | Retrieve all lights discovered by the bridge.  Returns a JSON object keyed by light IDs with state and metadata.  If no lights are present the response is `{}`.       | Response contains objects with `state`, `type`, `name`, `modelid`, `manufacturername`, `productname`, `capabilities`, `config`, `uniqueid` and `swversion`.                                           |
| `/api/<username>/lights/new`        | `GET`    | Return lights discovered by the most recent search for new lights along with a `lastscan` timestamp.                                                                   | `lastscan` is a string: “active” (search ongoing), “none” (no scan since power‑on) or ISO timestamp of last scan.                                                                                     |
| `/api/<username>/lights`            | `POST`   | Start searching for new lights.  Optionally accept a body with a list of serial numbers (`deviceid`).  Returns a success message indicating that scanning has started. | Search runs for 40 seconds and may need to be triggered again if many devices are found.                                                                                                              |
| `/api/<username>/lights/<id>`       | `GET`    | Fetch attributes and state of a single light.                                                                                                                          | State fields include `on` (bool), `bri` (0–254 brightness), `hue` (0–65535), `sat` (0–254), `xy` (CIE color), `ct` (mired color temperature), `alert`, `effect`, `colormode`, `mode` and `reachable`. |
| `/api/<username>/lights/<id>`       | `PUT`    | Rename a light.                                                                                                                                                        | Body must contain `"name":"New Name"` and response echoes the new name.                                                                                                                               |
| `/api/<username>/lights/<id>/state` | `PUT`    | Change the state of a light (on/off, brightness, hue, saturation, xy color, color temperature, alert effect, dynamic effect, transition time and incremental changes). | All parameters are optional; the bridge returns a list of success indications.  Some parameters (e.g. `bri_inc`, `hue_inc`) increment current values.                                                 |
| `/api/<username>/lights/<id>`       | `DELETE` | Remove a light from the bridge.                                                                                                                                        | Returns success if deleted; unreachable lights can still be removed.                                                                                                                                  |

### Groups API

Groups are collections of lights that can be controlled together.  Rooms and zones are implemented as groups.

| Endpoint                             | Method   | Description                                                                    | Notes                                                                                                                                                                                                   |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/groups`             | `GET`    | Return all groups on the bridge.                                               | Each group object contains `name`, `lights` (array of light IDs) and `type`; the `action` object shows the current state of one light in the group.                                                     |
| `/api/<username>/groups`             | `POST`   | Create a new group.                                                            | Body must include `lights` (array of IDs); optional `name` and `type`.  To create a **Room**, set `type` to `"Room"` and include a `class` field for the room class.                                    |
| `/api/<username>/groups/<id>`        | `GET`    | Retrieve attributes of a group including name, member lights and last command. | The `state` property reports `any_on` and `all_on` flags indicating whether any or all lights are currently on.                                                                                         |
| `/api/<username>/groups/<id>`        | `PUT`    | Modify a group’s name or membership.                                           | Body may include new `name`, updated `lights` list and, for rooms, the `class` field.                                                                                                                   |
| `/api/<username>/groups/<id>/action` | `PUT`    | Change the state of all lights in the group.                                   | Body parameters mirror those of the Lights API (`on`, `bri`, `hue`, `sat`, `ct`, `xy`, `effect`, `transitiontime`, incremental fields, etc.).  The response contains success indicators for each field. |
| `/api/<username>/groups/<id>`        | `DELETE` | Delete a group.                                                                | Cannot delete groups of type `LightSource` or `Luminaire`; deleting returns an error code 302.                                                                                                          |

### Schedules API

Schedules trigger actions at specific times.  A schedule contains a name, a command to execute and a time or local time.

| Endpoint                         | Method   | Description                                                                                 | Notes                                                                                                                                                                                                                                                                      |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/schedules`      | `GET`    | Return all schedules on the bridge.                                                         | Each schedule includes `name`, `description`, `command` (with `address`, `body` and `method`), `time` or `localtime`, `created`, `status` and `autodelete`.                                                                                                                |
| `/api/<username>/schedules`      | `POST`   | Create a new schedule.                                                                      | Body arguments include: `name` and `description` (strings); `command` object with `address`, `method` (POST/PUT/DELETE) and `body`; `localtime` (or deprecated `time`) specifying when to run; `status` (`enabled`/`disabled`); `autodelete` (bool); and `recycle` (bool). |
| `/api/<username>/schedules/<id>` | `GET`    | Retrieve attributes of a schedule, including name, description, command details and timing. | If `time` is deprecated, `localtime` should be used.  Additional fields indicate whether the schedule is recurring and if it can be automatically deleted.                                                                                                                 |
| `/api/<username>/schedules/<id>` | `PUT`    | Modify a schedule.                                                                          | Body arguments mirror those used to create a schedule; omitted fields remain unchanged.                                                                                                                                                                                    |
| `/api/<username>/schedules/<id>` | `DELETE` | Delete a schedule.                                                                          | Returns success if removed.                                                                                                                                                                                                                                                |

### Scenes API

Scenes store light settings for later recall.  They are identified by a scene ID.

| Endpoint                                             | Method   | Description                                             | Notes                                                                                                                                                        |
| ---------------------------------------------------- | -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/<username>/scenes`                             | `GET`    | List all scenes.                                        | Each scene includes fields such as `id`, `name`, `type`, `group`, `lights`, `owner`, `recycle`, `locked`, `appdata`, `image`, `lastupdated` and `version`.   |
| `/api/<username>/scenes`                             | `POST`   | Create a scene.                                         | Body specifies `name`, `lights` and optionally `type` (`LightScene` or `GroupScene`) and `recycle`.  When creating a GroupScene, a `group` must be supplied. |
| `/api/<username>/scenes/<id>`                        | `GET`    | Retrieve scene attributes and list of light states.     | Returns the scene metadata and an array of light states for each light in the scene.                                                                         |
| `/api/<username>/scenes/<id>`                        | `PUT`    | Modify a scene.                                         | Can rename a scene or update the list of lights and their stored states.                                                                                     |
| `/api/<username>/scenes/<id>/lightstates/<light_id>` | `PUT`    | Set the stored state for a single light within a scene. | Accepts the same parameters as `lights/<id>/state` (`on`, `bri`, `hue`, etc.).                                                                               |
| `/api/<username>/scenes/<id>`                        | `DELETE` | Delete a scene.                                         | Returns success if removed.                                                                                                                                  |

### Sensors API

Sensors represent physical devices like motion sensors, temperature sensors and switches.  The API allows reading and configuring sensors as well as updating their state.

| Endpoint                              | Method   | Description                                                                                       |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `/api/<username>/sensors`             | `GET`    | Return all sensors on the bridge.  Each sensor object contains metadata, configuration and state. |
| `/api/<username>/sensors`             | `POST`   | Create a new sensor (generally used for virtual sensors).                                         |
| `/api/<username>/sensors/<id>`        | `GET`    | Retrieve attributes and state of a specific sensor.                                               |
| `/api/<username>/sensors/<id>`        | `PUT`    | Update a sensor’s configuration, e.g., rename, battery reporting interval or thresholds.          |
| `/api/<username>/sensors/<id>/state`  | `PUT`    | Update the *state* of a sensor (e.g., to reset a button press count).                             |
| `/api/<username>/sensors/<id>/config` | `PUT`    | Update the sensor’s configuration values such as `on`/`off`, `reachable`, `battery`, etc.         |
| `/api/<username>/sensors/<id>`        | `DELETE` | Delete a sensor.                                                                                  |

### Rules API

Rules implement simple automation on the bridge.  They consist of a list of conditions and a list of actions.

| Endpoint                     | Method   | Description                                                                                                                                                          |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/rules`      | `GET`    | List all rules.  Each rule has a `name`, `owner`, `status`, a list of `conditions` and a list of `actions`.                                                          |
| `/api/<username>/rules`      | `POST`   | Create a new rule.  Body defines `name`, `conditions` (each referencing a sensor or schedule) and `actions` (API calls to perform when conditions evaluate to true). |
| `/api/<username>/rules/<id>` | `GET`    | Get a rule’s attributes and current status.                                                                                                                          |
| `/api/<username>/rules/<id>` | `PUT`    | Update a rule’s name, conditions and/or actions.                                                                                                                     |
| `/api/<username>/rules/<id>` | `DELETE` | Delete a rule.                                                                                                                                                       |

### Configuration API

The bridge configuration can be read and modified.

| Endpoint                                      | Method   | Description                                                                                                                                                      |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/config`                      | `GET`    | Return the configuration of the bridge, including network settings, software version, Zigbee channel, whitelist of authorised users, timezone and other details. |
| `/api/<username>/config`                      | `PUT`    | Modify configuration parameters such as `name`, `zigbeechannel`, `dhcp`, `ipaddress`, `timezone` and `portalservices`.                                           |
| `/api/<username>/config/whitelist/<username>` | `DELETE` | Remove an authorised user from the bridge whitelist (revokes their API access).                                                                                  |

### Resourcelinks API

Resource links allow users to create groupings of arbitrary resources.

| Endpoint                             | Method   | Description                                                                                                                                             |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/resourcelinks`      | `GET`    | List all resource links.  Each link contains a `name`, `description`, `type`, `classid`, `owner`, `links` (array of resource paths) and `recycle` flag. |
| `/api/<username>/resourcelinks`      | `POST`   | Create a resource link by supplying `name`, `description`, `type`, `classid`, `links`, `owner` and `recycle`.                                           |
| `/api/<username>/resourcelinks/<id>` | `GET`    | Get attributes of a single resource link.                                                                                                               |
| `/api/<username>/resourcelinks/<id>` | `PUT`    | Update the `name`, `description`, `links`, `classid` or `recycle` status of a resource link.                                                            |
| `/api/<username>/resourcelinks/<id>` | `DELETE` | Delete a resource link.                                                                                                                                 |

### Capabilities API

| Endpoint                       | Method | Description                                                                                                                                                                                                                  |
| ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/<username>/capabilities` | `GET`  | Return the capabilities of the Hue bridge.  The response lists the maximum numbers of lights, groups, scenes, schedules, sensors, rules and resource links supported, along with streaming and software update capabilities. |

### Deprecated Info API

The **Info API** (`/api/<username>/info`) is deprecated as of API v1.15; it previously provided a general overview of bridge configuration.  New applications should use the configuration and capabilities endpoints instead.

## Hue API v2 (CLIP API v2)

Hue API v2 is a redesign of the CLIP API.  It organizes resources under a single `/clip/v2` namespace and uses more consistent object models.  All requests **require** a `hue-application-key` header for authentication.  The base URL is `https://<bridge_ip>/clip/v2` and responses include a top‑level `data` array and `errors` array.  Only the most commonly used resources are summarized below; consult the full API specification for field‑level details.

### Common Patterns

* **Authentication:** Each call must include `hue-application-key: <appKey>` in the HTTP headers.
* **List resources:** `GET /resource/<rtype>` returns all resources of type `<rtype>`; `GET /resource` lists every resource accessible to the application.
* **Retrieve single resource:** `GET /resource/<rtype>/<id>` returns one resource instance.
* **Create resource:** Some resources (e.g., rooms, zones, scenes) support `POST /resource/<rtype>` with a body defining required attributes.
* **Update resource:** `PUT /resource/<rtype>/<id>` updates mutable attributes of a resource.  Not all resources are editable.
* **Delete resource:** Only certain resource types (e.g., scenes, rooms, zones) support `DELETE /resource/<rtype>/<id>`.

### Key Resource Types

| Resource type                      | Paths                                                                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **light**                          | `/resource/light` (GET), `/resource/light/{id}` (GET/PUT)                                               | Represents a single light service (a light on a device).  Each light has an `id`, `id_v1` (the v1 path), `owner` (device/room/zone), `type` (`light`), `metadata` with `name` and `archetype`, and state objects such as `on`, `dimming` (brightness), `color` (xy and gamuts), `color_temperature`, and optional `gradient` and `effects`.  Updating a light uses `PUT /resource/light/{id}` with a JSON body containing only the fields to change (e.g., `{ "on": { "on": true }, "dimming": { "brightness": 50 } }`). |
| **grouped_light**                  | `/resource/grouped_light` (GET), `/resource/grouped_light/{id}` (GET/PUT)                               | Aggregated light state for a room, zone or home.  The grouped light resource exposes `on`, `dimming`, `color` and `color_temperature` to control all member lights simultaneously.                                                                                                                                                                                                                                                                                                                                       |
| **scene**                          | `/resource/scene` (GET/POST), `/resource/scene/{id}` (GET/PUT/DELETE)                                   | Stores a collection of light settings.  Creating a scene uses `POST /resource/scene` with a `name`, `type` (`scene` or `action`), `group` or `zone`, and optional light state definitions.  Scenes can be recalled by updating a grouped light or sending a recall action via behaviors.                                                                                                                                                                                                                                 |
| **room**                           | `/resource/room` (GET/POST), `/resource/room/{id}` (GET/PUT/DELETE)                                     | Rooms group devices into a mutually exclusive group.  To create a room, call `POST /resource/room` with `metadata.name` and a list of `children` (resource identifiers).  Updating or deleting a room uses the corresponding `PUT` or `DELETE` endpoint.                                                                                                                                                                                                                                                                 |
| **zone**                           | `/resource/zone` (GET/POST), `/resource/zone/{id}` (GET/PUT/DELETE)                                     | Zones group services or rooms and allow overlapping membership.  Creation and update follow the same pattern as rooms.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **bridge_home**                    | `/resource/bridge_home` (GET), `/resource/bridge_home/{id}` (GET)                                       | Represents the bridge itself and groups all rooms and free devices.  It is read‑only.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **device**                         | `/resource/device` (GET), `/resource/device/{id}` (GET/PUT)                                             | Represents a physical device (e.g., light bulb, switch, sensor).  Includes `product_data`, `metadata` and arrays of child services (light services, buttons, sensors, etc.).  Some metadata (like the device name) can be updated using `PUT`.                                                                                                                                                                                                                                                                           |
| **sensor services**                | `/resource/motion`, `/resource/temperature`, `/resource/light_level`, `/resource/relative_rotary`, etc. | These endpoints expose individual sensor services.  Each resource type returns arrays with sensor state, owner and metadata.  For example, `GET /resource/motion` returns motion sensors with fields like `motion` (bool), `sensitivity` and `last_event`.                                                                                                                                                                                                                                                               |
| **device_power**                   | `/resource/device_power` (GET), `/resource/device_power/{id}` (GET/PUT)                                 | Provides battery information and power state for battery‑powered devices.  Updating this resource allows acknowledgment of low‑battery warnings.                                                                                                                                                                                                                                                                                                                                                                         |
| **behavior scripts and instances** | `/resource/behavior_script` and `/resource/behavior_instance` (GET/POST/GET by id/PUT/DELETE)           | Expose the new behavior engine (automation) functionality.  Scripts define templates (e.g., “time‑based scene recall”) and instances configure scripts for a specific bridge.                                                                                                                                                                                                                                                                                                                                            |

### Eventstream

Hue API v2 also offers a streaming API for real‑time updates.  Subscribing to `/eventstream/clip/v2` via a long‑lived HTTP connection returns events whenever resource state changes (e.g., motion detected or light state changed).  Event payloads contain an array of resources with updated `data` and an event `type` field.  Authentication via `hue-application-key` is required.

### Migrating from API v1 to v2

The Hue developer portal provides a [migration guide] which explains differences between the v1 and v2 APIs.  Notable changes include:

* **Resource‑oriented model:** Instead of separate endpoints for lights, groups, scenes, sensors and schedules, v2 exposes a unified set of resource types under `/resource`.  Each resource instance contains its own identifier and links to its owner.
* **Consistent field names:** v2 uses standard JSON types and nested objects for complex properties (e.g., `dimming` for brightness and `color` for color values).
* **Authentication header:** v2 requires the `hue-application-key` HTTP header; v1 relied on a username in the path.
* **No app registration:** New applications using v2 must still register to obtain an application key, but rule engine operations and app registration endpoints from v1 are not yet available in v2.

For detailed field definitions and a complete list of resources (including entertainment, camera, security, home kit, Matter, geofencing and other advanced features) refer to the full Hue CLIP API reference on the developer portal.

