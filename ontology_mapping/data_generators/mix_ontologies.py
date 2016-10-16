"""Script to mix the two ontologies"""

import json
import utils




def main():
    """Main function of the script."""
    with open(utils.YAGO_OUTPUT_FILE, 'r') as yago_file:
        yago = json.load(yago_file)
    with open(utils.LKIF_OUTPUT_FILE, 'r') as lkif_file:
        lkif = json.load(lkif_file)

    # Mix nodes
    for node in lkif['nodes']:
        node['ontology'] = 'lkif'
    nodes = lkif['nodes']
    lkif_nodes = len(lkif['nodes'])
    yago_indexes = {}
    for node_index, node in enumerate(yago['nodes']):
        yago_indexes[node['name']] = node_index + lkif_nodes
        node['ontology'] = 'yago'
    nodes += yago['nodes']

    # Mix links
    links = []
    for link in lkif['links']:
        links.append(link)
    for link in yago['links']:
        links.append({
            'source': link['source'] + lkif_nodes,
            'target': link['target'] + lkif_nodes,
            'isImportant': (yago['nodes'][link['source']]['important']
                            and yago['nodes'][link['target']]['important']),
            'type': 'yago'
        })

    # Add mapping links
    for source_index, node in enumerate(lkif['nodes'][:lkif_nodes]):
        for mapping in node.get('mappings', []):
            target_index = yago_indexes[mapping]
            links.append({
                'source': source_index,
                'target': target_index,
                'type': 'mapping'
            })

    ontology = {'nodes': nodes, 'links': links}

    with open(utils.OUTPUT_FILE, 'w') as output_file:
        json.dump(ontology, output_file)


if __name__ == '__main__':
    main()