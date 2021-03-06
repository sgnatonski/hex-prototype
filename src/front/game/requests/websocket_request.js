import { JL } from 'jsnlog';
import eventBus from "../../app/eventBus";
import fetch from "../fetch";

var ws = null;
var wsPort = WSPORT == 'undefined' ? window.location.port : WSPORT;

export function initWebSocket(){
    return new Promise((resolve, reject) => {
        var battleId = sessionStorage.getItem('battleid');
        if (!battleId || battleId == 'null'){
            fetch().post('/battle/start').then(data => {
                openWebSocket(data);
            });
        }
        else{
            openWebSocket(battleId); 
        }
        
        function openWebSocket(battleId){
            var wsProtocol = 'ws';
            if (window.location.protocol === "https:") {
                wsProtocol = 'wss';
            }
            ws = new WebSocket(`${wsProtocol}://${window.location.hostname}:${wsPort}?bid=${battleId}`);
            ws.onmessage =  (event) => {
                var data = JSON.parse(event.data);
                if (data.msg == 'data'){
                    resolve(data.data);
                }
                else if (data.msg == 'upd'){
                    eventBus.publish('update', data.data);
                }
                else if (data.msg == 'end'){
                    eventBus.publish('end', data.data);
                }
            };
            ws.onerror = (error) => {
                JL().error(error);
                reject(error);
            };
            window.addEventListener('beforeunload', () => ws.close());
        }
    });
}

export function requestMove(bid, uid, x, y){
    ws.send(JSON.stringify({
        cmd: 'move',
        uid: uid,
        x: x,
        y: y
    }));
}
export function requestTurn(bid, uid, x, y){
    ws.send(JSON.stringify({
        cmd: 'turn',
        uid: uid,
        x: x,
        y: y
    }));
}
export function requestAttack(bid, uid, x, y){
    ws.send(JSON.stringify({
        cmd: 'attack',
        uid: uid,
        x: x,
        y: y
    }));
}