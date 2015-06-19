# iflux-publibike-event-source
An iFLUX event source that polls the PubliBike feed and generates events for bike movements.

## Development setup

Create a `.env` file in the root directory of the project and put the following content:

```bash
COMMON_IFLUX_API_URL=http://localhost:3006/v1

PUBLIBIKE_EVENT_TYPE=http://localhost:3000/schemas/eventTypes/publibikeMovement

# Uncomment this var to customize the polling interval
# PUBLIBIKE_POLL_INTERVAL=1234
```

### Mandatory

| Name                       | Description                               |
| -------------------------- | ----------------------------------------- |
| COMMON_IFLUX_API_URL       | Should be the URL to post events on iFLUX. |
| PUBLIBIKE_EVENT_TYPE       | Define the publibike movement event type. Must be unique. | 

### Optional

| Name                       | Description                               |
| -------------------------- | ----------------------------------------- |
| PUBLIBIKE_POLL_INTERVAL    | Define the delay between to call to the Publibike API. |
