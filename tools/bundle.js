/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import webpack from 'webpack';
import webpackConfig from '../webpack.config';
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../README.md');
/**
 * Creates application bundles from the source files.
 */
async function bundle() {
  return new Promise((resolve, reject) => {
      fs.appendFile(filePath, 'Hello World', (err) => {
          if (err) {
              reject(err);
          }
          console.log('bundle success');
          resolve();
      });
  });
}

export default bundle;
