mkdir -p data
echo "Downloading YAGO hierarchy."
python data_generators/get_yago.py
echo "Downloading LKIF hierarchy."
python data_generators/get_lkif.py
echo "Combining ontologies"
python data_generators/mix_ontologies.py