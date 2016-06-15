'use strict';
var Device   = require('../models/device');
var Account   = require('../models/account');
var SensorData = require('../models/sensorData');
var moment = require ('moment');


//API Requests.
exports.create = (request, response, next) => {
  var device = new Device();
  device.model = request.body.model;
  device.active = request.body.active;
  device.mac = request.body.mac;
  device.save((error, device) => {
    if (error) return next(error);
    request.account.devices.push(device);
    request.account.save((error, account) => {
      if(error) return next(error);
      response.json(device);
    });
  });
};

exports.index = (request, response, next) => {
  Device.find({_id: {$in: request.deviceIds}}, (error, devices) => {
    if(error) return next(error);
    response.send(devices);
  });
};

exports.update = (request, response, next) => {
  let fields = new Set(["model", "address"]);
  for(let key in request.body) {
    if(fields.has(key)) request.device[key] = request.body[key];
  }
  request.device.save((error, device) => {
    if(error) return next(error);
    response.json(device);
  });
}

//Graphs of sensor data.
exports.graphSensorData = (request, response, next) => {
  let interval = Number(request.query.interval) || 60;
  request.query.dateFrom = new Date(request.query.dateFrom).toISOString();
  request.query.dateTo = new Date(request.query.dateTo).toISOString();
  let query = {
    sensorId: {$in: request.query.sensors || []},
    sentAt: {$gte: request.query.dateFrom, $lte: request.query.dateTo}
  };
  // let structure = _structureData(request.query.dateFrom, request.query.dateTo, interval, {count: 0, cant: 0, enter: 0, exit: 0});
  let stream = SensorData.find(query).select("sentAt enter exit count -_id").sort({sentAt: 1}).lean().stream();
  let metadata = {enter: 0, exit: 0}
  let count = [];
  //Group data in structure.
  stream.on('data', data => {
    count.push(data);
    // let key = _findKeyofStructure(structure, data.sentAt);
    // structure[key].count += data.count;
    // structure[key].sentAt = data.sentAt.toString();
    // structure[key].cant ++;
    // structure[key].enter += Number(data.enter);
    // structure[key].exit += Number(data.exit);
  });
  //Process data.
  stream.on('end', () => {
    let resp = _processCount(count, metadata);
    // let data = _processAverage(structure, interval);
    // let average = data.average;
    // let metadata = data.metadata;
    response.send({data: {count: resp.data}, metadata: resp.metadata});
  });
  //Error data
  stream.on('error', (error) => {
    return next(error);
  });
};

//===== MIDDLEWARES =====


//Verify that the user belongs to a valid account and save that devices ids to req.devicesIds. Not POST.
exports.verifyAccountUser = (request, response, next) => {
  if(request.method === "POST") return next();
  Account.findOne({users: request.user._id}, (error, account) => {
    if(error) return _newError(error, 500, next);
    request.deviceIds = account.devices || [];
    next();
  });
};

//Check if the :device_id belongs to User. Not POST.
exports.verifyDeviceUser = (request, response, next) => {
  if(request.method === "POST") return next();
  if(!!request.deviceIds.find(deviceId => deviceId == request.params.device_id))
    return next();
  else
    return _newError("No tienes permisos para ver el device", 401, next);
}

//Get device and save it on request
exports.deviceMiddleware = (request, response, next) => {
  Device.findById(request.params.device_id, (error, device) => {
    if(error) return next(error);
    if(!device) return _newError("No se encontro el device con ese id", 404, next);
    request.device = device;
    next();
  });
};

//Find device by mac before create, if exists return the old one.
exports.findDeviceMac = (request, response, next) => {
  Device.findOne({mac: request.body.mac}, (error, device) => {
    if(error) return _newError(error, 500, next);
    if(!device) return next();
    return response.send(device);
  });
};

//Find account and save it to request.
exports.findAccount = (request, response, next) => {
  if(!request.body.account) return _newError("Falta el campo: Account", 400, next);
  Account.findById(request.body.account, (error, account) => {
    if(error) return _newError(error, 500, next);
    if(!account) return _newError("No se encontro un Account con ese id", 400, next);
    request.account = account;
    next();
  });  
}

//===== Private functions =====.

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

// Add allways de sensorData previous and put the new sentAt date for graph.
var _processCount = (countStructure, metadata) => {
  var first = true;
  let previousData;
  let data = countStructure.reduce((newStructure, sensorData) => {
    metadata.enter += Number(sensorData.enter);
    metadata.exit += Number(sensorData.exit);
    if(!first) {
      previousData.sentAt = moment(sensorData.sentAt).subtract(1, 'ms')._d;
      newStructure.push(previousData);
    }
    first = false;
    previousData = Object.assign({}, sensorData);
    newStructure.push(sensorData);
    return newStructure;
  }, []);
  return {data: data, metadata: metadata} 
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

let _newError = (message, status, next) => {
  let err = new Error();
  err.message = message;
  err.status = status;
  return next(err);
}