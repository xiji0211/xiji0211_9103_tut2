let radii;//Define an array and use it to store the radii of concentric circles
let colorsList = []; // Define a two-dimensional array and use it to store the colours at each position
let hexagonSize;
let song;
let fft; // Add FFT objects for the audio portion of my individual part
let originalRadii;
let rotationAngle = 0; // Define the angle variable for adding rotation animation
let heart; // Define a heart variable
let particles = []; // Define an array to store Particle objects
let numParticles = 150; // Define the number of particles

// Load sound
function preload() {
  song = loadSound("audio/Under_the_Stars.mp3");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight); // Create a canvas that fills the window
  canvas.style('display', 'block');// Set the display of the canvas to 'block' to avoid layout confusion of the graphics
  
  // Initialize grid width, height and size of hexagons
  gridWidth = windowWidth;
  gridHeight = windowHeight;
  hexagonSize = windowWidth/5;
  // Set background color to white
  background(255);
  // Set angle mode to degrees
  angleMode(DEGREES);

  // Initialize a set of redii for concentric circles
  radii = [hexagonSize * 0.4, hexagonSize * 0.25, hexagonSize * 0.1];
  
  // Initialize originalRadii for resizing
  originalRadii = [...radii];
  
  // Initialize FFT object
  fft = new p5.FFT();
  song.connect(fft);

  // Add a button for playing or pausing the music
  let button = createButton('Play/Pause music');
  button.position(590, 4);
  button.mousePressed(togglePlay);
  
  // Create a heart object
  heart = new Heart();

  // Create particles and add them to array
  for (let i = 0; i < numParticles; i++) {
    let x = random(width); // Set the random position for particles
    let y = random(height); 
    particles.push(new Particle(x, y));
  }
}

// Adjust the size of the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  // Update concentric circle radius to fit the window
  for (let i = 0; i < radii.length; i++) {
    radii[i] = originalRadii[i] * (width / gridWidth);
  }
}

// Define a function to draw six white dots with orange and brown edges at the vertices of the hexagon
// Then draw the hexagonal honeycomb grid with twisted lines
function drawTwistedLine(cX, cY, r, row, col) {
  // Get the current position’s color list
  let colors = getColorsForPosition(row, col);
  // Set the first color of the list as the fill color
  fill(colors[0]);

  for (let a = 0; a < 360; a += 60) {
    // Calculate current vertice’s coordinates. 
    let x1 = cX + r * cos(a);
    let y1 = cY + r * sin(a);

    // Draw a white circle and a larger brown concentric circle at each vertex, then set the stroke to orange
    push();
    strokeWeight(3); // Set the strokeWeight to 3
    stroke(255, 100, 0); // Set the stroke color to orange
    fill(101, 67, 33); // Set the fill color to dark brown
    ellipse(x1, y1, r * 0.2, r * 0.2); // Draw dark brown concentric circles
    pop();

    push();
    noStroke();
    fill(255); // Set color to white
    ellipse(x1, y1, r * 0.1, r * 0.1); // Draw white dotted circles
    pop();

    // Draw a hexagonal honeycomb grid of twisted lines
    // Calculate the vertex coordinates of the immediately preceding vertex
    let x2 = cX + r * cos(a + 60);
    let y2 = cY + r * sin(a + 60);

    // Divide the line between the vertex of the hexagon and the immediately adjacent vertex into two segments, and draw two interlaced Bezier curves for each segment
    let segments = 2; 
    for (let i = 0; i < segments; i++) {
      // Calculate the starting point coordinates of each line segment
      let startX = lerp(x1, x2, i / segments);// The X coordinate of the starting point of the current segment
      let startY = lerp(y1, y2, i / segments);// The X coordinate of the starting point of the current segment

      // Calculate the end point coordinates of each line segment
      let endX = lerp(x1, x2, (i + 1) / segments);// X coordinate of the end point of the current segment
      let endY = lerp(y1, y2, (i + 1) / segments);// Y coordinate of the end point of the current segment

      // Calculate the midpoint coordinates of each line segment to determine the control points of the Bezier curve
      let midX = (startX + endX) / 2;
      let midY = (startY + endY) / 2;

      // Calculate the first control point of the Bezier curve
      let ControlPoint1x = midX + (startY - endY) * 0.3; // Control the X coordinate of point 1 and adjust 0.3 to change the distance of the control point
      let ControlPoint1y = midY + (endX - startX) * 0.3; // Control the Y coordinate of point 1 and adjust 0.3 to change the distance of the control point

      // Calculate the second control point of the Bezier curve
      let ControlPoint2x = midX - (startY - endY) * 0.3; // Control the X coordinate of point 2 and adjust 0.3 to change the distance of the control point
      let ControlPoint2y = midY - (endX - startX) * 0.3; // Control the Y coordinate of point 2 and adjust 0.3 to change the distance of the control point


      // Draw the first Bezier curve
      beginShape();
      vertex(startX, startY);// Define start points
      bezierVertex(ControlPoint1x, ControlPoint1y, ControlPoint2x, ControlPoint2y, endX, endY);
      //Define two control points and end points of another Bezier curve
      endShape();

      // Draw the second Bezier curve
      beginShape();
      vertex(startX, startY);// Define the start points
      bezierVertex(ControlPoint2x, ControlPoint2y, ControlPoint1x, ControlPoint1y, endX, endY);
      // Define two control points and end points of another Bezier curve,
      // The order of the control points of this curve is opposite to that of the previous curve to form a staggered line
      endShape();
    }
  }
}

