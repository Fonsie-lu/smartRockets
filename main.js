var lifespan = 400;
var lifeP;
var fitP;
var count = 0;
var target;
var maxforce = 0.2;

var rx = 250;
var ry = 350;
var rw = 300;
var rh = 10;

function setup() {
  createCanvas(800, 600);
  population = new Population();
  lifeP = createP();
  fitP = createP();
  target = createVector(width / 2, 50);
}

function draw() {
  background(0);
  ellipse(target.x, target.y, 16, 16);
  fill(255);
  rect(rx, ry, rw, rh);
  population.run();
  lifeP.html(count);
  count++;
  if (count === lifespan) {
    population.evaluate();
    fitP.html(this.population.matingPool.length / this.population.popSize);
    population.selection();
    count = 0;
  }
}

function Population() {
  this.rockets = [];
  this.popSize = 25;
  this.matingPool = [];

  for (let i = 0; i < this.popSize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function() {
    for (let i = 0; i < this.popSize; i++) {
      this.rockets[i].calcFitness();
    }
    var maxfit = 0;
    for (let i = 0; i < this.popSize; i++) {
      if (this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness;
      }
    }
    for (let i = 0; i < this.popSize; i++) {
      pow((this.rockets[i].fitness /= maxfit), 2);
    }

    this.matingPool = [];
    for (let i = 0; i < this.popSize; i++) {
      var n = this.rockets[i].fitness * 100;
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i].dna);
      }
    }
  };

  this.selection = function() {
    var newRockets = [];
    for (let i = 0; i < this.rockets.length; i++) {
      var parentA = random(this.matingPool);
      var parentB = random(this.matingPool);
      var child = parentA.crossover(parentB);
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  };

  this.run = function() {
    for (let i = 0; i < this.popSize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

function DNA(genes) {
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];
    for (let i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }

  this.crossover = function(partner) {
    var newgenes = [];
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) > 0.5) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  };

  this.mutation = function() {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.05) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  };
}

function Rocket(dna) {
  this.pos = createVector(width / 2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false;

  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.calcFitness = function() {
    let d = dist(this.pos.x, this.pos.y, target.x, target.y);
    d += lifespan - count;
    this.fitness = map(d, 0, width, width, 0);
    if (this.completed) {
      this.fitness *= 10;
    }
    if (this.crashed) {
      this.fitness /= 10;
    }
  };

  this.update = function() {
    let d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
      this.completed = true;
      this.pos = target.copy();
    }
    this.applyForce(this.dna.genes[count]);

    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
    if (
      this.pos.x > rx &&
      this.pos.x < rx + rw &&
      this.pos.y > ry &&
      this.pos.y < ry + rh
    ) {
      this.crashed = true;
    }
  };
  if (this.pos.x < 0 || this.pos.y > width || this.pos.y > height) {
    this.crashed = true;
  }

  this.show = function() {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };
}
