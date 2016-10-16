/**
 * Stores the configuration of the dashboard. Updated with each change.
 * @type {object}
 */
var Dashboard = class {
    constructor() {
        this.showLKIF = true;
        this.showYAGO = true;
        // Set on html as well.
        this.defaultOptions = {
            lkif: {
                linkOpacity: 30,
                nodeOpacity: 100,
                selectedLabels: 3,
            },
            yago: {
                linkOpacity: 30,
                nodeOpacity: 100,
                selectedLabels: 2,
            },
        };
        this.yago = {
            nodeOpacity: this.defaultOptions.yago.nodeOpacity / 100,
            selectedLabels: this.defaultOptions.yago.selectedLabels,
        };
        this.lkif = {
            nodeOpacity: this.defaultOptions.lkif.nodeOpacity / 100,
            selectedLabels: this.defaultOptions.lkif.selectedLabels,
        };
    }

    get ontology() {
        if (this.showLKIF && this.showYAGO) {
            return 'data/ontology.json';
        } else if (this.showLKIF) {
            return 'data/lkif_hierarchy.json';
        } else if (this.showYAGO) {
            console.log('yago_hierarchy.json');
            return 'data/yago_hierarchy.json';
        }
        return 'data/sample_graph.json';
    }

    updateShowLkif(element) {
        this.showLKIF = element.checked;
        this.redrawVisualization();
    }

    updateShowYago(element) {
        this.showYAGO = element.checked;
        this.redrawVisualization();
    }

    updateLinks(value, ontology) {
        var selector = '.link .' + ontology + '-link';
        d3.selectAll(selector).style('opacity', value / 100);
    }

    updateNodes(value, ontology) {
        this[ontology].nodeOpacity = value / 100;
        var selector = '.node .' + ontology + ' circle';
        d3.selectAll(selector).style('opacity', value / 100);
        this.updateLabels(this[ontology].selectedLabels, ontology);
    }

    updateLabels(value, ontology) {
        var baseSelector = '.node .' + ontology;
        if (value == 1) {
            d3.selectAll(baseSelector + ' text').style('opacity', 0);
        } else if (value == 2) {
            d3.selectAll(baseSelector + ' .label-important')
                .style('opacity', this[ontology].nodeOpacity);
            d3.selectAll(baseSelector + ' .label-not-important')
                .style('opacity', 0);
        } else if (value == 3) {
            d3.selectAll(baseSelector + ' text')
                .style('opacity', this[ontology].nodeOpacity);
        }
        this[ontology].selectedLabels = value;
    }

    resetDefaultOptions() {
        // Lkif
        this.updateLinks(this.defaultOptions.lkif.linkOpacity, 'lkif');
        this._safeSetSlider('lkifLinkSlider',
                            this.defaultOptions.lkif.linkOpacity);
        this.updateNodes(this.defaultOptions.lkif.nodeOpacity, 'lkif');
        this._safeSetSlider('lkifNodeSlider',
                            this.defaultOptions.lkif.nodeOpacity);
        for (var option = 1; option <= 3; option++) {
            this._safeCheck(
                'lkif-labels-' + option,
                option == this.defaultOptions.lkif.selectedLabels);
        }
        this.updateLabels(this.defaultOptions.lkif.selectedLabels, 'lkif');

        // Yago
        this.updateLinks(this.defaultOptions.yago.linkOpacity, 'yago');
        this._safeSetSlider('yagoLinkSlider',
                            this.defaultOptions.yago.linkOpacity);
        this.updateNodes(this.defaultOptions.yago.nodeOpacity, 'yago');
        this._safeSetSlider('yagoNodeSlider',
                            this.defaultOptions.yago.nodeOpacity);
        for (var option = 1; option <= 3; option++) {
            this._safeCheck(
                'yago-labels-' + option,
                option == this.defaultOptions.yago.selectedLabels);
        }
        this.updateLabels(this.defaultOptions.yago.selectedLabels, 'yago');
    }

    _safeSetSlider(id, value) {
        var slider = document.getElementById(id).MaterialSlider;
        if (slider) {
            slider.change(value);
        }
    }

    _safeCheck(id, value) {
        var check = document.getElementById(id).parentElement.MaterialRadio;
        if (check && value) {
            check.check();
        } else if (check && !value) {
            check.uncheck();
        }
    }

    redrawVisualization() {
        d3.select('#d3_selectable_force_directed_graph').html('');
        selectableForceDirectedGraph(this);
    }
};
