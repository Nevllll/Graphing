//Creates the svg panel
const ns = "http://www.w3.org/2000/svg"
const panel = document.getElementById("panel");
const box = document.createElementNS(ns, 'rect');
box.classList.add("box");
panel.appendChild(box);
panel.addEventListener("click", drawLine);


//Array's to store all the edges and vertices on the canvas. Also a vertexID global to easily update ID of newly created vertices
let vertexID = 0;
let edges = [];
let vertices = [];


const djkistraBtn = document.getElementById("Dijkstra");
const Primbtn = document.getElementById("Prim")

djkistraBtn.addEventListener("click", dijkstra);
Primbtn.addEventListener("click",Prim);

//Function to run prim's algorithms which computes a minimum spanning tree
function Prim() {
  const startVert = vertices[0]; // initialize the starting vertex
  const visited = new Set([startVert]); // create a set of visited vertices, starting with the first vertex
  const mst = []; // initialize an empty array for the minimum spanning tree

  while (visited.size < vertices.length) { // while there are still unvisited vertices in the graph
    let minEdge = null; // initialize the minimum edge to null
    for (const vert of visited) { // loop through all visited vertices
      for (const adj of vert.adjacent) { // loop through all adjacent vertices to visited vertices
        if (!visited.has(adj)) { // if the adjacent vertex has not been visited
          const edge = edges.find(e => (e.start == vert && e.end == adj) || (e.start == adj && e.end == vert)); // find the edge connecting the visited and adjacent vertices
          if (!minEdge || edge.weight < minEdge.weight) { // if the edge has a smaller weight than the current minimum edge
            minEdge = edge; // update the minimum edge
          }
        }
      }
    }
    mst.push(minEdge); // add the minimum edge to the minimum spanning tree
    visited.add(minEdge.start); // mark the start vertex of the minimum edge as visited
    visited.add(minEdge.end); // mark the end vertex of the minimum edge as visited

    // highlight the selected edge
    const line = minEdge.line;
    if (line) {
      line.style.stroke = "blue";
      line.style.strokeWidth = "5px";
    }

    // highlight the selected vertices
    const startVertElement = document.getElementById(`vertex-${minEdge.start.id}`);
    const endVertElement = document.getElementById(`vertex-${minEdge.end.id}`);
    if (startVertElement) {
      startVertElement.style.fill = "blue";
      startVertElement.style.stroke = "blue";
    }
    if (endVertElement) {
      endVertElement.style.fill = "blue";
      endVertElement.style.stroke = "blue";
    }
  }
}
function getLowestVertex(dist, visited) {
  let min = Infinity;
  let minVertex = null;

  for (const vertex of vertices) {
    if (!visited.has(vertex) && dist[vertex.id] <= min) {
      min = dist[vertex.id];
      minVertex = vertex;
    }
  }

  return minVertex;
}
//Function to compute dijkstar's shortest path between two nodes
function dijkstra() {
  // Prompt user to enter start and end vertex IDs
  const startVertexId = parseInt(prompt("Enter the ID of the start vertex:"));
  const endVertexId = parseInt(prompt("Enter the ID of the end vertex:"));

  // Find the start and end vertices based on the user input
  const startVertex = vertices.find(vertex => vertex.id == startVertexId);
  const endVertex = vertices.find(vertex => vertex.id == endVertexId);

  // Initialize the distance and previous vertex arrays
  const dist = [];
  const prev = [];

  // Initialize the visited set
  const visited = new Set();

  // Set the distance of each vertex to infinity, and the previous vertex of each vertex to null
  for (const vertex of vertices) {
    dist[vertex.id] = Infinity;
    prev[vertex.id] = null;
  }

  // Set the distance of the start vertex to 0
  dist[startVertex.id] = 0;

  // Continue until all vertices have been visited
  while (visited.size < vertices.length) {
    // Find the vertex with the lowest distance that hasn't been visited
    const currentVertex = getLowestVertex(dist, visited);

    // Add the current vertex to the visited set
    visited.add(currentVertex);

    // Update the distances of the adjacent vertices if a shorter path is found
    for (const adjacentVertex of currentVertex.adjacent) {
      // Find the edge between the current vertex and the adjacent vertex
      const edge = edges.find(edge => (edge.start == currentVertex && edge.end == adjacentVertex) || (edge.start == adjacentVertex && edge.end == currentVertex));

      // Get the weight of the edge
      const weight = parseInt(edge.weight);

      // Calculate the alternative distance
      const altDist = dist[currentVertex.id] + weight;

      // Update the distance and previous vertex if the alternative distance is shorter
      if (altDist < dist[adjacentVertex.id]) {
        dist[adjacentVertex.id] = altDist;
        prev[adjacentVertex.id] = currentVertex;
      }
    }
  }

  // Construct the shortest path by tracing back from the end vertex to the start vertex using the previous vertex array
  let currentVertex = endVertex;
  const shortestPath = [currentVertex];
  const shortestPathEdgeIds = [];

  while (currentVertex != startVertex) {
    const prevVertex = prev[currentVertex.id];
    shortestPath.unshift(prevVertex);

    const edge = edges.find(edge => (edge.start == currentVertex && edge.end == prevVertex) || (edge.start == prevVertex && edge.end == currentVertex));
    shortestPathEdgeIds.push(edge.id);

    currentVertex = prevVertex;
  }

  // Print the shortest path to the console
  console.log("Shortest path:");
  console.log(shortestPath.map(vertex => vertex.toString()).join(" -> "));

  // Reset the style of all edges
  resetHighlightedEdges();

  // Highlight the edges in the shortest path
  highlightShortestPath(shortestPath);

  // Reset the style of all edges
  function resetHighlightedEdges() {
    for (const edge of edges) {
      const line = edge.line;
      line.style.stroke = "";
      line.style.strokeWidth = "";
    }
  }

  // Highlight the edges in the shortest path
  function highlightShortestPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i+1];
      const edge = edges.find(edge => (edge.start == start && edge.end == end) || (edge.start == end && edge.end == start));
      console.log("Edge:", edge);
      if (edge) { 
        const line = edge.line;
        line.style.stroke = "red";
        line.style.strokeWidth = "5px";
      }
    }
  }
}
  
