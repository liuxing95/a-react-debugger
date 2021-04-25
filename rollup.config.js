import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const plugins = [
  typescript({
    tsconfig: 'tsconfig.json',
    removeComments: true,
    useTsconfigDeclarationDir: true,
  }),
  terser({
    include: ['index.js'],
  }),
]

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.umd.js', format: 'umd', name: 'index', sourcemap: true },
    { file: 'dist/index.js', format: 'esm', sourcemap: true },
  ],
  plugins,
}
