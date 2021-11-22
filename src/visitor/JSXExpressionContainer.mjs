import Types from '@babel/Types';
import { CreateJSXExpressionName } from '../config.mjs';

const JSXExpressionContainerHandle = (path, ref) => {

    let parent = path.context.parentPath;
    let parentNode = parent.node;

    if (parent.type === 'JSXAttribute' && parentNode.type === 'JSXAttribute') {
        let parentParent = parent.context.parentPath;
        let parentParentNode = parentParent.node;
        // 当前标签是开头是大写，说明是函数调用
        // if (parentParent.type === 'JSXOpeningElement' && parentParentNode.name.name.search(/^[A-Z]/g) > -1) {
        //     return;
        // }
        // 属性 on 开始，则说明是事件
        if (parentNode.name.type === 'JSXIdentifier' && parentNode.name.name.search(/^on[A-Z]/g) > -1) {
            return;
        }
    }

    // 空表达式
    if (path.node.expression.type === 'JSXEmptyExpression') {
        return;
    }

    // 防止出现嵌套 CreateJSXExpressionName
    if (path.node.expression.type === 'CallExpression' && path.node.expression.callee.name === CreateJSXExpressionName) {
        return;
    }

    path.node.expression = CreateCallExpressionReturn(path.node.expression);

}

export const CreateCallExpressionReturn = function (ret) {
    return Types.callExpression(
        Types.identifier(CreateJSXExpressionName),
        [
            Types.arrowFunctionExpression(
                [],
                Types.blockStatement(
                    [Types.returnStatement(ret)],
                    []
                )
            )
        ]
    );
}

export const JSXExpressionContainer = (path, ref) => {
    JSXExpressionContainerHandle(path, ref);
}