var Service, Characteristic
module.exports = function (homebridge) {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    homebridge.registerAccessory('switch-plugin', 'MyAwesomeSwitch', mySwitch)
}

const request = require('request')
const url = require('url')

function mySwitch(log, config) {
    this.log = log
    this.getUrl = url.parse(config['getUrl'])
    this.postUrl = url.parse(config['postUrl'])
}

mySwitch.prototype = {

    getSwitchOnCharacteristic: function (next) {
        const me = this
        request({
            url: me.getUrl,
            method: 'GET',
        },
        function (error, response, body) {
            if (error) {
                if (response) {
                    me.log('STATUS: ' + response)
                    me.log(error)
                    return next(error)
                }
            }
            var parsedObj = JSON.parse(body)
            return next(null, parsedObj.currentState)
        })
    },

    setSwitchOnCharacteristic: function (on, next) {
        const me = this
        request({
            url: me.postUrl,
            body: JSON.stringify({
                'targetState': on
            }),
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            }
        },
        function (error, response) {
            if (error) {
                if (response) {
                    me.log('STATUS: ' + response)
                    me.log(error)
                    return next(error)
                }
            }
            return next()
        })
    },

    getServices: function () {
        let informationService = new Service.AccessoryInformation()
        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'My switch manufacturer')
            .setCharacteristic(Characteristic.Model, 'My switch model')
            .setCharacteristic(Characteristic.SerialNumber, '123-456-789')

        let switchService = new Service.Switch('My switch')
        switchService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getSwitchOnCharacteristic.bind(this))
            .on('set', this.setSwitchOnCharacteristic.bind(this))

        this.informationService = informationService
        this.switchService = switchService
        return [informationService, switchService]
    }
}
