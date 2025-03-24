module.exports = {
  // ...existing code...
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  output: {
    // ...existing code...
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  // ...existing code...
};
