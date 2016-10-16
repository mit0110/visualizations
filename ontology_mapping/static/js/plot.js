/**
 * Returns html content for tooltips
 * @param  {node} element The hovered node
 * @return {text}         inner html to render the tooltip
 */
var buildTooltip = function(element) {
    var name = element.name.replace(new RegExp('_', 'g'), ' ');
    var tooltip = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = element.name.replace(new RegExp('_', 'g'), ' ');
    title.className = 'head-title';
    tooltip.appendChild(title);

    if (element.description !== undefined) {
        tooltip.appendChild(document.createTextNode(' ' + element.description));
    }

    if (element.mappings !== undefined && element.mappings.length > 0) {
        var mappingsDiv = document.createElement('div');
        var mappingsHeader = document.createElement('strong');
        mappingsHeader.textContent = 'Mapped to:';
        mappingsDiv.appendChild(mappingsHeader);
        mappingsDiv.className = 'mapping';
        var listNode = document.createElement('ul');
        for (var i = element.mappings.length - 1; i >= 0; i--) {
            var listElement = document.createElement('li');
            listElement.textContent = element.mappings[i];
            listNode.appendChild(listElement);
        }
        mappingsDiv.appendChild(listNode);
        tooltip.appendChild(mappingsDiv);
    }
    return tooltip.outerHTML;
};


/**
 * Draw the ontology visualization.
 * @param  {Dashboard} dashboard the instance controlling the dashboard.
 */
