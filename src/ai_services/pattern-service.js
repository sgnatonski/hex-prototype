var cote = require('cote');
const brain = require('brain.js');
var storage = require('@internal/common/storage/arango/arango_storage');

function character(strings) {
    return strings
        .join('')
        .trim()
        .split('')
        .map(c => '#' === c ? 1 : 0);
}

function toTrainData(data) {
    var trainData = [];
    for (var key in data) {
        if (data.hasOwnProperty(key) && !key.startsWith("__")) {
            var output = {};
            output[key] = 1;
            trainData.push({ input: character(data[key]), output: output });
        }
    }
    return trainData;
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'prob': obj[prop],
                'cost': 1 - Math.ceil(obj[prop] * 100) / 100
            });
        }
    }
    arr.sort((a, b) => b.prob - a.prob);
    return arr;
}

var responder = new cote.Responder({
    name: 'pattern responder',
    namespace: 'pattern',
    respondsTo: ['getMatchingUnitPattern']
});

responder.on('*', console.log);

var armytypesNN = null;

responder.on('getMatchingUnitPattern', async req => {
    if (!armytypesNN){
        var model = await storage.models.get('armytypes');
        const net = new brain.NeuralNetwork();
        armytypesNN = net.fromJSON(model.model);
    }
    const prob = sortObject(armytypesNN.run(character(req.pattern)));
    return prob;
});

var subscriber = new cote.Subscriber({
    name: 'pattern subscriber',
    namespace: 'pattern',
    subscribesTo: ['train']
});

subscriber.on('*', console.log);

subscriber.on('train', async req => {
    if (req == 'armytypes') {
        const armytypesdata = require('./dl_data/armytypes.json');
        const net = new brain.NeuralNetwork({
            //activation: 'sigmoid',
            hiddenLayers: [14, 14]
        });
        
        net.train(toTrainData(armytypesdata), {
            errorThresh: 0.0005,
            iterations: 100000
        });
        
        var modelJSON = net.toJSON();
        storage.models.store({ id: 'armytypes', model: modelJSON });
        armytypesNN = null;
    }
});