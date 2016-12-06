"""Script to transform the json mapping from layout format to tree format."""

import json
import utils


def add_node_to_map(node, mapping):
    mapping[node['name']] = {
        'name': node['name'],
        'children': [],
        'parent': None,
        'description': node['description']
    }


def main():
    print 'Transforming mapping.'
    with open(utils.OUTPUT_FILE, 'r') as input_file:
        ontology = json.load(input_file)

    aux_lkif = {}  # Map from node name to node
    nodes_without_parent = []
    for link in ontology['links']:
        if link['type'] == 'lkif':
            parent = ontology['nodes'][link['source']]
            children = ontology['nodes'][link['target']]
            parent_name = parent['name']
            children_name = children['name']
            if not parent_name in aux_lkif:
                # Unseen parent
                add_node_to_map(parent, aux_lkif)
                nodes_without_parent.append(parent_name)

            if children_name in aux_lkif:
                if aux_lkif[children_name]['parent']:
                    # We have a double parent!!!
                    aux_lkif[children_name]['parent'].append(parent_name)
                    print 'Double parent {} {} -> {} {}'.format(
                        parent_name, link['source'], children_name,
                        link['target'])
                else:
                    # This is creating an aliasin, not copying data
                    aux_lkif[parent_name]['children'].append(aux_lkif[children_name])
                    aux_lkif[children_name]['parent'] = [parent_name]
                    assert children_name in nodes_without_parent
                    nodes_without_parent.remove(children_name)
            elif children_name not in aux_lkif:
                add_node_to_map(children, aux_lkif)
                aux_lkif[parent_name]['children'].append(aux_lkif[children_name])
                aux_lkif[children_name]['parent'] = [parent_name]

    # Building lkif
    lkif = {'name': 'LKIF', 'children': []}
    for root_node in nodes_without_parent:
        lkif['children'].append(aux_lkif[root_node])

    # Saving output
    with open(utils.HIERARCHY_FILE, 'w') as output_file:
        json.dump(lkif, output_file)


if __name__ == '__main__':
    main()
