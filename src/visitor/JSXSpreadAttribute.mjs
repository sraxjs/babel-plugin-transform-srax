import Types from '@babel/Types';
import Utils from '../utils.mjs';
import { DataJSXSpreadAttribute } from '../config.mjs';
import { CreateCallExpressionReturn } from './JSXExpressionContainer.mjs';

let DataJSXSpreadAttributeCount = 0;

const JSXSpreadAttributeHandle = (path,ref) => {

    let parent = path.context.parentPath;
    let parentNode = parent.node;

    // 当前标签是开头是大写，说明是函数调用
    if (parent.type === 'JSXOpeningElement' && parentNode.name.name.search(/^[A-Z]/g) > -1) {
        return;
    }

    path.replaceWith(
        Types.JSXAttribute(
            Types.JSXIdentifier(DataJSXSpreadAttribute + '-' + DataJSXSpreadAttributeCount++),
            Types.JSXExpressionContainer(
                CreateCallExpressionReturn(path.node.argument)
            )
        )
    );

}

export const JSXSpreadAttribute = (path, ref) => {

    let parentFunction = Utils.getParentFunctionExpression(path);

    if (Utils.isSraxFunction(parentFunction)) {
        JSXSpreadAttributeHandle(path, ref);
    }

}