//Vertex object: stores the position of the vertex, its ID, as well as an adjaceny list of neighboring vertices
function Vertex(x, y, id, adjacent) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.adjacent = adjacent;


  this.toString = function () {
    return "(" + x + ", " + y + "," + id + ")";
  }

}

//Edge Object: Stores the start and end of the edge as well as its weight
function Edge(start, end, weight) {
  this.start = start;
  this.end = end;
  this.weight = weight;

  this.getWeight = function () { 
    return weight;
  }
}

//Array to keep track of clicked circles to draw an edge between them
let selectedCircles = [];

//a function that stops newly created circle elements from being placed within 50 pixels of already existing circles
function isTooClose(x, y) {
  for (const circle of document.querySelectorAll('.dot')) {
    const cx = Number(circle.getAttribute("cx"));
    const cy = Number(circle.getAttribute("cy"));
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 50) {
      return true;
    }
  }
  return false;
}

//Function to add edges and vertices to the canvas represneted as lines and circles
function drawLine(event) {

  const rect = box.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (isTooClose(x, y)) {
    return;
  }

  //Returns if you try to place a circle element directly on top of another 
  const existingCircle = document.elementFromPoint(event.clientX, event.clientY);
  if (existingCircle && existingCircle.classList.contains('dot')) {
    return;
  }


  //Creates the SVG circle
  const circle = document.createElementNS(ns, "circle");
  circle.addEventListener("click", drawEdge);

  circle.setAttributeNS(null, "cx", x);
  circle.setAttributeNS(null, "cy", y);
  circle.setAttributeNS(null, "r", 15);
  circle.setAttributeNS(null,"id", `vertex_${vertexID}`);
  circle.classList.add("dot");


//Creates a new vertex with the same ID and location as the created circle
  const vert = new Vertex(x, y, vertexID++, []);
  vertices.push(vert);
  console.log(vert.toString());

//Creates a text eelement displaying the ID number of a vertex inside the circle element its represented by 
panel.appendChild(circle);
const ID = document.createElementNS(ns, "text");
ID.setAttribute("x", x);
ID.setAttribute("y", y);
ID.setAttributeNS(null, "font-size", "15px");
ID.setAttributeNS(null, "text-anchor", "middle");
ID.setAttributeNS(null, "font-weight", "bold");
ID.setAttributeNS(null, "fill", "red");
ID.textContent = vertexID-1;
panel.appendChild(ID);


//Function that draws edges between two vertices
  function drawEdge() {
    console.log("click");
    circle.classList.toggle("selected");
    if (circle.classList.contains("selected")) {
      selectedCircles.push(circle);
      if (selectedCircles.length == 2) {
        const circle1 = selectedCircles[0];
        const circle2 = selectedCircles[1];
        const weight = prompt("Enter edge weight:");
       
       //If inputted character is a number and not null, creates an edge weight of that size
        if (!isNaN(weight) && weight != null){
          const line = document.createElementNS(ns, "line");
  
          const vert1 = vertices.find(v => v.x == circle1.getAttribute("cx") && v.y == circle1.getAttribute("cy"));
          const vert2 = vertices.find(v => v.x == circle2.getAttribute("cx") && v.y == circle2.getAttribute("cy"));
  
          const edge = new Edge(vert1, vert2, weight);
  
          vert1.adjacent.push(vert2);
          vert2.adjacent.push(vert1);
  

          //Adds edge to the set and creates SVG line to connect to vertices
          edges.push(edge);
          line.setAttributeNS(null, "x1", circle1.getAttribute("cx"));
          line.setAttributeNS(null, "y1", circle1.getAttribute("cy"));
          line.setAttributeNS(null, "x2", circle2.getAttribute("cx"));
          line.setAttributeNS(null, "y2", circle2.getAttribute("cy"));
          line.setAttributeNS(null, "stroke", "black");
          line.setAttributeNS(null, "stroke-width", "2");
          edge.line = line;
          edges.push(edge);
          line.classList.add("line");
  

          //Creates a text element to display edge wieght on top of line element that represenst the corresponding egde
          const text = document.createElementNS(ns, "text");
          text.setAttributeNS(null, "x", (parseInt(circle1.getAttribute("cx")) + parseInt(circle2.getAttribute("cx"))) / 2);
          text.setAttributeNS(null, "y", (parseInt(circle1.getAttribute("cy")) + parseInt(circle2.getAttribute("cy"))) / 2);
          text.setAttributeNS(null, "font-size", "20px");
          text.setAttributeNS(null, "text-anchor", "top");
          text.setAttributeNS(null, "font-weight", "bold");
          text.setAttributeNS(null, "fill", "orange");
          text.textContent = weight;
  
          panel.insertBefore(line, circle1);
          panel.appendChild(text);
          circle1.classList.remove("selected");
          circle2.classList.remove("selected");
          circle1.setAttributeNS(null, "fill", "black");
          circle2.setAttributeNS(null, "fill", "black");
          selectedCircles = [];
        }
      }
    }
  }
}