// Define a function to draw concentric circles and dotted rings
function drawConcentricCirclesAndDots(cX, cY, radii, row, col) {
  // Get the color list of the current location
  let colors = getColorsForPosition(row, col);
  push();
  translate(cX, cY); // Move the coordinate origin to the center of concentric circles
  // Add the rotation animation
  rotate(rotationAngle);

  for (let i = 0; i < radii.length; i++) {
    fill(colors[i + 1]);
    ellipse(0, 0, radii[i] * 2, radii[i] * 2);
  }

  let r1 = (radii[0] + radii[1]) / 2 * 0.85;
  let r2 = r1 * 1.15;
  let r3 = r2 * 1.15;

  new DottedCircle(0, 0, r1, r1 * 0.1, colors[4]).draw();
  new DottedCircle(0, 0, r2, r1 * 0.12, colors[5]).draw();
  new DottedCircle(0, 0, r3, r1 * 0.13, colors[6]).draw();
  pop();
}

// Define a class to draw dotted circles on the concentric circles
class DottedCircle {
  constructor(cX, cY, r, dotRadius, color) {
    this.cX = cX;
    this.cY = cY;
    this.r = r;
    this.dotRadius = dotRadius;
    this.color = color;
  }

  draw() {
    push();
    stroke(this.color);

    //Take the center of the hexagon as the center of the ring, 
    //and draw a small dot every 15 degrees to form a ring
    for (let a = 0; a < 360; a += 15) {
      // Use trigonometric functions to calculate the coordinates of the current small circle
      let x = this.cX + this.r * cos(a);
      let y = this.cY + this.r * sin(a);
      ellipse(x, y, this.dotRadius, this.dotRadius);
    }
    pop();
  }
}

// Define a class to draw concentric circles and dotted rings
class ConcentricCirclesAndDots {
  constructor(cX, cY, radii, colors) {
    this.cX = cX;
    this.cY = cY;
    this.radii = radii;
    this.colors = colors; 
  }

