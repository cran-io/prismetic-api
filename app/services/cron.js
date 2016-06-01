'use strict';

var Sensor   = require('../models/sensor');
var SensorData = require('../models/sensorData');
var PermanenceTime = require('../models/permanenceTime');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment')

exports.run = () => {
  Sensor.find({}, (error, sensors) => {
    if(error) return console.log("[ERROR] Run cron", error);
    sensors.forEach(sensor => _sensorMetric(sensor));
  })
}

var _sensorMetric = (sensor) => {
  // let date = moment().subtract(1, 'days');
  let date = moment();
  let start = date.startOf('day').toISOString();
  let end = date.endOf('day').toISOString();
  SensorData.find({sensorId: ObjectId(sensor._id), sentAt: {$gte: start, $lte: end}}, {}, {sort: {sentAt: 1}}, (error, sensorDatas) => {
    if(error) return console.log("[ERROR] Sensor Metric", error);
    console.log("Process Sensor Data for sensor id: ", sensor._id);
    let data = _processSensorData(sensorDatas, sensor._id);
    let permanenceTime = new PermanenceTime(data);
    permanenceTime.createdAt = date;
    permanenceTime.save((error, permanenceTime) => {
      if(error) return console.log("[ERROR] Sensor Metric permanenceTime", error);
      console.log("[Sensor Metric][OK]", permanenceTime);
    });
  });
};

//T = ( (Pnow*Tnow) + (Exits*Texits) - (Enters*Tenters) ) / (Penters);
var _processSensorData = (sensorDatas, sensorId) => {
  if(sensorDatas.length) {
    let structure = {exits: 0, enters: 0, pEnters: 0};
    let now = sensorDatas[sensorDatas.length - 1];
    let struct = sensorDatas.reduce((struct, sensorData) => {
      struct.exits += (Number(sensorData.exit) * new Date(sensorData.sentAt).getTime());
      struct.enters += (Number(sensorData.enter) * new Date(sensorData.sentAt).getTime());
      struct.pEnters += Number(sensorData.enter);
      return struct;
    }, structure);
    console.log("Struct post reduce: ", struct);
    console.log("Ultimo dato: ", now);
    let average = ((now.count * new Date(moment()).getTime()) + struct.exits - struct.enters) / struct.pEnters;
    return {average, sensorId};
  } else {
    return {average: 0, sensorId};
  }
}