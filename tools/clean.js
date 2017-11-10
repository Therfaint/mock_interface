/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { cleanDir } from './lib/fs';
const targetPath = '../shield/web/src/main/resources/statics';
const htmlPath = targetPath + '/pages';
const staticPath = targetPath + '/resources';

/**
 * Cleans up the output (build) directory.
 */
function clean() {
  return Promise.all([
    cleanDir(htmlPath + '/*', {
      nosort: true,
      dot: true,
      ignore: [],
    }),

    cleanDir(staticPath + '/*', {
      nosort: true,
      dot: true,
      ignore: [],
    }),
  ]);
}

export default clean;
