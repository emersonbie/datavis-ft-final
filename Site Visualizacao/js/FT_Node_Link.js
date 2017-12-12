var width = 960,
    height = 600,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

d3.json("data/graph_FT.json", function(error, json) {
  if (error) throw error;

  root = json;
  update();
});

force.gravity(0.01);

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();



  // Update the links…
  link = link.data(links, function(d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Update the nodes…
  node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

  node.append("title")
    .text(function(d) {return d.name;});
  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return Math.sqrt(d.size) / 7 || 4.5; })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);

  // add the text 
  node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });
 

}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  var cor;
  if(d.name == "Analista_1")
    cor = "#BDE3E6";
  if(d.name == "Analista_2")
    cor = "#00CED1";
  if(d.name == "Analista_3")
    cor = "#66CDAA";
  if(d.name == "Analista_4")
    cor = "#00829C";
  if(d.name == "Analista_5")
    cor = "#7FFFD4";
  if(d.name == "Analista_6")
    cor = "#77A9F7";
  
  var corProject;
  if(d.level == 1)
    corProject = "#7A7ACC";
  if(d.level == 2)
    corProject = "#A02240";
  if(d.level == 3)
    corProject = "#350C29";
  //else
    //corProject = "#c6dbef";
  //else
    //cor = "#c6dbef";
  return d._children ? "#3182bd" : d.children ? corProject : cor;
}

// Toggle children on click.
function click(d) {
  if (!d3.event.defaultPrevented) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update();
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}