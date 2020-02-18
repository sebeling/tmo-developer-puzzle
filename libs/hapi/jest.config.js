module.exports = {
  name: 'hapi-stocks',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/hapi/stocks',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

