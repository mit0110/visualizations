# Playing with Visualizations
This is a collections of visualizations made while I'm learning d3.js and general front end development, using data on topics that I found relevant or convinient at the moment. 

## Ontology mapping.

![Screeshot of visualization](https://cloud.githubusercontent.com/assets/5737003/19413682/62eefcf4-930a-11e6-8e10-a23d4ac99d06.png)

#### Quick start
To see the visualization, clone the repo and just open the `ontology_mapping.html` file. If you are using Chrome, you'll have an error but you can run any of the following commands
```
$ python run_server.py
$ python -m SimpleHTTPServer
```
The mapping is defined in `data_generators/utils.py`. You can modify it and download again the types from each ontology by running
```
$ bash get_data.sh
```

#### Some background
Between all the work doing for the MIREL project (reasoning on legal texts), ontology population is one of the first steps to take. You can't reason much if you don't understand what things exist in the world, what type they have and how are related. To populate the [legal ontology LKIF](https://github.com/RinkeHoekstra/lkif-core), the first effort is to take advantage of the already populated (and general-domain) ontology [YAGO](www.yago-knowledge.org) and use its entities to populate LKIF. However, not all entities in YAGO are relevant to the legal domain, and even more, the correct place of each entity inside the LKIF ontology has to be defined. To solve this problem, a mapping has been developed between types of entities in the two ontologies. For example, the class *wordnet_company_108058098* from YAGO is equivalent to the class *Company* from LKIF. But this mapping is not a complete function, nor biyective. Although this mapping is a funciton (for each YAGO class there is only one LKIF class associated), is not surjective or injective.

This visualization aims to show this mapping in a more intuitive way, where the user can explore the hierarchy of both ontologies and how they are related. Two types of relations are represented: the hierarchycal links between types of the same ontology and the mapping between types of different ontologies. YAGO is a huge ontology, so we only include here the types that are mapped and their ancestors.

#### Technical description
This visualization uses a [force layout](https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md) to represent both ontologies. Each node is a type and links are relations between them: mapping or hierarchy. There are two basic types of nodes (YAGO and LKIF), and three types of links (hierarchy in YAGO, hierarchy in LKIF and mapping). We also added some controls:

- Ontologies can be visualized at the same time or separatedly.
- D3 force layout:
  - Nodes can be moved.
  - Using the shift key, multiple nodes can be selected.
  - Clicking a node makes it fixed.
  - Zoom in/out.
  - Pressing the C key centers the view
- Style control (particular to each ontology):
  - The opacity of the nodes can be changed.
  - The opacity of the links can be changed.
  - The number of levels showed can be selected: all, important only and none.
- Tooltips in the nodes to show extra information about the class.

#### Work to be done
Of course this is far from complete, but I'm exploring different viualizations for the same data and adding more controls to the dashboard to improve interpretation. Also,  show more information in the tooltips and get it with API request instead of load it statically.

Hope you like it!

