"use strict"
var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment');

exports.average = (request, response, next) => {
  let interval = Number(request.query.interval) || 60;
  request.query.dateFrom = new Date(request.query.dateFrom).toISOString();
  request.query.dateTo = new Date(request.query.dateTo).toISOString();
  let query = {
    sensorId: request.params.sensor_id,
    sentAt: {$gte: request.query.dateFrom, $lte: request.query.dateTo}
  };
  let structure = structureData(request.query.dateFrom, request.query.dateTo, interval, {count: 0, cant: 0, enter: 0, exit: 0});
  let stream = SensorData.find(query).select("sentAt enter exit count -_id").sort({sentAt: 1}).lean().stream();
  stream.on('data', data => {
    let key = findKeyofStructure(structure, data.sentAt);
    structure[key].count += data.count;
    structure[key].sentAt = data.sentAt.toString();
    structure[key].cant ++;
    structure[key].enter += Number(data.enter);
    structure[key].exit += Number(data.exit);
  });
  stream.on('end', () => {
    let resp = []
    let metadata = {enter: 0, exit: 0}
    for(var i in structure) {
      metadata.enter += structure[i].enter;
      metadata.exit += structure[i].exit;
      structure[i].date = moment(Number(i)).add(interval / 2, "minutes")._d.toString();
      structure[i].average = Number((structure[i].count / structure[i].cant).toFixed(1)) || 0;
      resp.push(structure[i]);
    }
    response.send({data: resp, metadata: metadata});
  });
  stream.on('error', (error) => {
    response.send(500, error);
  });
};

exports.create = (io) => {
  return (request, response, next) => {
    if(request.body.sentAt) delete request.body.sentAt;
    var enter = request.body.enter;
    var exit = request.body.exit;
    request.body.enter = exit;
    request.body.exit = enter;
    var sensorData = new SensorData(request.body);
    sensorData.sensorId = request.params.sensor_id;
    if(sensorData.validateSync()) {
      error.status = 400;
      return next(error);
    }
    //Find last sensorData count;
    SensorData.findOneAndUpdate({sensorId: request.params.sensor_id, read: false, sentAt: {$lte: sensorData.sentAt}}, {$set: {read: true}}, {sort: {sentAt: 1}}, (error, oldSensor) => {
      if(error) return next(error);
      let sum = sensorData.enter - sensorData.exit;
      oldSensor = oldSensor || {count: 0};
      sensorData.count = (oldSensor.count + sum < 0 ) ? 0 : (oldSensor.count + sum);
      sensorData.save((error, data) => {
        if (error) return next(error);
        response.send(sensorData);
        io.emit(request.sensor._id.toString(), sensorData);
      });
    });
  }
}

exports.sensorMiddleware = (request, response, next) => {
  var sensorId = request.device.sensors.find((sensorId) => {
    return sensorId == request.params.sensor_id;
  });
  Sensor.findById(sensorId, (error, sensor) => {
    if(error) return next(error);
    if(!sensor) {
      let err = new Error();
      err.message = "No se encontro el sensor con ese id"; 
      err.status = 404;
      return next(err);
    }
    request.sensor = sensor;
    next();
  });
};

exports.count = (request, response, next) => {
  request.query.dateFrom = new Date(request.query.dateFrom).toISOString();
  request.query.dateTo = new Date(request.query.dateTo).toISOString();
  let query = {
    sensorId: request.params.sensor_id,
    sentAt: {$gte: request.query.dateFrom, $lte: request.query.dateTo}
  }
  SensorData.find(query).select("sentAt enter exit count -_id").sort({sentAt: 1}).lean().exec((error, sensorData) => {
    if(error) return next(error);
    response.send(sensorData);
  });
}

var structureData = (from, to, interval, objectStructure) => {
  let fromDate = moment(from).startOf('day').toDate().getTime();
  let iterator = fromDate;
  let toDate = moment(to) > moment() ? moment().startOf('hour').toDate().getTime() : moment(to).startOf('hour').toDate().getTime();
  let response = {};
  while(iterator <= toDate) {
    response[iterator] = Object.assign({}, objectStructure);
    iterator = moment(iterator).add(interval, 'minutes').toDate().getTime();
  }
  return response;
}

var findKeyofStructure = (structure, sentAt) => {
  sentAt = moment(sentAt).toDate().getTime();
  let j;
  for(var i in structure) {
    if(sentAt <= i) {
      return j;
    }
    j = i;
  }
  return i;
}