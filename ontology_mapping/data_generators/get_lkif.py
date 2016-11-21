"""Download LKIF ontology into a json file with only hierarchical relations.

Original LKIF repository: https://github.com/RinkeHoekstra/lkif-core

The output json is optimized for D3 visualization using a force layout. The
format is:

{
    "nodes": [{"name": class_name, "description": description}, ....],
    "links": [{"source":1,"target":0}, ...]
}
"""

import json
import ontospy
import utils

LKIF_BASE_URL = 'https://github.com/RinkeHoekstra/lkif-core/raw/master/{}.owl'

FILES = [
    'action',
    'expression',
    'legal-action',
    'legal-role',
    'lkif-core',
    'lkif-extended',
    'lkif-rules',
    'lkif-top',
    'mereology',
    'norm',
    'process',
    'relative-places',
    'role',
    'time-modification',
    'time',
]


LKIF_TO_YAGO_MAPPING = utils.get_likf_to_yago_mapping()


class ClassIndex(object):
    """Abstraction for a class index."""
    def __init__(self):
        self.elements = []
        self.index = {}

    def add(self, element):
        """Adds the element to the index and returns the position index.

        If the element is present returns the old index."""
        element_name = element.qname.split(':')[-1]
        if element_name not in self.index:
            self.index[element_name] = len(self.elements)
            self.elements.append({
                'name': element_name,
                'description': element.bestDescription(),
                'mappings': LKIF_TO_YAGO_MAPPING.get(element_name, []),
                'important': element_name in LKIF_TO_YAGO_MAPPING
            })
        return self.index[element_name]


def main():
    """Main script function"""
    class_index = ClassIndex()
    links = []
    for filename in FILES:
        url = LKIF_BASE_URL.format(filename)
        onto = ontospy.Graph(url)
        for class_ in onto.classes:
            source_index = class_index.add(class_)
            # Append links
            for child in class_.children():
                target_index = class_index.add(child)
                links.append({
                    'source': source_index, 'target': target_index,
                    'type': 'lkif', 'isImportant': True
                })
    with open(utils.LKIF_OUTPUT_FILE, 'w') as output_file:
        json.dump({'nodes': class_index.elements, 'links': links}, output_file)



if __name__ == '__main__':
    main()
