var deviceReadyPromise = new Promise<void>((resolve, reject) => {
  if (window.cordova) {
    document.addEventListener('deviceready', () => {
      resolve();
    }, false);
  } else {
    resolve();
  }
});

export default deviceReadyPromise;