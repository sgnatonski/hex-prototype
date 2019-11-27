var cote = require('cote');
var storage = require('../storage/arango/arango_storage');
var aql = require("arangojs").aql;
var timeago = require("timeago.js");

var openBattles = [];

var lastFetch = new Date().setMinutes(-5);

var responder = new cote.Responder({
    name: 'battle tracker responder',
    namespace: 'battle_tracker',
    respondsTo: ['getOpen', 'addOpen', 'updateOpen']
});

responder.on('*', console.log);

responder.on('getOpen', async () => {
    if (lastFetch >= new Date().setMinutes(-5)) {
        return openBattles;
    }

    try {
        const cursor = await storage.query(aql`
        FOR b IN battles
        FILTER !HAS(b, "winningArmy") AND DATE_DIFF(b.created, DATE_NOW(), 'i') < 60
        AND (CONCAT('_', ATTRIBUTES(b.armies)[0]) != ATTRIBUTES(b.armies)[1])
        RETURN { 
            id: b._key, 
            players: [ b.armies[ATTRIBUTES(b.armies)[0]].name, b.armies[ATTRIBUTES(b.armies)[1]].name ],
            created: b.created 
        }
        `);
        openBattles = await cursor.all();
    } catch (error) {
        throw Error(error.message);
    }

    lastFetch = new Date();
    return openBattles.map(x => {
        return {
            id: x.id,
            name: x.players.filter(p => p !== null).join(' vs '),
            players: x.players.filter(p => p !== null).length,
            created: timeago().format(x.created)
        }
    });
});

responder.on('addOpen', async req => {
    openBattles.push({ id: req.battleId, players: [req.player] });
});

responder.on('updateOpen', async req => {
    var b = openBattles.find(x => x.id === req.battleId);
    b.players.push(req.player);
});