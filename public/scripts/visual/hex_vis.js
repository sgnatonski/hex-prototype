var imageShapes;

function createTerrainVisual(hex, center, images){
    if (!imageShapes){
        function createShape(img){
            return new Konva.Image({
                image: img,
                width: 70,
                height:70,
                offset: {
                    x: 35,
                    y: 35
                },
                rotation: 30
              });
        };
        
        imageShapes = {
            plains: images.plains.map(createShape),
            forrests: images.forrests.map(createShape)
        };
    }
    
    function getHexTerrainImage(hex, center){
        var shape;
        if (hex.cost == 1){
            var gNumber = Math.floor(Math.random() * 6);
            shape = imageShapes.plains[gNumber].clone();
        }
        else{
            var gNumber = Math.floor(Math.random() * 2);
            shape = imageShapes.forrests[gNumber].clone();
        }

        shape.x(center.x + hex.center.x);
        shape.y(center.y + hex.center.y);
        return shape;
    }

    var group = new Konva.Group();
    
    var terrain = getHexTerrainImage(hex, center);

    group.add(terrain);
    group.add(createHexVisual(hex, center));
    
    return group;
}

function createHexVisual(hex, c){
    var center = c;
    function nextCoord(idx){
        return [center.x + hex.points[idx].x, center.y + hex.points[idx].y]
    }
  
    var hexShape = new Konva.Shape({
        sceneFunc: function(context) {
          context.beginPath();
          context.moveTo(...nextCoord(0));
          context.lineTo(...nextCoord(1));
          context.lineTo(...nextCoord(2));
          context.lineTo(...nextCoord(3));
          context.lineTo(...nextCoord(4));
          context.lineTo(...nextCoord(5));
          context.closePath();
  
          // Konva specific method
          context.fillStrokeShape(this);
        },
        //fill: '#2d862d',
        stroke: '#003300',
        strokeWidth: 0.7,
        strokeHitEnabled: false
    });

    return hexShape;
}

function createHexCoordVisual(hex, center){
    var simpleText = new Konva.Text({
        x: center.x + hex.center.x,
        y: center.y + hex.center.y,
        text: `${hex.x}, ${hex.y}`,
        fontSize: 10,
        fill: 'black',
        listening: false
    });
  
    simpleText.setOffset({
        x: simpleText.getWidth() / 2,
        y: simpleText.getHeight() / 2
    });
    return simpleText;
}