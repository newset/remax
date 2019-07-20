import * as fs from 'fs';
import parse from '@tarojs/taroize';
import generate from '@babel/generator';

export default function transformTemplate(id: string) {
  const template = fs.readFileSync(id).toString();
  const result = parse({
    wxml: template,
    path: id,
  });

  const output = generate(
    result.ast,
    {
      /* options */
    },
    template,
  );
  console.log(output);
}
