import { Component, OnInit, OnChanges,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild } from '@angular/core';
import { TreeMapConfig } from './tree-map-config';
import * as D3 from 'd3';

@Component({
  selector: 'app-tree-map',
  templateUrl: './tree-map.component.html',
  styleUrls: ['./tree-map.component.css']
})

export class TreeMapComponent implements OnInit {

  @Input() config: Array<TreeMapConfig>;
  @ViewChild('container') element: ElementRef;

  private host;
  private svg;
  private padding;
  private width;
  private height;
  private xScale;
  private yScale;
  private xAxis;
  private yAxis;
  private htmlElement: HTMLElement;
  /**
  * We request angular for the element reference
  * and then we create a D3 Wrapper for our host element
  **/
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.htmlElement);
    this.setup();
    this.draw();
  }

  draw(): void {
    console.log(this.config);
    if (!this.config || this.config.length === 0 || !this.host) return;
    this.buildSVG();
    this.populate();
  }
  /**
  * Everythime the @Input is updated, we rebuild the chart
  **/
  ngOnChanges(): void {
    if (!this.config || this.config.length === 0 || !this.host) return;
    this.setup();
    this.draw();
  }

  /**
  * Basically we get the dom element size and build the container configs
  * also we create the xScale and yScale ranges depending on calculations
  **/
  private setup(): void {
    this.padding = { top: 20, right: 20, bottom: 40, left: 40 };
    this.width = this.htmlElement.clientWidth - this.padding.left - this.padding.right;
    this.height = this.width * 0.5 - this.padding.top - this.padding.bottom;
    this.xScale = D3.scale.linear().range([0, this.width]);
    this.yScale = D3.scale.linear().range([this.height, 0]);
  }

  /**
  * We can now build our SVG element using the configurations we created
  **/
  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width - this.padding.left - this.padding.right)
      .attr('height', this.height - this.padding.top - this.padding.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top + ')');
  }

  /**
  * Now we populate using our dataset, mapping the x and y values
  * into the x and y domains, also we set the interpolation so we decide
  * how the Area Chart is plotted.
  **/
  private populate(): void {
    this.config.forEach((area: any) => {
      console.log(area.dataset);
      // this.xScale.domain(D3.extent(area.dataset, (d: any) => d.x));
      // this.yScale.domain([0, this.getMaxY()]);
      // this.svg.append('path')
      //   .datum(area.dataset)
      //   .attr('class', 'area')
      //   .style('fill', area.settings.fill)
      //   .attr('d', D3.svg.area()
      //     .x((d: any) => this.xScale(d.x))
      //     .y0(this.height)
      //     .y1((d: any) => this.yScale(d.y))
      //     .interpolate(area.settings.interpolation));
    });
  }

}
