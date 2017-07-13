# Tree Arguments Display for Annotations

Basic version. To run:

- Set virtualenv for python 2.7 and install `networkx`.
- Copy your `.ann` file to `data/`
```
$ cd data/
$ python ann2json.py ANNOTATION_FILENAME
$ cd ../dndTree/
$ python -m SimpleHTTPServer 8000
```

You should see your code running on localhost:8000
 
To add new buttons, modify the file `tada/dndTree/index.html` adding a new button and the path to the new annotation file.
