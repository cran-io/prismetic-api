Dex Server
============

[![Build Status](https://circleci.com/gh/cran-io/dex_server.svg?style=shield&circle-token=2c1bc072793379fc5d5ef9adfc4d4fca9fd36b39)](https://circleci.com/gh/cran-io/dex_server)

# Mongoose Models #

## User ##
```js
{
  _id: String,
  createdAt: Date,
  name: String,
  lastName: String,
  mail: String,
  password: String
}
```

## Account ##
```js
{
  _id: String,
  createdAt: Date,
  name: String,
  address: String,
  users: [String],
  devices: [String]
}
```

## Devices ##
```js
{
  _id: String,
  createdAt: Date,
  updatedAt: Date,
  model: String,
  active: Boolean,
  sensors: [String]
}
```

### Sensors ###

```js
{
  _id: String,
  createdAt: Date,
  active: Boolean,
  name: String,
  sensorsData: [String]
}
```

### SensorsData ###

```js
{
  _id: String,
  createdAt: Date,
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
Creates a new device for an account.

```js
Params: {
  model: String,
  active: Boolean,
  accountId: String (el ID del account al que pertenece)
}
```

## Sensor ##

### POST /devices/:device_id/sensors
Creates a new sensor for a device.

```js
Params: {
  name: String,
  active: Boolean
}
```

## Sensor Data ##

### POST /devices/:device_id/sensors/:sensor_id/sensors_data
Creates a new sensor data for a sensor.

```js
Params: {
  state: String (Entro o Salio),
  sentAt: Date
}
```

####Deploy:
Just run:
```
$ pm2 deploy ecosystem.json production
``` 