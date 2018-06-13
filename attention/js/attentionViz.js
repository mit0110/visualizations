var nouns = [
  ['abcdefg', 2, 0], ['lolo', 3, 0], ['l', 4, 0],
  ['abcdefg', 6, 0], ['lolo', 3, 0], ['l', 4, 0],
  ['abcdefg', 2, 0], ['lolo', 3, 0], ['l', 4, 0],
  ['abcdefg', 2, 0], ['lolo', 3, 0], ['laaaaaaaaaaaaaaaaaaaa', 4, 0],
  ['abcdefg', 2, 0], ['lolo', 3, 0], ['laaaaaaaaaaaaaaaaaaaa', 10, 0],
  ['abcdefg', 2, 0], ['lolo', 3, 1], ['leeeeeeeeee', 4, 1]];

chart = new TextChart(nouns, {useColor: true});
chart.draw("text-container");