import * as path from 'path';
import * as fs from 'fs';
import { Plugin, OutputOptions } from 'rollup';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import transformTemplate from './transformTemplate';

function isMiniComponent(id: string) {
  const manifestFile = id.replace(/\.js$/, '.json');
  if (fs.existsSync(manifestFile)) {
    try {
      const manifest = require(manifestFile);
      if (manifest.component) {
        return true;
      }
    } catch (e) {
      // ignore
    }
  }
  return false;
}

function tryResolve(source: string, importer: string) {
  let id = path.resolve(path.dirname(importer), source);
  if (fs.existsSync(id) && !fs.lstatSync(id).isDirectory()) {
    return id;
  }
  id = path.join(id, 'index.js');
  if (fs.existsSync(id)) {
    return id;
  }
}

function getTemplate(id: string) {
  const templateFile = id.replace(/\.js$/, '.axml');
  return fs.readFileSync(templateFile).toString();
}

export default function miniComponentTransform(): Plugin {
  return {
    name: 'mini-component-transform',
    resolveId(source, importer) {
      if (importer) {
        const id = tryResolve(source, importer);
        if (id && isMiniComponent(id)) {
          return id;
        }
      }
      return null;
    },
    transform(code, id) {
      if (isMiniComponent(id)) {
        const pageName = path.basename(id, '.js');
        const ast = this.parse(code, {
          ecmaVersion: 6,
          sourceType: 'module',
        });
        const s = new MagicString(code);

        walk(ast as any, {
          enter(node) {
            if (node.type === 'CallExpression' && node.callee.name === 'Component') {
              s.prependLeft(node.start, 'export default ');
              s.prependLeft(0, `import view from './${pageName}.axml';\n\n`);
            }
          },
        });

        console.log(s.toString());
        return s.toString();
      }
      return null;
    },
    load(id) {
      if (id.endsWith('.axml')) {
        transformTemplate(id);
        return 'export default 42';
      }
      return null;
    },
  };
}
