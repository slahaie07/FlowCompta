import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const bundled = require('./serverless.cjs');

export default bundled.default ?? bundled;
