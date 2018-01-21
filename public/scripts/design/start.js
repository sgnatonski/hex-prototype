(function start (){
  var animator = new Animator();
  var battle = new Game.Battle();
  
  Promise.all([loadImages(), battle.load()]).then(r => {
    var grid = initGrid(battle, animator);
    setupStage(grid, animator, r[0]);    
  })
})();