import { MapExplorerPage } from './app.po';

describe('map-explorer App', function() {
  let page: MapExplorerPage;

  beforeEach(() => {
    page = new MapExplorerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