  // Using the center of the hexagon as the center of the circle, 
  // draw three concentric circles and the small dots between the concentric circles
  draw() {
    push();

    // Loop through the three sets of data in the radius array
    // and draw concentric circles using the stored colours
    for (let i = 0; i < this.radii.length; i++) {
      fill(this.colors[i + 1]);
      ellipse(this.cX, this.cY, this.radii[i] * 2, this.radii[i] * 2);
    }

    // Calculate the radii of three rings formed by small dots
    let r1 = (this.radii[0] + this.radii[1]) / 2 * 0.85;
    let r2 = r1 * 1.15;
    let r3 = r2 * 1.15

    // Draw dotted rings
    new DottedCircle(this.cX, this.cY, r1, r1 * 0.1, this.colors[4]).draw();
    new DottedCircle(this.cX, this.cY, r2, r1 * 0.12, this.colors[5]).draw();
    new DottedCircle(this.cX, this.cY, r3, r1 * 0.13, this.colors[6]).draw();
    
    pop();
  }
}

// Fill wrapped lines, concentric circles, and dots with random colors
// Get the color based on the row and column position of the grid, if no color is stored, generate the color and store it
function getColorsForPosition(row, col) {
  // If the current row does not store colors, create a new empty list to store the colors
  if (!colorsList[row]) colorsList[row] = [];
  
  // If there is no color list at the current location, a set of colors is randomly generated and stored
  if (!colorsList[row][col]) {
    let colorsForThisSet = [];
    
    // Add color to wrapped thread
    colorsForThisSet.push(color(random(255), random(255), random(255)));

    // Add color to concentric circles
    for (let r of radii) {
      colorsForThisSet.push(color(random(255), random(255), random(255)));
    }

    // Add color to the small dots between concentric circles
    colorsForThisSet.push(color(random(255), random(255), random(255)));
    colorsForThisSet.push(color(random(255), random(255), random(255)));
    colorsForThisSet.push(color(random(255), random(255), random(255)));

    // Store randomly generated colors into a list
    colorsList[row][col] = colorsForThisSet;
  }

  // Return the color list for the current location
  return colorsList[row][col];
}

// Add more details based on grouo code
// Define a heart class 
class Heart {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = 30;
    this.color = color(255, 0, 0);
  }

  // Update the position and color of hearts
  update(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  // Draw hearts on the centers of concentric circles
  display() {
    push();
    fill(this.color);
    stroke(255); // Set the stroke color to white
    strokeWeight(2);

    // Using Bezier curves to draw hearts
    beginShape();
    vertex(this.x, this.y + this.size / 2);
    bezierVertex(this.x - this.size / 2, this.y - this.size / 3, this.x - this.size, this.y + this.size / 5, this.x, this.y + this.size);
    bezierVertex(this.x + this.size, this.y + this.size / 5, this.x + this.size / 2, this.y - this.size / 3, this.x, this.y + this.size / 2);
    endShape(CLOSE);
    
    pop();
  }
}

// Draw hearts
function drawHeart(x, y){
  let heart = new Heart();
  let heartColor = getColorFromCentroid(fft.analyze()); // Get color from the spectral centroid
  heart.update(x, y, heartColor); // Update the position and color of hearts
  heart.display(); 
}

// Get color from the spectral centroid
function getColorFromCentroid() {
  // Calculate the spectral centroid 
  let centroid = fft.getCentroid(0, 2000);

  // Map the spectral centroid value to the color of hearts
  let r = map(centroid, 0, 2000, 0, 255); // Only map the red color to realize a red heart
  let g = 0; 
  let b = 0; 

  return color(r, g, b);
}

// Add more details based on group code
// Add a particle class
class Particle {
  constructor(x, y) {
    this.position = createVector(x, y); 
    this.velocity = createVector(random(-1, 1), random(-1, 1)); // Random speed for particles
    this.color = color(random(255), random(255), random(255)); // Random color
    this.size = random(5, 20); 
  }

  update() {
    // Update the postion of particles 
    this.position.add(this.velocity);

    // If the particle exceeds the bounds of the canvas, place it back within the canvas
    if (this.position.x < 0 || this.position.x > width) {
      this.position.x = random(width);
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.position.y = random(height);
    }
  }

