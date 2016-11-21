"""Script to get YAGO hierarchy only with nodes from YAGO_TO_LKIF_MAPPING.

The output json is optimized for D3 visualization using a force layout. The
format is:

{
    "nodes": [{"name": class_name}, ....],
    "links": [{"source":1,"target":0}, ...]
}
"""

import json
import utils
from collections import defaultdict
from tqdm import tqdm


YAGO_ENPOINT_URL = 'https://linkeddata1.calcul.u-psud.fr/sparql'
TOP_CLASS = 'owl#Thing'

YAGO_TO_LKIF_MAPPING = utils.get_yago_to_lkif_mapping()


def add_ancestors(type_name, current_ancestors, descriptions):
    """Returns a list with the ancestors a of type name"""
    if type_name in current_ancestors:
        return
    query = """SELECT DISTINCT ?ancestors, ?description WHERE {
        <http://yago-knowledge.org/resource/%s> rdfs:subClassOf ?ancestors.
        <http://yago-knowledge.org/resource/%s> <http://yago-knowledge.org/resource/hasGloss> ?description.
    }""" % (type_name, type_name)
    response = utils.query_sparql(query, YAGO_ENPOINT_URL)
    ancestors = [ancestor[0].split('/')[-1] for ancestor in response[1:]]
    try:
        description = response[1][1].capitalize() + '.'
    except IndexError:
        description = ''
    descriptions[type_name] = description
    current_ancestors[type_name] = ancestors
    for ancestor in ancestors:
        add_ancestors(ancestor, current_ancestors, descriptions)


def get_pairs(ancestors):
    """Returns pairs of direct parents."""
    # Dictionary from parent to list of immediate children
    ontology = defaultdict(lambda: set())
    assert TOP_CLASS in ancestors

    node_to_levels = {node: len(anc) for node, anc in ancestors.iteritems()}
    level_to_nodes = {
        level: [node for node, l in node_to_levels.iteritems() if l == level]
        for level in node_to_levels.values()
    }
    assert node_to_levels[TOP_CLASS] == 0

    previous_levels = [0]
    for level in sorted(level_to_nodes.keys())[1:]:
        for node in level_to_nodes[level]:
            something_added = False
            # We can only add ancetors from the same previous level, only one
            # level up.
            for previous_level in reversed(previous_levels):
                if something_added:
                    break
                for prev_level_node in level_to_nodes[previous_level]:
                    if prev_level_node in ancestors[node]:
                        ontology[prev_level_node].add(node)
                        something_added = True
        previous_levels.append(level)

    # Transform the ontology to pair of links
    return [(parent, child) for parent, children in ontology.iteritems()
            for child in children]


def write_json(pairs, nodes, descriptions, important_nodes=[]):
    """Creates a json object to be visualized."""
    result = {
        'nodes': [{
            'name': node,
            'important': node in important_nodes,
            'description': descriptions.get(node, ''),
            'mappings': YAGO_TO_LKIF_MAPPING.get(node, []),
            'ontology': 'yago'
        } for node in nodes],
        'links': [{
            'source': nodes.index(pair[0]),
            'target': nodes.index(pair[1]),
            'isImportant': True,
            'type': 'yago'
        } for pair in pairs]}

    with open(utils.YAGO_OUTPUT_FILE, 'w') as output_file:
        json.dump(result, output_file)


def main():
    """Main script function"""
    yago_types = set(YAGO_TO_LKIF_MAPPING.keys())
    ancestors = {}
    descriptions = {}
    for type_name in tqdm(yago_types):
        add_ancestors(type_name, ancestors, descriptions)
    assert set(ancestors.keys()) == set(descriptions.keys())
    pairs = [(parent, child) for parent, children in ancestors.iteritems()
             for child in children]
    yago_types.add(TOP_CLASS)
    write_json(pairs, ancestors.keys(), descriptions, yago_types)


if __name__ == '__main__':
    main()
