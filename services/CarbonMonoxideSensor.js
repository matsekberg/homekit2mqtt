/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

/* TODO
 this.addOptionalCharacteristic(Characteristic.StatusActive);
 this.addOptionalCharacteristic(Characteristic.StatusFault);
 this.addOptionalCharacteristic(Characteristic.StatusTampered);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CarbonMonoxideSensor(acc, settings, subtype) {
        acc.addService(Service.CarbonMonoxideSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CarbonMonoxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonMonoxideDetected');
                const contact = mqttStatus[settings.topic.statusCarbonMonoxideDetected] === settings.payload.onCarbonMonoxideDetected ?
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name, 'CarbonMonoxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonMonoxideDetected, val => {
            const contact = val === settings.payload.onCarbonMonoxideDetected ?
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
            log.debug('> hap update', settings.name, 'CarbonMonoxideDetected', contact);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonMonoxideDetected, contact);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }
    };
};
