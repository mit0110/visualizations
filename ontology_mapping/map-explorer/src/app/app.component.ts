import { Component } from '@angular/core';
import { TreeMapConfig } from './tree-map/tree-map-config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  private treeMapConfig: Array<TreeMapConfig>;

  constructor() {
    this.treeMapConfig = new Array<TreeMapConfig>();
    let dataset = [];
    let treeDataset = {
      "name": "root",
      "children": [
        {
          "name": "child1",
          "children": [
            {
              "name": "child11",
              "size": 10
            }, {
              "name": "child12",
              "size": 15
            }]
        }, {
          "name": "child2",
          "children": [
            {
              "name": "child21",
              "size": 20
            }]
        }]
    }
    for (let x = 0; x < 5; x++) {
      dataset.push({x: x, y: x*x});
    }
    this.treeMapConfig.push({
      settings: {
        fill: 'rgba(1, 67, 163, 1)',
        interpolation: 'monotone'
      },
      dataset: dataset
    })
  }
}
