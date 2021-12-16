import Types from '@babel/Types';
import Utils from '../utils.mjs';
import {
    CreateVariableContext,
    DataJSXSpreadAttribute,
    ContextFunctionIdentification,
    CreateReturnContext,
    EffectIdentification,
    CreateFunctionContext,
    AllFunctionType
} from '../config.mjs';

// 外面嵌套一层方法，形成闭包
export const CreateVariableContextHandle = (path, node) => {
    let contextName = path.SraxFunctionContextName || Types.identifier(undefined);
    return Types.callExpression(
        Types.identifier(CreateVariableContext),
        [
            Types.thisExpression(),
            contextName,
            Types.functionExpression(
                null,
                [],
                Types.blockStatement([
                    Types.returnStatement(node)
                ])
            )
        ]
    );
}

// JSX 指令处理
const JSXInstructHandle = (path) => {
    let node = path.node;
    switch (node?.name?.name) {
        case 's-if':
            let condition = node.value.expression;
            let element = path.parentPath.parentPath;
            if (element.type === 'JSXElement') {
                element.replaceWith(
                    Types.jsxExpressionContainer(
                        Types.logicalExpression('&&', condition, element.node)
                    )
                )
            }
            path.remove();
            break;
    }
}

// 处理 JSX 属性
const JSXAttribute = function (path, state) {
    // if 指令
    JSXInstructHandle(path);
}

// <div>{}</div> 表达式
const JSXExpressionContainer = function (path, state) {

    let rootPath = this.rootPath;
    let parent = path.parentPath;
    let parentNode = parent.node;

    // 必须是同一个 function
    if (path.getFunctionParent() !== rootPath) {
        return;
    }

    if (parent.type === 'JSXAttribute' && parentNode.type === 'JSXAttribute') {
        if (parentNode.name.type === 'JSXIdentifier') {
            // 属性 on 开始，则说明是事件
            if (parentNode.name.name.search(/^on[A-Z]/g) > -1) {
                return;
            }
            // key 也不解析
            if (parentNode.name.name === 'key') {
                return;
            }
        }
    }

    // 空表达式
    if (path.node.expression.type === 'JSXEmptyExpression') {
        return;
    }

    // 防止出现嵌套 JSXCallExpressionName
    if (path.node.expression.type === 'CallExpression' && path.node.expression.callee.name === CreateVariableContext) {
        return;
    }

    path.node.expression = CreateVariableContextHandle(rootPath, path.node.expression);

}

// <div {...x}></div> 表达式
const JSXSpreadAttribute = (path, state) => {

    // 必须是同一个 function
    if (path.getFunctionParent() !== rootPath) {
        return;
    }

    path.replaceWith(
        Types.JSXAttribute(
            Types.JSXIdentifier(DataJSXSpreadAttribute),
            Types.JSXExpressionContainer(
                CreateVariableContextHandle(this.rootPath, path.node.argument)
            )
        )
    );

}

// 添加函数上下文
const AddFunctionContext = (path, customContext) => {

    // Hook.context(context);
    if (customContext) {
        path.SraxFunctionContextName = customContext;
        return;
    }

    let node = path.node;
    let contextName = path.scope.generateUidIdentifier('context');
    let fnName = path?.parent?.id?.name || 'anonymous';

    // 如果是 () => xxx;
    // 则转化成 () => {return xxx;};
    if (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement') {
        node.body = Types.blockStatement([Types.returnStatement(node.body)]);
    }

    // 如果是 function
    if (AllFunctionType.indexOf(node.type) > -1) {
        node.body.body.unshift(Types.variableDeclaration('let', [
            Types.variableDeclarator(contextName, Types.callExpression(Types.identifier(CreateFunctionContext), [Types.stringLiteral(fnName)]))
        ]));
    }

    path.SraxFunctionContextName = contextName;

}

// 找到所有 call 方法
const CallExpression = function (path, state) {

    let rootPath = this.rootPath;
    let parentFunction = path.getFunctionParent();

    // 如果 Hook.context
    if (Utils.IsUseHook(path, ContextFunctionIdentification) && !rootPath.isContextFunction) {

        // 并且是非嵌套结构
        // () => {() => {}}
        if (parentFunction === rootPath) {
            AddFunctionContext(parentFunction, path.node.arguments[0]);
            rootPath.isContextFunction = true;
            if (!path.node.arguments[0]) {
                path.node.arguments.unshift(parentFunction.SraxFunctionContextName);
            }
        }

    }

    // 如果 Hook.effect
    if (Utils.IsUseHook(path, EffectIdentification)) {
        if (parentFunction.SraxFunctionContextName) {
            if (!path.node.arguments[0]) {
                path.node.arguments[0] = Types.nullLiteral();
            }
            if (!path.node.arguments[1]) {
                path.node.arguments[1] = Types.nullLiteral();
            }
            path.node.arguments[2] = parentFunction.SraxFunctionContextName;
        }
    }

}

// return
const ReturnStatement = function (path) {

    let node = path.node;
    let argument = node.argument;
    let rootPath = this.rootPath;
    let contextName = rootPath.SraxFunctionContextName || Types.identifier(undefined);

    if (node.SraxIsHandle) {
        return;
    }

    // 必须是同一个 function
    if (path.getFunctionParent() !== rootPath) {
        return;
    }

    node.SraxIsHandle = true;

    let createJSXContext = (expression) => {
        return Types.callExpression(
            Types.identifier(CreateReturnContext),
            [
                expression,
                contextName
            ]
        );
    }

    let objectExpression = (argument) => {
        argument.properties.forEach((v, e) => {
            if (v.value.type === 'Identifier') {
                v.value = CreateVariableContextHandle(rootPath, v.value);
            }
        });
        node.argument = createJSXContext(argument);
    }

    let arrayExpression = (argument) => {
        argument.elements.forEach((v, i) => {
            if (v.type === 'Identifier') {
                argument.elements[i] = CreateVariableContextHandle(rootPath, v);
            }
        });
        node.argument = createJSXContext(argument);
    }

    if (argument.type === 'JSXElement') {
        node.argument = createJSXContext(Types.arrowFunctionExpression([], argument))
    } else {
        switch (argument.type) {
            case 'ObjectExpression':
                objectExpression(argument);
                break;
            case 'ArrayExpression':
                // 本身
                arrayExpression(argument);
                path.traverse({
                    ArrayExpression(path) {
                        arrayExpression(path.node)
                    },
                    ObjectExpression(path) {
                        objectExpression(path.node);
                    }
                });
                break;
            default:
                node.argument = createJSXContext(CreateVariableContextHandle(rootPath, argument));
        }
    }

}

export const FunctionExpression = (path, state) => {

    if (path.node.isSraxHandle) {
        return;
    }

    path.node.isSraxHandle = true;

    path.traverse({
        // 找到 Hook.context
        CallExpression: CallExpression
    }, {
        rootPath: path
    });

    // 如果是一个有状态的函数
    // 处理 return
    // 有状态的 return 一定是可以改变的
    if (path.isContextFunction) {

        // 处理 if 指令
        path.traverse({
            JSXAttribute: JSXAttribute
        }, { rootPath: path });

        path.traverse({
            // return
            ReturnStatement: {
                exit: ReturnStatement
            },
            // {} 表达式处理
            // 在所有 JSX表达式外层添加一个方法
            JSXExpressionContainer: JSXExpressionContainer,
            // {...attrs} 表达式处理
            JSXSpreadAttribute: JSXSpreadAttribute
        }, { rootPath: path });

    }

}