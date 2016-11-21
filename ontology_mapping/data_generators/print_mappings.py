import utils


def main():
    print 'LKIF to YAGO'
    mapping = utils.get_likf_to_yago_mapping()
    for key, value in mapping.iteritems():
        print key, value

    print 'YAGO to LKIF'
    mapping = utils.get_yago_to_lkif_mapping()
    for key, value in mapping.iteritems():
        print key, value


if __name__ == '__main__':
    main()
