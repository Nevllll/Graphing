
const ns = "http://www.w3.org/2000/svg"
const panel = document.getElementById("panel");
const box = document.createElementNS(ns, 'rect');
box.classList.add("box");
panel.appendChild(box);
panel.addEventListener("click", drawLine);

let vertexID = 0;
let edges = [];
let vertices = [];


const djkistraBtn = document.getElementById("Dijkstra");
djkistraBtn.addEventListener("click", dijkstra);
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

function dijkstra() {
  const startVertexId = parseInt(prompt("Enter the ID of the start vertex:"));
  const endVertexId = parseInt(prompt("Enter the ID of the end vertex:"));

  const startVertex = vertices.find(vertex => vertex.id == startVertexId);
  const endVertex = vertices.find(vertex => vertex.id == endVertexId);

  const dist = [];
  const prev = [];
  const visited = new Set();

  for (const vertex of vertices) {
    dist[vertex.id] = Infinity;
    prev[vertex.id] = null;
  }

  dist[startVertex.id] = 0;

  while (visited.size < vertices.length) {
    const currentVertex = getLowestVertex(dist, visited);
    visited.add(currentVertex);
    for (const adjacentVertex of currentVertex.adjacent) {
      const edge = edges.find(edge => (edge.start == currentVertex && edge.end == adjacentVertex) || (edge.start == adjacentVertex && edge.end == currentVertex));
      const weight = parseInt(edge.weight);

      const altDist = dist[currentVertex.id] + weight;
      if (altDist < dist[adjacentVertex.id]) {
        dist[adjacentVertex.id] = altDist;
        prev[adjacentVertex.id] = currentVertex;
      }
    }
  }

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

  console.log("Shortest path:");
  console.log(shortestPath.map(vertex => vertex.toString()).join(" -> "));



  highlightShortestPath(shortestPath);

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
  


function Vertex(x, y, id, adjacent) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.adjacent = adjacent;


  this.toString = function () {
    return "(" + x + ", " + y + "," + id + ")";
  }

}

function Edge(start, end, weight) {
  this.start = start;
  this.end = end;
  this.weight = weight;

  this.getWeight = function () { 
    return weight;
  }
}

let selectedCircles = [];


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

function drawLine(event) {

  const rect = box.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (isTooClose(x, y)) {
    return;
  }

  const existingCircle = document.elementFromPoint(event.clientX, event.clientY);
  if (existingCircle && existingCircle.classList.contains('dot')) {
    return;
  }

  const circle = document.createElementNS(ns, "circle");
  circle.addEventListener("click", drawEdge);

  circle.setAttributeNS(null, "cx", x);
  circle.setAttributeNS(null, "cy", y);
  circle.setAttributeNS(null, "r", 15);
  circle.setAttributeNS(null,"id", `vertex_${vertexID}`);
  circle.classList.add("dot");



  const vert = new Vertex(x, y, vertexID++, []);
  vertices.push(vert);
  console.log(vert.toString());

  
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



  function drawEdge() {
    console.log("click");
    circle.classList.toggle("selected");
    if (circle.classList.contains("selected")) {
      selectedCircles.push(circle);
      if (selectedCircles.length == 2) {
        const circle1 = selectedCircles[0];
        const circle2 = selectedCircles[1];
        const weight = prompt("Enter edge weight:");
        if (!isNaN(weight) && weight != null){
          const line = document.createElementNS(ns, "line");
  
          const vert1 = vertices.find(v => v.x == circle1.getAttribute("cx") && v.y == circle1.getAttribute("cy"));
          const vert2 = vertices.find(v => v.x == circle2.getAttribute("cx") && v.y == circle2.getAttribute("cy"));
  
          const edge = new Edge(vert1, vert2, weight);
  
          vert1.adjacent.push(vert2);
          vert2.adjacent.push(vert1);
  
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


function Prim() {
  const startVert = vertices[0];
  const visited = new Set([startVert]);
  const mst = [];

  while (visited.size < vertices.length) {
    let minEdge = null;
    for (const vert of visited) {
      for (const adj of vert.adjacent) {
        if (!visited.has(adj)) {
          const edge = edges.find(e => (e.start === vert && e.end === adj) || (e.start === adj && e.end === vert));
          if (!minEdge || edge.weight < minEdge.weight) {
            minEdge = edge;
          }
        }
      }
    }
    mst.push(minEdge);
    visited.add(minEdge.start);
    visited.add(minEdge.end);
  }

  console.log("Minimum spanning tree:");
  let sum = 0;
  for (const edge of mst) {
    edge.line.setAttributeNS(null, "stroke", "green");
    console.log(`(${edge.start.id}, ${edge.end.id})`);
    sum += edge.weight;
  }

}