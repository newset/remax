import * as rollup from 'rollup';
import * as path from 'path';
import miniComponentTransform from '../src';

function executeBundle(bundle: rollup.RollupBuild) {
  return bundle.generate({
    format: 'esm',
  });
}

describe('rollup-plugin-mini-component-transform', () => {
  it('transforms basic component', function() {
    return rollup
      .rollup({
        input: path.resolve(__dirname, './samples/basic/index.js'),
        plugins: [miniComponentTransform()],
      })
      .then(executeBundle)
      .then(generated => {
        console.log(generated);
      });
  });
});
