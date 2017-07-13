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
    roots = []
    digraph = nx.DiGraph()
    doc_title = filename.replace('.ann', '')
    with open(filename, 'r') as file_:
        for line in file_:
            if line[0] == 'T':
                name, label, text = line.split('\t')[:3]
                nodes[name] = {'label': label.split(' ')[0], 'text': text}
                digraph.add_node(
                    name, {'label': label.split(' ')[0], 'text': text})
                if 'major-claim' in label:
                    roots.append(name)
            elif line[0] == 'R':
                name, label = line.split('\t')[:2]
                label, destination, origin = label.split(' ')
                origin = origin.replace('Arg2:', '')
                destination = destination.replace('Arg1:', '')
                edges[name] = {
                    'label': label, 'origin': origin,
                    'destination': destination
                }
                digraph.add_edge(origin, destination, {'label': label})
    data = {'name': doc_title.replace('_', ' '), 'children': []}
    for root in roots:
        descendants = nx.descendants(digraph, root)
        descendants.add(root)
        subgraph = digraph.subgraph(descendants)
        if not nx.is_tree(subgraph):
            continue
        data['children'].append(json_graph.tree_data(
            subgraph, root=root, attrs={'children': 'children', 'id': 'name'}))
    with open('{}.json'.format(doc_title), 'w') as jf:
        json.dump(data, jf)


if __name__ == '__main__':
    main()
