import { CallExpression } from './visitor/CallExpression.mjs';
import { ImportDeclaration } from './visitor/ImportDeclaration.mjs';
import { JSXExpressionContainer } from './visitor/JSXExpressionContainer.mjs';
import { JSXSpreadAttribute } from './visitor/JSXSpreadAttribute.mjs';
import { ArrowFunctionExpression } from './visitor/ArrowFunctionExpression.mjs';
import Utils from './utils.mjs';

export default function (babel) {
    return {
        visitor: {
            // {...attrs} 表达式处理
            JSXSpreadAttribute(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    JSXSpreadAttribute(path, ref);
                }
            },
            // {} 表达式处理
            // 在所有 JSX 表达式外层添加一个方法
            JSXExpressionContainer(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    JSXExpressionContainer(path);
                }
            },
            // 执行表达式
            // Hook.state();
            CallExpression(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    CallExpression(path, ref);
                }
            },
            ArrowFunctionExpression(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    ArrowFunctionExpression(path, ref);
                }
            },
            FunctionExpression(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    ArrowFunctionExpression(path, ref);
                }
            },
            FunctionDeclaration(path, ref) {
                if (Utils.isUseSrax(ref)) {
                    ArrowFunctionExpression(path, ref);
                }
            },
            // import 处理
            // 如果 import 没有引入 Srax，则添加上
            ImportDeclaration(path, ref) {
                ImportDeclaration(path, ref);
            }
        }
    }
};