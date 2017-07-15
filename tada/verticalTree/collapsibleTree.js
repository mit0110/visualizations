
var viewerWidth = $(document).width();
var viewerHeight = $(document).height();

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = viewerWidth - margin.right - margin.left,
    height = viewerHeight - margin.top - margin.bottom;

var nodeHeight = 150, nodeWidth = 120, collapsedWidth = 40,
    collapsedHeight = 20;

var rootPosition = {x: margin.left + width / 2, y: margin.top};

var maxTextLenght = 300;

var i = 0,
    duration = 750,
    root;

function getNodeWidth(d) {
  return d.collapsed ? collapsedWidth : nodeWidth;
}

function getNodeHeight(d) {
  return d.collapsed ? collapsedHeight : nodeHeight;
}

function getNodeText(d) {
  if (d.collapsed) {
    return d.name;
  }
  if (d.label && d.text) {
    return d.name + ' ' + d.label + ' ' + d.text.slice(0, maxTextLenght);
  }
  return d.name;
}


function redraw(filename) {
  d3.select('#tree-container').html('');
  drawTree(filename);
}

function drawTree(documentFile) {
  // Create the SVG containers
  var tree = d3.layout.tree()
      .nodeSize([nodeWidth * 1.1, nodeHeight])
      //.size([height, width]);

  var diagonal = d3.svg.diagonal()
      .source(function(d) {
          return {x: d.source.x, y: d.source.y + nodeWidth};
      })
      .projection(function(d) { return [d.x, d.y]; });

  var zoom = d3.behavior.zoom()
      .center([0, 0])
      .on("zoom", function () {
        center = [
          d3.event.translate[0] + width / 2 + margin.right,
          d3.event.translate[1] + margin.top
        ];
        svg.attr("transform", "translate(" + center + ")" + " scale(" + d3.event.scale + ")")
      });

  var svg = d3.select("#tree-container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .call(zoom)
      .append("g")
        .attr("transform",
              "translate(" + rootPosition.x + "," + rootPosition.y + ")")

  d3.json(documentFile, function(error, dataRoot) {
    if (error) throw error;

    root = dataRoot;
    root.x0 = 0;
    root.y0 = height / 2;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
      d.collapsed = true;
    }

    // Collapse everithng under the first level
    root.children.forEach(function(d){
      d.children.forEach(collapse);
    });
    update(root);
  });

  d3.select(self.frameElement).style("height", "800px");

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * nodeHeight * 1.1; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr('width', nodeWidth)
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on("click", click);

    nodeEnter.append("rect")
        .attr('y', 0)
        .classed('shape', true)
        .attr('x', function(d) { return -getNodeWidth(d) / 2 })
        .attr('height', getNodeHeight)
        .attr('width', getNodeWidth)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        });

    nodeEnter.append("foreignObject")
        .attr("width", getNodeWidth)
        .attr("height", getNodeHeight)
        .attr('class', 'nodeText')
        .attr('x', function(d) { return -getNodeWidth(d) / 2 })
        .style("display", 'none')
      .append("xhtml:body")
      .append("xhtml:div")
        .text(getNodeText);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

    nodeUpdate.select("rect")
        .attr('y', 0)
        .attr('x', function(d) { return -getNodeWidth(d) / 2 })
        .attr('height', getNodeHeight)
        .attr('width', getNodeWidth)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        });

    nodeUpdate.select("foreignObject")
        .attr('x', function(d) { return -getNodeWidth(d) / 2 })
        .attr("width", getNodeWidth)
        .attr("height", getNodeHeight)
        .text(getNodeText);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().remove();

    // Make text disappear during the transition
    nodeUpdate.select("foreignObject")
       .style("display", 'block')

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0 + getNodeHeight(d)};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Removing exiting links
    link.exit().remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    d.collapsed = !d.collapsed;
    update(d);
  }
}
