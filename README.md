Dex Server
============

[![Build Status](https://circleci.com/gh/cran-io/dex_server.svg?style=shield&circle-token=2c1bc072793379fc5d5ef9adfc4d4fca9fd36b39)](https://circleci.com/gh/cran-io/dex_server)

# Mongoose Models #

Note: all models have the following properties:
* id
* created_at
* updated_at

## User ##
```js
{
  name: String,
  lastName: String,
  mail: String,
  password: String
}
```

## Account ##
```js
{
  name: String,
  address: String,
  users: [ids],
  devices: [ids]
}
```

## Devices ##
```js
{
  model: String,
  active: Boolean,
  sensors: [ids]
}
```

### Sensors ###

```js
{
  active: Boolean,
  name: String,
  sensorsData: [Ids]
}
```

### SensorsData ###

```js
{
  state: String,
  sentAt: Date
}
```


# --- Routes --- #


## Account ##

### POST /accounts
Creates a new account.

```js
Params: {
  name: String,
  address: String
}
```

## Users ##

### POST /accounts/:accountId/users
Creates a new user for an account.

```js
Params: {
  mail: String,
  password: String,
  name: String,
  lastName: String
}
```

## Device ##

### POST /devices
Creates a new user for an account.

```js
Params: {
  model: String,
  active: Boolean,
  accountId: String (el ID del account padre)
}
```

## Sensor ##

### POST /devices/:device_id/sensors
Creates a new user for an account.

```js
Params: {
  name: String,
  active: Boolean
}
```

## Sensor Data ##

### POST /devices/:device_id/sensors/sensor_id/sensors_data
Creates a new user for an account.

```js
Params: {
  state: String (Entro o Salio),
  sentAt: Date
}
```
