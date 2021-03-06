'use strict';

const fetch = require('node-fetch');
const xml2js = require("xml2js");

class Util {

  constructor(opts) {
    this.homey = opts.homey;
  }

  sendCommand(command, address, port) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/'+ command, {
          method: 'GET',
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          var parser = new xml2js.Parser();
          parser.parseStringPromise(body)
            .then(result => {
              return resolve(result);
            })
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getBluesound(address, port) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/Status', {
          method: 'GET',
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          var parser = new xml2js.Parser();
          parser.parseStringPromise(body)
            .then(result => {
              if (result.status.hasOwnProperty("artist")) {
                var artist = result.status.artist[0];
              } else {
                var artist = this.homey.__('util.not_available');
              }
              if (result.status.hasOwnProperty("album")) {
                var album = result.status.album[0];
              } else {
                var album = this.homey.__('util.not_available');
              }
              if (result.status.hasOwnProperty("title1")) {
                var title1 = result.status.title1[0];
              } else {
                var title1 = this.homey.__('util.not_available');
              }
              if (result.status.hasOwnProperty("title2")) {
                var title2 = result.status.title2[0];
              } else {
                var title2 = this.homey.__('util.not_available');
              }
              if (result.status.hasOwnProperty("name")) {
                var track = result.status.name[0];
              } else if (title2 !== artist && result.status.service[0] !== 'LocalMusic') {
                var track = title2;
              } else if (title2 == artist) {
                var track = title1;
              } else {
                var track = this.homey.__('util.not_available');
              }

              var data = {
                state: result.status.state,
                service: result.status.service[0],
                volume: Number(result.status.volume),
                shuffle: Number(result.status.shuffle),
                repeat: Number(result.status.repeat),
                artist: artist,
                track: track,
                album: album
              }
              return resolve(data);
            })
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getInputs(address, port) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/RadioBrowse?service=Capture', {
          method: 'GET',
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          var parser = new xml2js.Parser();
          parser.parseStringPromise(body)
            .then(result => {
              var items = result.radiotime.item;
              var list = [];
              if (items.length > 0) {
                items.forEach(function(item) {
                  list.push({
                    icon: '/app/com.bluesound/assets/icon.svg',
                    name: item.$.text,
                    url: item.$.URL,
                    inputimage: item.$.image
                  })
                });
              }
              return resolve(list);
            })
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getServices(address, port) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/Services', {
          method: 'GET',
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          var parser = new xml2js.Parser();
          parser.parseStringPromise(body)
            .then(result => {
              var services = result.services.service;
              var list = [];
              if (services.length > 0) {
                services.forEach(function(service) {
                  if (service.$.type === 'RadioService' || service.$.type === 'LocalMedia' || service.$.type === 'CloudService') {
                    list.push({
                      icon: '/app/com.bluesound/assets/icon.svg',
                      name: service.$.name,
                      inputimage: service.$.icon
                    })
                  }
                });
              }
              return resolve(list);
            })
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getInput(address, port) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/Status', {
          method: 'GET',
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          var parser = new xml2js.Parser();
          parser.parseStringPromise(body)
            .then(result => {
              if (result.status.hasOwnProperty("service")) {
                var input = "BluOS";
              } else {
                var input = result.status.title2[0];
              }
              return resolve(input);
            })
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  checkStatus = (res) => {
    if (res.ok) {
      return res;
    } else {
      throw new Error(res.status);
    }
  }

}

module.exports = Util;
