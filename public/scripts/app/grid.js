function initGrid(battle, animator){ 
  function calculateSceneSize(terrain){
    var tx = terrain.map(x => x.x);
    var ty = terrain.map(x => x.y);
    var minX = Math.abs(Math.min(...tx));
    var maxX = Math.abs(Math.max(...tx));
    var minY = Math.abs(Math.min(...ty));
    var maxY = Math.abs(Math.max(...ty));
    var sceneSize = Math.max(...[minX, maxX, minY, maxY]);
    return sceneSize;
  } 

  function setSelectedHex (x, y) {
    var selectedHex = grid.selectedHex;  
    grid.selectedHex = null;
    if (x != undefined && y != undefined){
      var hex = grid.getHexAt(new BHex.Axial(x, y));
      if (hex !== selectedHex){
        grid.selectedHex = hex;   
      }
    }
  }

  function getPathInRange (sourceHex, targetHex, range, ignoreInertia) {
    var gridPath = grid.findPath(new BHex.Axial(sourceHex.x, sourceHex.y), new BHex.Axial(targetHex.x, targetHex.y), ignoreInertia);
    var terrain = battle.getTerrain();
    var path = gridPath.filter(h => terrain.find(t => t.x == h.x && t.y == h.y));
    var inRange = path.reduce((acc, curr) => {
      var accCost = acc.map(x => x.cost).reduce((a,b) => a + b, -sourceHex.cost);
      if (accCost + curr.cost <= range){
        acc.push(curr);
      }
      return acc;
    }, [sourceHex]);
    return inRange;
  }
  
  function hexSelected(hex) {
    return new Promise(function(resolve,reject){
      if (!grid.selectedHex){
        var unit = battle.nextUnit();
        var nextHex = grid.getHexAt(new BHex.Axial(unit.pos.x, unit.pos.y));
        setSelectedHex(nextHex.x, nextHex.y);
        resolve(nextHex);
        return;
      }
      
      var selectedHex = grid.selectedHex;
      
      function resolveAction(results){
        var movedUnit = results[0];
        var hex = grid.getHexAt(new BHex.Axial(movedUnit.pos.x, movedUnit.pos.y));
        selectedHex.blocked = false;
        hex.blocked = true;
        
        var nextUnit = battle.nextUnit();
        var nextHex = grid.getHexAt(new BHex.Axial(nextUnit.pos.x, nextUnit.pos.y));
        setSelectedHex(nextHex.x, nextHex.y);
        resolve(nextHex);
      }

      var unit = battle.getUnitAt(grid.selectedHex.x, grid.selectedHex.y);
      setSelectedHex();

      var unitState = battle.getUnitState(unit);
      switch(unitState){
        case 'moving': 
          var path = getPathInRange(selectedHex, hex, unit.mobility);
          if (path.length && path[path.length - 1].x == hex.x && path[path.length - 1].y){
            var movePromise = battle.unitMoving(unit, hex.x, hex.y);
            var animPromise = animator.getAnimation(unit.id, path);
            Promise.all([movePromise, animPromise]).then(resolveAction);
          }
          break;
        case 'attacking':
          var path = getPathInRange(selectedHex, hex, unit.range, true);
          if (path.length && path[path.length - 1].x == hex.x && path[path.length - 1].y){
            var movePromise = battle.unitAttacking(unit, hex.x, hex.y);
            Promise.all([movePromise]).then(resolveAction);
          }
          break;
        default:
          setSelectedHex(selectedHex.x, selectedHex.y);
          break;
      }
    });
  };

  function getSelectedHexRange() {
    var range = [];
    if (!grid.selectedHex){
      return range;
    }
    var unit = battle.getUnitAt(grid.selectedHex.x, grid.selectedHex.y);
    if (unit){
      var range = battle.getUnitState(unit) == 'moving'
        ? unit.mobility
        : unit.range;
      var ignoreInertia = getSelectedHexState() == 'attacking';
      var gridRange = grid.getRange(new BHex.Axial(grid.selectedHex.x, grid.selectedHex.y), range, ignoreInertia);
      var terrain = battle.getTerrain();
      range = gridRange.filter(h => terrain.find(t => t.x == h.x && t.y == h.y));
    }
    return range;
  };

  function getSelectedHexState(){
    return battle.getUnitState(grid.selectedHex ? battle.getUnitAt(grid.selectedHex.x, grid.selectedHex.y) : null);
  }

  function getPathFromSelectedHex(targetHex) {
    var unit = grid.selectedHex ? battle.getUnitAt(grid.selectedHex.x, grid.selectedHex.y) : null;
    if (!unit){
      return [];
    }
    var path = getPathInRange(grid.selectedHex, targetHex, unit.mobility);
    return path;
  };

  function initDrawing(center) {
    var sideWidth = 30;
    var options = new BHex.Drawing.Options(sideWidth, BHex.Drawing.Static.Orientation.PointyTop, new BHex.Drawing.Point(center.x, center.y));
    BHex.Drawing.Drawing(grid, options);  
  };

  function getHexes(){
    return battle.getTerrain().map(t => grid.hexes.find(h => t.x == h.x && t.y == h.y));
  };

  function getUnits(){
    return battle.getUnits();
  }

  var grid = new BHex.Grid(calculateSceneSize(battle.getTerrain()));

  battle.getUnits().forEach(unit => {
      var hex = grid.getHexAt(new BHex.Axial(unit.pos.x, unit.pos.y));
      hex.blocked = true;
  });

  battle.getTerrain().forEach(terrain => {
    grid.getHexAt(new BHex.Axial(terrain.x, terrain.y)).cost = terrain.cost;      
  });

  return {
    getHexes: getHexes,
    getHexAt: (x, y) => grid.getHexAt(new BHex.Axial(x, y)),
    getUnits: getUnits,
    hexSelected: hexSelected,
    getSelectedHexRange: getSelectedHexRange,
    getSelectedHexState: getSelectedHexState,
    getPathFromSelectedHex: getPathFromSelectedHex,
    initDrawing: initDrawing
  }
}