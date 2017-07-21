import argparse
import json
import networkx as nx

from networkx.readwrite import json_graph

def read_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument('filename', type=str, help='source file to process')
    return parser.parse_args()


def main():
    args = read_arguments()
    filename = args.filename
    nodes = {}
    edges = {}
    actors = {}
    roots = []
    digraph = nx.DiGraph()
    doc_title = filename.replace('.ann', '')
    with open(filename, 'r') as file_:
        for line in file_:
            if line.startswith('T'):
                name, label, text = line.split('\t')[:3]
                nodes[name] = {'label': label.split(' ')[0], 'text': text}
                digraph.add_node(
                    name, {'label': label.split(' ')[0], 'text': text})
                if 'major-claim' in label:
                    roots.append(name)
            elif line.startswith('R'):
                name, label = line.split('\t')[:2]
                label, destination, origin = label.split(' ')
                origin = origin.replace('Arg2:', '')
                destination = destination.replace('Arg1:', '')
                edges[name] = {
                    'label': label, 'origin': origin,
                    'destination': destination
                }
                digraph.add_edge(origin, destination, {'label': label})
            elif line.startswith('A'):
                _, attribute_name, source, attribute_value = line.split()
                if attribute_name == 'ACTOR':
                    actors[source] = attribute_value
    nx.set_node_attributes(digraph, 'actor', actors)
    data = {'name': doc_title.replace('_', ' '), 'children': []}
    # Transform digraph into a forest using the major-claims as tree roots.
    for root in roots:
        descendants = nx.descendants(digraph, root)
        descendants.add(root)
        subgraph = digraph.subgraph(descendants)
        if not nx.is_tree(subgraph):
            print('Subgraph that is not a tree founded')
            continue
        data['children'].append(json_graph.tree_data(
            subgraph, root=root,
            attrs={'children': 'children', 'id': 'name', 'actor': 'actor'}))
    with open('{}.json'.format(doc_title), 'w') as jf:
        json.dump(data, jf)


if __name__ == '__main__':
    main()
