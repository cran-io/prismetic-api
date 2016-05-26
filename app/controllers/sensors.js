'use strict'
var Device  = require('../models/device');
var Sensor = require('../models/sensor');
var SensorData = require('../models/sensorData');
var moment = require('moment');

//Create sensor with device.
exports.create = (request, response, next) => {
  var sensor = new Sensor(request.body);
  sensor.save((error, sensor) => {
    if (error) return next(error);
    request.device.sensors.push(sensor);
    request.device.save((error) => {
      if (error) return next(error);
      response.json(sensor);
    });
  });
};

//Show sensors for a device.
exports.index = (request, response, next) => {
  request.device.populate('sensors', (error, device) => {
    if (error) return next(error);
    response.send(device.sensors);
  });
};

//Graphs of sensor data.
exports.graphSensorData = (request, response, next) => {
  let interval = Number(request.query.interval) || 60;
  request.query.dateFrom = new Date(request.query.dateFrom).toISOString();
  request.query.dateTo = new Date(request.query.dateTo).toISOString();
  let query = {
    sensorId: {$in: request.query.sensors || []},
    sentAt: {$gte: request.query.dateFrom, $lte: request.query.dateTo}
  };
  let structure = _structureData(request.query.dateFrom, request.query.dateTo, interval, {count: 0, cant: 0, enter: 0, exit: 0});
  let stream = SensorData.find(query).select("sentAt enter exit count -_id").sort({sentAt: 1}).lean().stream();
  let metadata = {enter: 0, exit: 0}
  let count = [];
  //Group data in structure.
  stream.on('data', data => {
    count.push(data);
    let key = _findKeyofStructure(structure, data.sentAt);
    structure[key].count += data.count;
    structure[key].sentAt = data.sentAt.toString();
    structure[key].cant ++;
    structure[key].enter += Number(data.enter);
    structure[key].exit += Number(data.exit);
  });
  //Process data.
  stream.on('end', () => {
    // count = _processCount(count);
    let data = _processAverage(structure, interval);
    let average = data.average;
    let metadata = data.metadata;
    response.send({data: {average, count}, metadata: metadata});
  });
  //Error data
  stream.on('error', (error) => {
    return next(error);
  });
};


//MIDDLEWARES

//Get device and save it on request
exports.device = (request, response, next) => {
  Device.findById(request.params.device_id, (error, device) => {
    if(error) return next(error);
    if(!device) {
      let err = new Error();
      err.message = "No se encontro el device con ese id"; 
      err.status = 404;
      return next(err);
    }
    request.device = device;
    next();
  });
};

//Find sensor by mac before create, if exists return the old one.
exports.findSensorMac = (request, response, next) => {
  Sensor.findOne({mac: request.body.mac}, (error, sensor) => {
    if(error) return next(new Error());
    if(!sensor) return next();
    return response.send(sensor);
  });
};

//Private functions.
var _structureData = (from, to, interval, objectStructure) => {
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

var _findKeyofStructure = (structure, sentAt) => {
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

// var _processCount = (countStructure) => {
//   let first = true;
//   return countStructure.reduce((response, data) => {
//     if(!first) {
//       let count = response[response.length - 1].count;
//       let diff = data.enter - data.exit;
//       //TODO esta mal. Necesitaria el count global del device, no del sensor.
//       data.count = (count + diff > 0) ? (count + diff) : 0;
//     }
//     first = false;
//     response.push(data);
//     return response;
//   }, []);
// };

var _processAverage = (averageStructure, interval) => {
  averageStructure = averageStructure || [];
  let previous;
  let average = [];
  let metadata = {enter: 0, exit: 0};
  for(var i in averageStructure) {
    metadata.enter += averageStructure[i].enter;
    metadata.exit += averageStructure[i].exit;
    delete averageStructure[i].enter;
    delete averageStructure[i].exit;
    averageStructure[i].sentAt = moment(Number(i)).add(interval / 2, "minutes")._d.toString();
    averageStructure[i].average = Number((averageStructure[i].count / averageStructure[i].cant).toFixed(1)) || (previous ? averageStructure[previous].average : 0);
    average.push(averageStructure[i]);
    previous = i;
  }
  return {average, metadata}
}