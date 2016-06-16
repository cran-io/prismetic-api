'use strict';

var Device   = require('../models/device');
var SensorData = require('../models/sensorData');
var PermanenceTime = require('../models/permanenceTime');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment')

exports.run = () => {
  Device.find({}, (error, devices) => {
    if(error) return console.log("[ERROR] Run cron", error);
    devices.forEach(device => _sensorMetric(device));
  })
}

var _sensorMetric = (device) => {
  let date = moment();
  // let date = moment().subtract(1, 'days');
  let start = date.startOf('day').toISOString();
  let end = date.endOf('day').toISOString();
  SensorData.find({deviceId: ObjectId(device._id), sentAt: {$gte: start, $lte: end}}, {}, {sort: {sentAt: 1}}, (error, sensorDatas) => {
    if(error) return console.log("[ERROR] Sensor Metric", error);
    let data = _processSensorData(sensorDatas, device._id);
    let permanenceTime = new PermanenceTime(data);
    permanenceTime.createdAt = date;
    permanenceTime.save((error, permanenceTime) => {
      if(error) return console.log("[ERROR] Sensor Metric permanenceTime", error);
      console.log("[Sensor Metric][OK]", JSON.stringify(permanenceTime));
    });
  });
};

//T = ( (Pnow*Tnow) + (Exits*Texits) - (Enters*Tenters) ) / (Penters);
var _processSensorData = (sensorDatas, deviceId) => {
  if(sensorDatas.length) {
    let structure = {exits: 0, enters: 0, pEnters: 0};
    let now = sensorDatas[sensorDatas.length - 1];
    let struct = sensorDatas.reduce((struct, sensorData) => {
      struct.exits += (Number(sensorData.exit) * new Date(sensorData.sentAt).getTime());
      struct.enters += (Number(sensorData.enter) * new Date(sensorData.sentAt).getTime());
      struct.pEnters += Number(sensorData.enter);
      return struct;
    }, structure);
    let average = ((Number(now.count) * new Date(moment()).getTime()) + struct.exits - struct.enters) / struct.pEnters;
    console.log("[Sensor Metric][Process]", now, struct, average);
    return {average, deviceId};
  } else {
    return {average: 0, deviceId};
  }
}