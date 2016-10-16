"""Common functions and constants."""

from SPARQLWrapper import SPARQLWrapper, JSON


LKIF_OUTPUT_FILE = 'data/lkif_hierarchy.json'
YAGO_OUTPUT_FILE = 'data/yago_hierarchy.json'
OUTPUT_FILE = 'data/ontology.json'


LKIF_TO_YAGO_MAPPING = {
    'Hohfeldian_Power': ['wordnet_legal_power_105198427'],
    'Potestative_Right': ['wordnet_right_113341756'],
    'Immunity': ['wordnet_exemption_100213903'],
    'Legal_Document': [
        'wordnet_mandate_106556481',
        'wordnet_legal_document_106479665',
    ],
    'Regulation': [
        'wordnet_legal_code_106667792',
        'wordnet_law_106532330',
        'wordnet_law_108441203',
        'wordnet_legislative_act_106564387',
        'wordnet_legislation_106535222',
    ],
    'Contract': ['wordnet_contract_106520944'],
    'Treaty': ['wordnet_treaty_106773434'],
    'Code_of_Conduct': ['wordnet_code_of_conduct_105668095'],
    'Directive': [
        'wordnet_directive_107170080',
        'wordnet_pronouncement_106727616',
    ],
    'Decree': ['wordnet_decree_106539770'],
    'International_Agreement': ['wordnet_written_agreement_106771653'],
    'Legal_Doctrine': [
        'wikicat_Legal_doctrines_and_principles',
        'wordnet_common_law_108453722',
    ],
    'Precedent': ['wordnet_case_law_106535035'],
    'Resolution': ['wordnet_resolution_106511874'],
    'Proclamation': ['wordnet_proclamation_101266491'],
    'Right': [
        'wordnet_right_105174653',
        'wordnet_right_104850341',
    ],
    'Disallowed': ['wordnet_prohibition_106541820'],
    'Permission': ['wordnet_permission_106689297'],
    'Obligation': [
        'wordnet_obligation_106773150',
        'wordnet_duty_101129920',
    ],
    'Legislative_Body': [
        'wordnet_legislature_108163273',
        'wordnet_court_108329453',
    ],
    'Society': ['wordnet_association_108049401'],
    'Co-operative': ['wordnet_cooperative_101100877'],
    'Company': ['wordnet_company_108058098'],
    'Limited_Company': ['wordnet_limited_company_108185211'],
    'Corporation': ['wordnet_corporation_108059412'],
    'Foundation': ['wordnet_foundation_108406486'],
    'Delegation': ['wordnet_delegating_101140839'],
    'Legal_Speech_Act': ['wordnet_pleading_106559365'],
    'Decision': ['wordnet_decision_105838176'],
    'Professional_Legal_Role': [
        'wordnet_judge_110225219',
        'wordnet_judiciary_108166187',
        'wordnet_lawyer_110249950'
    ],
    'Natural_Person': ['wordnet_person_100007846'],
    'Statute': ['wordnet_legislative_act_106564387'],
    'Code': [
        'wordnet_legislative_act_106564387',
        'wordnet_legislation_106535222',
        'wordnet_law_106532330',
        'wordnet_law_108441203'
    ],
}


YAGO_TO_LKIF_MAPPING = {
    'wordnet_legal_power_105198427': ['Hohfeldian_Power'],
    'wordnet_right_113341756': ['Potestative_Right'],
    'wordnet_exemption_100213903': ['Immunity'],
    'wordnet_legal_document_106479665': ['Legal_Document'],
    'wordnet_legal_code_106667792': ['Regulation', 'Code'],
    'wordnet_law_106532330': ['Regulation', 'Code'],
    'wordnet_law_108441203': ['Regulation', 'Code'],
    'wordnet_legislative_act_106564387': ['Regulation', 'Code', 'Statute'],
    'wordnet_legislation_106535222': ['Regulation', 'Code'],
    'wordnet_contract_106520944': ['Contract'],
    'wordnet_treaty_106773434': ['Treaty'],
    'wordnet_code_of_conduct_105668095': ['Code_of_Conduct'],
    'wordnet_directive_107170080': ['Directive'],
    'wordnet_pronouncement_106727616': ['Directive'],
    'wordnet_decree_106539770': ['Decree'],
    'wordnet_written_agreement_106771653': ['International_Agreement'],
    'wordnet_mandate_106556481': ['Legal_Document'],
    'wikicat_Legal_doctrines_and_principles': ['Legal_Doctrine'],
    'wordnet_case_law_106535035': ['Precedent'],
    'wordnet_common_law_108453722': ['Legal_Doctrine'],
    'wordnet_resolution_106511874': ['Resolution'],
    'wordnet_proclamation_101266491': ['Proclamation'],
    'wordnet_right_105174653': ['Right'],
    'wordnet_right_104850341': ['Right'],
    'wordnet_prohibition_106541820': ['Disallowed'],
    'wordnet_permission_106689297': ['Permission'],
    'wordnet_obligation_106773150': ['Obligation'],
    'wordnet_duty_101129920': ['Obligation'],
    'wordnet_legislature_108163273': ['Legislative_Body'],
    'wordnet_court_108329453': ['Legislative_Body'],
    'wordnet_association_108049401': ['Society'],
    'wordnet_cooperative_101100877': ['Co-operative'],
    'wordnet_company_108058098': ['Company'],
    'wordnet_limited_company_108185211': ['Limited_Company'],
    'wordnet_corporation_108059412': ['Corporation'],
    'wordnet_foundation_108406486': ['Foundation'],
    'wordnet_delegating_101140839': ['Delegation'],
    'wordnet_pleading_106559365': ['Legal_Speech_Act'],
    'wordnet_decision_105838176': ['Decision'],
    'wordnet_judge_110225219': ['Professional_Legal_Role'],
    'wordnet_judiciary_108166187': ['Professional_Legal_Role'],
    'wordnet_lawyer_110249950': ['Professional_Legal_Role'],
    'wordnet_person_100007846': ['Natural_Person']
}


def query_sparql(query, endpoint):
    """Run a query again an SPARQL endpoint.

    Returns:
        A double list with only the values of each requested variable in
        the query. The first row in the result contains the name of the
        variables.
    """
    sparql = SPARQLWrapper(endpoint)
    sparql.setReturnFormat(JSON)

    sparql.setQuery(query)
    response = sparql.query().convert()
    bindings = response['results']['bindings']
    variables = response['head']['vars']
    result = [variables]
    for binding in bindings:
        row = []
        for variable in variables:
            row.append(binding[variable]['value'])
        result.append(row)
    return result
