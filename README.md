# qup-end
Anonymous queue application.

## api

### errors
All API calls have `error` keys. Calls with errors also contain `message` keys.

```
{
    "error": true,
    "message": "..."
}
```

### create queue
**POST** to `/queue`

Data:
```JSON
{
    "name": "queue_name",
    "token": "random_string"
}
```

Response:
```JSON
{
  "error": false,
  "queue": "58317530def0ec26c8f5e97a",
  "message": "Queue successfully created"
}
```

### get current queue state
**GET** from `/queue/:id`

```JSON
{
  "error": false,
  "_id": "58317530def0ec26c8f5e97a",
  "participants": [
    "58317557def0ec26c8f5e97b",
    "583175b7def0ec26c8f5e97c",
    "583175b8def0ec26c8f5e97d",
    "583175b8def0ec26c8f5e97e"
  ]
}
```

## update current queue participant
**POST** to `/queue/:id`

Data:
```JSON
{
    "token": "random_string"
}
```

Response:
```JSON
{
  "error": false,
  "_id": "58317530def0ec26c8f5e97a",
  "current": "58317557def0ec26c8f5e97b"
}
```

### participate in queue
**GET** to `/queue/participate/:id`

```JSON
{
  "error": false,
  "_id": "58317557def0ec26c8f5e97b",
  "token": "e3i4vch8vocvoyldi",
  "queueId": "58317530def0ec26c8f5e97a"
}
```

### leave queue
**POST** to `/queue/unparticipate/:id`

Data:
```JSON
{
    "token": "random_string"
}
```

Response:
```JSON
{
  "error": false,
  "message": "..."
}
```
