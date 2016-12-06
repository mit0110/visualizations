export interface TreeMapNode {

}

export interface TreeMapConfig {
  settings: { fill: string, interpolation: string };
  dataset: Array<{ x: number, y: number }>
}
