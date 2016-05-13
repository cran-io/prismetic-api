var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var ObjectId = (require('mongoose').Types.ObjectId);

exports.index = (request, response) => {
  console.log(request.device)
  request.device.sensors = request.device.sensors || [];
  var sensorId = request.device.sensors.find((sensorId) => {
    return sensorId == request.params.sensor_id;
  });
  if (sensorId) {
    Sensor.findById(request.params.sensor_id, (error, sensor) => {
      if (error) return response.send(500, error);
      sensor.populate('sensorData', (error, sensor) => {
        response.send(sensor.sensorData);
      });
    })
  } else {
    response.json({ message: 'No hay un sensor con ese ID en la device'});
  }
};

exports.create = (io) => {
  return (request, response) => {
    var sensorId = request.params.sensor_id;
    request.body = Array.isArray(request.body) ? request.body : [request.body];
    var sensorsData = request.body.reduce((resp, data) => {
      var sensorData = new SensorData();
      sensorData.sentAt = data.sentAt;
      sensorData.state = data.state;
      resp.push(sensorData);
      return resp;
    }, []);
    SensorData.create(sensorsData, (error, data) => {
      if (error) return response.send(error);
      var sensorIds = data.map(sensorData => sensorData._id);
      Sensor.findById(sensorId, (error, sensor) => {
        sensor.sensorData = sensor.sensorData.concat(sensorIds);
        sensor.save((error) => {
          if (error) return response.send(error);
          response.json({ message: 'Datos creados satisfactoriamente' });
          sensorsData.forEach((sensorData) => {
            io.emit(sensorId, { data: [sensorData.value, sensorData.sentAt]});
          });
        });
      });
    });
  };
};
