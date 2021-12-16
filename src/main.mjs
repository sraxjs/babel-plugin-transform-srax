import { ImportDeclaration } from './visitor/ImportDeclaration.mjs';
import { FunctionExpression } from './visitor/FunctionExpression.mjs';
import Utils from './utils.mjs';

export default function (babel) {
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                if (Utils.IsUseSrax(state)) {
                    FunctionExpression(path, state);
                }
            },
            FunctionExpression(path, state) {
                if (Utils.IsUseSrax(state)) {
                    FunctionExpression(path, state);
                }
            },
            FunctionDeclaration(path, state) {
                if (Utils.IsUseSrax(state)) {
                    FunctionExpression(path, state);
                }
            },
            // import 处理
            // 如果 import 没有引入 Srax，则添加上
            ImportDeclaration(path, state) {
                ImportDeclaration(path, state);
            }
        }
    }
};