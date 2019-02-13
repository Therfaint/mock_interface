import Promise from 'bluebird';

const targetPath = '../shield/web/src/main/resources/statics';
const htmlPath = targetPath + '/pages';
const staticPath = targetPath + '/resources';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
  const ncp = Promise.promisify(require('ncp'));

  await Promise.all([
    await ncp('static/resources', staticPath),
    await ncp('dist', staticPath + '/js'),
    await ncp('dist', 'static/resources/js'),
    await ncp('static/pages', htmlPath),
  ]);

  // await copyFile('static/dist/' + entr + '.js', entryObj[entr] + entr + '.js');


  // return new Promise((resolve, reject) => {
  //   for (var entr in entryObj) {
  //     copyFile('tools/dist/' + entr + '.js', entryObj[entr] + entr + '.js');
  //   }
  //
  // });

}

export default copy;