  // Draw elliptical particles
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  setSize(newSize) {
    this.size = newSize; // Update the size of particles for audio visualization
  }
}


function makeGrid() {
  let count = 0;// init counter
  
  // Adjust the starting position of the entire grid so that it fully displays on the canvas
  let offsetX = -width / 2;
  let offsetY = -height / 2;

  // Draw the base grid using a hexagonal honeycomb grid frame
  for (let y = offsetY *1.4, row = 0; y < gridHeight; y += hexagonSize / 2.3, row++) {
    for (let x = offsetX *1.2, col = 0; x < gridWidth; x += hexagonSize * 1.5, col++) {
      let hexCenterX = x + hexagonSize * (count % 2 == 0) * 0.75;
      let hexCenterY = y;
      
      // Call the drawTwistedLine function to draw twisted lines 
      drawTwistedLine(hexCenterX, hexCenterY, hexagonSize / 2, row, col);
      // Call drawConcentricCircles function to draw concentric circles and dotted rings
      drawConcentricCirclesAndDots(hexCenterX, hexCenterY, radii, row, col);
      // Draw heats at the center of concentric circles
      drawHeart(hexCenterX, hexCenterY - 15);
    }
    count++;// increment every row
  }
}

// Add a togglePlay function
function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function draw() {
  background(255); // Set canvas color to white
  
  // Request fresh data from the FFT analysis
  let spectrum = fft.analyze();

  // Audio amplitude visualization
  for (let i = 0; i < spectrum.length; i++) {
    let amplitude = spectrum[i];
    let x = map(i, 0, spectrum.length, 0, width); // Map X coordinates based on audio frequency range
    let h = map(amplitude, 0, 255, 0, height); // Map the height of a rectangle based on amplitude
    let w = width / spectrum.length * 2; // Calculate the width of a rectangle
    
    // Use the rectangle bars as a part of background that can change with the music
    noStroke(); 
    fill(0); 
    rect(x, height - h, w, h); // Draw black rectangles for audio amplitude visualization

    // Create symmetrical rectangle bars by inverting them diagonally
    // Rich background patterns
    let symmetricalX = width - x - w; // Calculate the X coordinate of the symmetry position
    rect(symmetricalX, 0, w, h); // Draw black rectangles for audio amplitude visualization
  }
    
  // Add particles to rich background patterns
  // Update and display the particles
  for (let particle of particles) {
    particle.update();
    particle.display();
  }
  
  translate(width / 2, height / 2); // Move the coordinate system to the center of the canvas
  //Add push() before rotate() to ensure that only the graphics are rotated
  push(); // Save current state
  rotate(15);// Rotate the entire canvas 15 degrees to fit the design of the original image
  stroke(255);// Set the stroke color to white
  noFill();
  
  // Extract the low frequency energy from the music
  let bassEnergy = fft.getEnergy("bass");
  // The radius of the concentric circles changes according to the low frequency energy
  for (let i = 0; i < radii.length; i++){
    // Give a maximum and minimum value to the radius of the concentric circles
    radii[i] = map(bassEnergy, 0, 255, originalRadii[i] * 0.75, originalRadii[i] * 1.05);
  } 

  // The radius of particles changes according to the low frequency energy from the music
  for (let particle of particles) {
    // Adjust the particle size based on the bass energy
    let newSize = map(bassEnergy, 0, 255, 10, 80); 
    particle.setSize(newSize);
  }  

  // Check if the song is playing
  // If it is playing, the concentric circles rotates
  if (song.isPlaying()) {
    // Give a rotation speed for concentric circles when the music is playing
    let rotationSpeed = 0.7;
    rotationAngle += rotationSpeed;
  }

  // Move makeGrid() to the back to ensure that the grid and other patterns can be displayed before the music plays
  makeGrid();
  pop(); 
}


//This code is debuged by ChatGPT