var selectableForceDirectedGraph = function(dashboard) {
    var width = 960,
        height = 900,
        shiftKey, ctrlKey;

    var nodeGraph = null;
    var xScale = d3.scale.linear()
        .domain([0, width]).range([0, width]);
    var yScale = d3.scale.linear()
        .domain([0, height]).range([0, height]);

    var svg = d3.select('#d3_selectable_force_directed_graph')
        .attr('tabindex', 1)
        .on('keydown.brush', keydown)
        .on('keyup.brush', keyup)
        .each(function() { this.focus(); })
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var zoomer = d3.behavior.zoom().
        scaleExtent([0.1, 10]).
        x(xScale).
        y(yScale).
        on('zoomstart', zoomstart).
        on('zoom', redraw);

    function zoomstart() {
        circles.each(function(d) {
            d.selected = false;
            d.previouslySelected = false;
        });
        circles.classed('selected', false);
    }

    function redraw() {
        vis.attr('transform',
                 'translate(' + d3.event.translate +
                    ')' + ' scale(' + d3.event.scale + ')');
    }

    var brusher = d3.svg.brush()
        //.x(d3.scale.identity().domain([0, width]))
        //.y(d3.scale.identity().domain([0, height]))
        .x(xScale)
        .y(yScale)
        .on('brushstart', function(d) {
            circles.each(function(d) {
                d.previouslySelected = shiftKey && d.selected; });
        })
        .on('brush', function() {
            var extent = d3.event.target.extent();

            circles.classed('selected', function(d) {
                return d.selected = d.previouslySelected ^
                    (extent[0][0] <= d.x && d.x < extent[1][0] &&
                        extent[0][1] <= d.y && d.y < extent[1][1]);
            });
        })
        .on('brushend', function() {
            d3.event.target.clear();
            d3.select(this).call(d3.event.target);
        });

    var svg_graph = svg.append('svg:g')
        .call(zoomer);
        //.call(brusher)

    var rect = svg_graph.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 1)
        //.attr("pointer-events", "all")
        .attr('id', 'zrect');

    var brush = svg_graph.append('g')
        .datum(function() {
            return {selected: false, previouslySelected: false}; })
        .attr('class', 'brush');

    var vis = svg_graph.append('svg:g');

    vis.attr('fill', 'rgb(47, 160, 236)')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)
        .attr('id', 'vis');

    brush.call(brusher)
        .on('mousedown.brush', null)
        .on('touchstart.brush', null)
        .on('touchmove.brush', null)
        .on('touchend.brush', null);

    brush.select('.background').style('cursor', 'auto');

    // Tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(buildTooltip);
    svg.call(tip);

    var link = vis.append('g')
        .attr('class', 'link')
        .selectAll('line');

    var node = vis.append('g')
        .attr('class', 'node')
        .selectAll('.node');

    // Arrows
    vis.append('defs').selectAll('marker')
        .data(['suit', 'licensing', 'resolved'])
        .enter().append('marker')
            .attr('id', function(d) { return d; })
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
        .append('path')
            .attr('d', 'M0,-5L10,0L0,5 L10,0 L0, -5')
            .style('stroke', '#4679BD')
            .style('opacity', '0.6');

    center_view = function() {
        // Center the view on the molecule(s) and scale it so that everything
        // fits in the window

        if (nodeGraph === null)
            return;

        var nodes = nodeGraph.nodes;

        //no molecules, nothing to do
        if (nodes.length === 0)
            return;

        // Get the bounding box
        min_x = d3.min(nodes.map(function(d) {return d.x;}));
        min_y = d3.min(nodes.map(function(d) {return d.y;}));

        max_x = d3.max(nodes.map(function(d) {return d.x;}));
        max_y = d3.max(nodes.map(function(d) {return d.y;}));


        // The width and the height of the graph
        mol_width = max_x - min_x;
        mol_height = max_y - min_y;

        // how much larger the drawing area is than the width and the height
        width_ratio = width / mol_width;
        height_ratio = height / mol_height;

        // we need to fit it in both directions, so we scale according to
        // the direction in which we need to shrink the most
        min_ratio = Math.min(width_ratio, height_ratio) * 0.8;

        // the new dimensions of the molecule
        new_mol_width = mol_width * min_ratio;
        new_mol_height = mol_height * min_ratio;

        // translate so that it's in the center of the window
        x_trans = -(min_x) * min_ratio + (width - new_mol_width) / 2;
        y_trans = -(min_y) * min_ratio + (height - new_mol_height) / 2;


        // do the actual moving
        vis.attr('transform', 'translate(' + [x_trans, y_trans] + ')' +
            ' scale(' + min_ratio + ')');
        // tell the zoomer what we did so that next we zoom, it uses the
        // transformation we entered here
        zoomer.translate([x_trans, y_trans]);
        zoomer.scale(min_ratio);
    };

    function dragended(d) {
        //d3.select(self).classed("dragging", false);
        circles.filter(function(d) { return d.selected; })
            .each(function(d) { d.fixed &= ~6; });
    }

    d3.json(dashboard.ontology, function(error, graph) {
        nodeGraph = graph;

        graph.links.forEach(function(d) {
            d.source = graph.nodes[d.source];
            d.target = graph.nodes[d.target];
        });

        link = link.data(graph.links).enter().append('line')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; })
            .classed('important-link', function(d) {
                return d.isImportant == true || d.isImportant === undefined;
            })
            .classed('not-important-link', function(d) {
                return !(d.isImportant == true || d.isImportant === undefined);
            })
            .classed('yago-link', function(d) {
                return d.type == 'yago';
            })
            .classed('lkif-link', function(d) {
                return d.type == 'lkif';
            })
            .classed('mapping-link', function(d) {
                return d.type == 'mapping';
            })
            .attr('style', 'marker-end: url(\"#suit\");'); // To draw arrows

        var force = d3.layout.force()
            .charge(function(d) {
                if (d.ontology == 'yago' && d.important === false) {
                    return -20;
                } else if (d.mappings && d.mappings.length > 0) {
                    return -400
                }
                return -50;
            })
            .linkDistance(function(d) {
                // Mapping or unimportant links are shorter
                if (d.type === 'mapping') {
                    return 100;
                } else if (d.isImportant === false) {
                    return 0.05;
                }
                return 10;
            })
            .linkStrength(0.9)
            .nodes(graph.nodes)
            .links(graph.links)
            .size([width, height])
            .start();

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every
                // other node
                circles.classed('selected', function(p) {
                    return p.selected = p.previouslySelected = false; });
            }
            d3.select(this).select('.main-circle')
                .classed('selected', function(p) {
                    d.previouslySelected = false;
                    d.selected = true;
                    return true;
                });

            circles.filter(function(d) { return d.selected; })
                .each(function(d) { d.fixed |= 2; });
        }

        function dragged(d) {
            circles.filter(function(d) { return d.selected; })
                .each(function(d) {
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;

                    d.px += d3.event.dx;
                    d.py += d3.event.dy;
                });

            force.resume();
        }

        node = node.data(graph.nodes).enter().append('g')
            .classed('yago', function(d) { return d.ontology == 'yago'; })
            .classed('lkif', function(d) { return d.ontology == 'lkif'; })
            .on('mouseover', function(d) {
                tip.attr('class', 'd3-tip animate').show(d);
            })
            .on('mouseout', function(d) {
                tip.attr('class', 'd3-tip').show(d);
                tip.hide();
            })
            .call(d3.behavior.drag()
                .on('dragstart', dragstarted)
                .on('drag', dragged)
                .on('dragend', dragended));
        circles = node.append('circle')
            .attr('r', 3)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('class', 'main-circle')
            .classed('not-important', function(d) {
                return d.important == false;
            })
            .on('dblclick', function(d) { d3.event.stopPropagation(); })
            .on('click', function(d) {
                if (d3.event.defaultPrevented) return;

                if (!shiftKey) {
                    //if the shift key isn't down, unselect everything
                    circles.classed('selected', false);
                }

                // always select this node
                d3.select(this)
                    .classed('selected', function(p) {
                        d.previouslySelected = false;
                        d.selected = true;
                        d.fixed = true;
                        return true;
                    });
            })
            .on('mouseup', function(d) {})
            .attr('id', function(d) {return d.name;});

        // Add the labels
        node.append('text')
            .attr('dx', 10)
            .attr('dy', '.20em')
            .attr('class', 'node-label')
            .text(function(d) {
                return d.name.replace('wordnet_', '')
                    .replace(/[0-9]/g, '')
                    .replace(/_/g, ' ');
            })
            .classed('label-important', function(d) {
                return d.important !== false;
            })
            .classed('label-not-important', function(d) {
                return d.important === false;
            });

        function tick() {
            link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            d3.selectAll('.main-circle').attr('cx', function(d) {
                return d.x;
            }).attr('cy', function(d) {
                return d.y;
            });

            d3.selectAll('.node-label').attr('x', function(d) {
                return d.x;
            }).attr('y', function(d) {
                return d.y;
            });
        };

        force.on('tick', tick);
        dashboard.resetDefaultOptions();
    });


    function keydown() {
        shiftKey = d3.event.shiftKey || d3.event.metaKey;
        ctrlKey = d3.event.ctrlKey;

        if (d3.event.keyCode == 67) {   //the 'c' key
            center_view();
        }

        if (shiftKey) {
            svg_graph.call(zoomer)
                .on('mousedown.zoom', null)
                .on('touchstart.zoom', null)
                .on('touchmove.zoom', null)
                .on('touchend.zoom', null);

            //svg_graph.on('zoom', null);
            vis.selectAll('g.gnode')
                .on('mousedown.drag', null);

            brush.select('.background').style('cursor', 'crosshair');
            brush.call(brusher);
        }
    }

    function keyup() {
        shiftKey = d3.event.shiftKey || d3.event.metaKey;
        ctrlKey = d3.event.ctrlKey;

        brush.call(brusher)
            .on('mousedown.brush', null)
            .on('touchstart.brush', null)
            .on('touchmove.brush', null)
            .on('touchend.brush', null);

        brush.select('.background').style('cursor', 'auto');
        svg_graph.call(zoomer);
    }
};
