$ = document.querySelector.bind(document);
let chain = null;
let bone = null;
let start = false;

function setup() {
  createCanvas(1100, 700);
  background(111);
}

class Bone {
    constructor(x, y, angle, length, color, weight, child) {
      this.x = x;
      this.y = y;
      this.length = length;
      this.angle = angle;
      this.child = child;
      this.target;
      this.color= color;
      this.weight = weight;
    }

    draw() {
      push();
      // Vedno bo prebarvalo isto tocko. vazn je kam se transliramo in od tam gledamo target - globalno pride v isto koordinato
      // Trenutni target
      stroke(0);
      fill(0);
      ellipse(this.target[0], this.target[1], 20, 20);
      //Trenutna pozicija 
      stroke(0);
      fill(255, 0, 0, 255*(this.weight));
      ellipse(this.x, this.y, 20,20);
      // Postavimo izhodisce scene v tocko
      translate(this.x,this.y);
      // Sceno zarotiramo
      rotate(this.angle);
      strokeWeight(1);
      stroke(this.color);
      // Po x osi potegnemo crto za dolzino kosti
      line(0,0,this.length,0);
      // Vzamemo naslednjega
      if(this.child){
        this.child.draw();
      }
      pop();
    }

    updateIK(target) {
      // pretvorimo v lokalno kordinatni sistem. postavimo v trenutno tocko in gledamo target kje je od te tocke
      const localTarget = rotatePoint(translatePoint(target, -this.x, -this.y), -this.angle);
      
      let endPoint;
      if (this.child) { // premikamo do konca
        endPoint = this.child.updateIK(localTarget);
      } else {
        // koncna tocka je na koncu te kosti - oddaljena za dolzino kosti
        endPoint = [this.length, 0];
      }
      
      // izracunamo kot proti koncni tocki, gledano iz trenutne tocke
      const shiftAngle = angle(localTarget) - angle(endPoint);
      this.angle += shiftAngle;
      // upostevamo se utez
      this.angle = this.angle - (this.weight*this.angle);
      
      // damo nazaj v globalni koordinatni sistem in vrnemo
      this.target = translatePoint(rotatePoint(endPoint, this.angle), this.x, this.y);
      return this.target;
    }
}

var limit = -1;
var colors =[];
var weights =[];
function createRows(){
  limit = document.getElementsByClassName("numberOfBones")[0].value;
  document.getElementsByClassName('bones')[0].innerHTML = "";
  colors=[];
  weights =[];
  for(var i = 1; i <= document.getElementsByClassName("numberOfBones")[0].value; i++){
    addBone(i);
  }
  createNewChain()
}

function addBone(id) {
    var bones = document.getElementsByClassName('bones')[0];
    var bone = document.createElement('div');
    bone.className = 'row';
    colors.push(getRandomColor());
    bone.innerHTML = "<input type='range' id='slider"+id+"' value=50 min=50 max=200 onchange='createNewChain()'><span id='label"+id+"' style='background-color:"+colors[id-1]+"'> </span>";
    bone.innerHTML +="<input type='range' id='slider_weight"+id+"' value=0.0 min=0.0 max=1.0 step=0.01 onchange='createNewChain()'><span id='label_weight"+id+"' style='background-color:"+colors[id-1]+"'> </span>";
    bones.appendChild(bone);
}

function createNewChain(){
  start = true;
  bone=null;
  for(var i = limit; i > 1; i--){
    var length_1 = parseInt($("input#slider"+i).value);
    $('span#label'+i).textContent = length_1.pad(3);
    var weight = parseFloat($("input#slider_weight"+i).value);
    $('span#label_weight'+i).textContent = weight.toFixed(2);
    var k = i-1;
    var length_2 = parseInt($("input#slider"+k).value);
    if(i==limit){
      bone=new Bone(length_2, 0,0, length_1, colors[i-1], weight);
    }
    else{
      bone=new Bone(length_2, 0,0, length_1, colors[i-1], weight, bone);
    }
  }
  var length_1 = parseInt($("input#slider"+1).value);
  $('span#label'+1).textContent = length_1.pad(3);
  var weight = parseFloat($("input#slider_weight"+i).value);
  $('span#label_weight'+i).textContent = weight.toFixed(2);
  bone=new Bone(550, 350, 0, length_1, colors[0], weight, bone);
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
  if(start){
    //koncamo po n iteracij, ali ce smo piko ze prestavili v tarco do neke natancnosti
    for (let i = 0; i < 500; i++) {
      chain.updateIK([mouseX, mouseY]);
      if( abs(chain.target[0] - mouseX) < 0.001 && abs(chain.target[1] - mouseY)<0.001){
        break;
      }
    }
    clear();
    background(111);
    chain.draw();
  }
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

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s =  "\xa0\xa0" + s;}
    return s;
}