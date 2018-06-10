// Setting things up

let chain = null;
let bone = null;

function setup() {
  createCanvas(1200, 700);
  background(111);
}

class Bone {
    constructor(x,y,angle,length,color,child) {
      this.x = x;
      this.y = y;
      this.length = length;
      this.angle = angle;
      this.child = child;
      this.tp;
      this.color= color
    }

    draw() {
      stroke(0);
      fill(0);
      ellipse(this.tp[0],this.tp[1],20,20);
      push();
      fill(255);
      stroke(0);
      ellipse(this.x,this.y,20,20);
      translate(this.x,this.y);
      rotate(this.angle);
      strokeWeight(1);
      stroke(this.color);
      line(0,0,this.length,0);
      if(this.child){
        this.child.draw();
      }
      pop();
    }

    updateIK(target) {
      // convert from parent to local coordinates
      const localTarget = rotatePoint(translatePoint(target, -this.x, -this.y), -this.angle);
      
      let endPoint;
      if (this.child) {
        endPoint = this.child.updateIK(localTarget);
      } else {
        // base case:  the end point is the end of the current bone
        endPoint = [this.length, 0];
      }
      
      // point towards the endpoint
      const shiftAngle = angle(localTarget) - angle(endPoint);
      this.angle += shiftAngle;
      
      // convert back to parent coordinate space
      this.tp = translatePoint(rotatePoint(endPoint, this.angle), this.x, this.y);
      return translatePoint(rotatePoint(endPoint, this.angle), this.x, this.y);
    }
}

$ = document.querySelector.bind(document);

var limit = -1;
var colors =[];
var start = false;
function createRows(){
  limit = document.getElementsByClassName("numberOfBones")[0].value;
  document.getElementsByClassName('bones')[0].innerHTML = "";
  colors=[];
  for(var i = 1; i <= document.getElementsByClassName("numberOfBones")[0].value; i++){
    addBone(i);
  }
  myFunction()
}

function addBone(id) {
    var bones = document.getElementsByClassName('bones')[0];
    var bone = document.createElement('div');
    bone.className = 'row';
    colors.push(getRandomColor());
    bone.innerHTML = "<input type='range' id='slider"+id+"' value=50 min=50 max=200 onchange='myFunction()'><span id='label"+id+"' style='background-color:"+colors[id-1]+"'> </span>";
    bones.appendChild(bone);
}
function myFunction(){
  bone=null;
  for(var i = limit; i > 1; i--){
    var d1 = parseInt($("input#slider"+i).value);
    $('span#label'+i).textContent = d1;
    var k = i-1;
    var d2 = parseInt($("input#slider"+k).value);
    if(i==limit){
      bone=new Bone(d2, 0,0, d1, colors[i-1]);
    }
    else{
      bone=new Bone(d2, 0,0, d1,colors[i-1], bone);
    }
  }
  var d1 = parseInt($("input#slider"+1).value);
  $('span#label'+1).textContent = d1;
  bone=new Bone(600, 350, 0, d1, colors[0], bone);
  chain=bone;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function mouseMoved() {
  for (let i = 0; i < 5; i++) {
    chain.updateIK([mouseX, mouseY]);
  }
  clear();
  background(111);
  chain.draw();
}

function rotatePoint(point, angle) {
  const [x, y] = point;
  return [
    x*Math.cos(angle) - y*Math.sin(angle),
    x*Math.sin(angle) + y*Math.cos(angle)
  ];
}
function translatePoint(point, h, v) {
  const [x, y] = point;
  return [x+h, y+v];
}
function angle(point) {
  const [x, y] = point;
  return Math.atan2(y, x);
}
