"use strict"
var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment');

exports.index = (request, response) => {
  let interval = Number(request.query.interval) || 60;
  request.query.dateFrom = new Date(request.query.dateFrom).toISOString();
  request.query.dateTo = new Date(request.query.dateTo).toISOString();
  let query = {
    _id: {$in: request.sensor.sensorData},
    sentAt: {$gte: request.query.dateFrom, $lte: request.query.dateTo}
  }
  let structure = structureData(request.query.dateFrom, request.query.dateTo, interval);
  let stream = SensorData.find(query).select("sentAt enter exit count -_id").sort({sentAt: 1}).lean().stream();
  let flagData = false;
  stream.on('data', data => {
    flagData = true;
    let key = findKeyofStructure(structure, data.sentAt);
    let timestamp = moment(data.sentAt).startOf('hour').toDate().getTime();
    structure[key].count += data.count;
    structure[key].sentAt = data.sentAt.toString();
    structure[key].cant ++;
    structure[key].enter += Number(data.enter)
    structure[key].exit += Number(data.exit)
  });
  stream.on('end', () => {
    let resp = []
    let metadata = {enter: 0, exit: 0}
    for(var i in structure) {
      metadata.enter += structure[i].enter;
      metadata.exit += structure[i].exit;
      structure[i].date = moment(Number(i)).add(interval / 2, "minutes")._d.toString()
      structure[i].average = Number((structure[i].count / structure[i].cant).toFixed(1)) || 0
      resp.push(structure[i])
    }
    flagData ? response.send({data: resp, metadata: metadata}) : response.send([]);
  });
  stream.on('error', (error) => {
    response.send(500, error);
  });
};

exports.create = (io) => {
  return (request, response) => {
    var sensorData = new SensorData(request.body);
    if(sensorData.validateSync()) return response.send(400);
    //Find last sensorData count;
    SensorData.findOneAndUpdate({_id: {$in: request.sensor.sensorData}, read: false, sentAt: {$lte: sensorData.sentAt}}, {$set: {read: true}}, {sort: {sentAt: 1}}, (error, oldSensor) => {
      if(error) return response.send(500, error);
      let sum = sensorData.enter - sensorData.exit;
      oldSensor = oldSensor || {count: 0};
      sensorData.count = (oldSensor.count + sum < 0 ) ? 0 : (oldSensor.count + sum);
      sensorData.save((error, data) => {
        if (error) return response.send(500, error);
        request.sensor.sensorData.push(sensorData);
        request.sensor.save((error) => {
          if (error) return response.send(500, error);
          response.send(sensorData);
          io.emit(request.sensor._id.toString(), sensorData);
        });
      });
    });
  }
}

exports.sensorMiddleware = (request, response, next) => {
  var sensorId = request.device.sensors.find((sensorId) => {
    return sensorId == request.params.sensor_id;
  });
  Sensor.findById(sensorId, (error, sensor) => {
    if(error) return response.send(500, error);
    if(!sensor) return response.send(404, []);
    request.sensor = sensor;
    next();
  });
};

var structureData = (from, to, interval) => {
  let fromDate = moment(from).startOf('day').toDate().getTime();
  let iterator = fromDate;
  let toDate = moment(to) > moment() ? moment().startOf('hour').toDate().getTime() : moment(to).startOf('hour').toDate().getTime();
  let response = {};
  while(iterator <= toDate) {
    response[iterator] = {
      count: 0,
      cant: 0,
      enter: 0,
      exit: 0
    }
    iterator = moment(iterator).add(interval, 'minutes').toDate().getTime();
  }
  return response;
}

var findKeyofStructure = (structure, sentAt) => {
  sentAt = moment(sentAt).toDate().getTime()
  for(let i in structure) {
    if(sentAt <= i) {
      return i;
    }
  }
  return i;
}