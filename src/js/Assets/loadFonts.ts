var fontsPromise = new Promise<void>((resolve, reject) => {
  const loader = new PIXI.loaders.Loader();

  loader.add('Constantia', 'fonts/Constantia/Constantia.fnt');

  loader.load((loader: PIXI.loaders.Loader, resources: any) => {
    resolve();
  });
});

export default fontsPromise;