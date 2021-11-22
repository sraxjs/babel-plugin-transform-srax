import Types from '@babel/Types';
import Utils from '../utils.mjs';
import { FrameworkName, CreateJSXExpressionName, CreateFunctionParamInterceptorName, CreateFunctionContextVarName, CreateFunctionContextName } from '../config.mjs';
import { CreateCallExpressionReturn } from './JSXExpressionContainer.mjs';

// 检查当前节点是否是 Hook.state
const IsUseHookState = (path, ref) => {

    let node = path.node;

    // 先找到是否有 Hook.state, Srax.Hook.state 使用
    if (node.type === 'CallExpression') {
        let callee = node.callee;
        if (callee?.type === 'MemberExpression') {
            if (callee.property.name === 'state') {
                // 如果是 Srax.Hook.state
                // 否则如果是 Hook.state
                if (callee.object.type === 'MemberExpression' && callee.object.property.name === 'Hook' && callee.object.object.name === FrameworkName) {
                    return true;
                } else if (callee.object.type === 'Identifier' && callee.object.name === 'Hook') {
                    return true;
                }
            }
        }
    }

    return false;

}

// 检查当前节点是否是 {} 表达式
const IsCallExpression = (path, ref, callName) => {

    let node = path.node;

    if (node.type === 'CallExpression') {
        let callee = node.callee;
        if (callee?.type === 'Identifier') {
            if (callee.name === callName) {
                return true;
            }
        }
    }

    return false;

}

// 移除函数上的上下文传递
const RemoveContext = (path, ref) => {
    path.node.arguments = [path.node.arguments[0]];
}

// 在函数 return 包裹一层 CreateSraxFunctionName
const AddCreateSraxFunction = (path, ref) => {

    let node = path.node;

    // 如果已经执行过
    if (node?.body?.SraxOptions?.isSraxFunction) {
        return;
    }

    node.body.body.forEach((v) => {
        if (v.type === 'ReturnStatement') {
            // 如果在有状态的函数 return 时，不是一个 JSX 标签，则添加一个 CreateJSXExpressionName
            if (v.argument.type !== 'JSXElement') {
                v.argument = CreateCallExpressionReturn(v.argument);
            }
            v.argument = Types.callExpression(
                Types.identifier(CreateFunctionContextVarName + '.JSX'),
                [v.argument]
            );
        }
    });

}

// 在函数第一行添加上下文
const AddFunctionContext = (path, ref) => {

    let node = path.node;

    // 如果已经执行过
    if (node?.body?.SraxOptions?.isSraxFunction) {
        return;
    }

    // 添加上下文
    node?.body?.body?.unshift(
        Types.variableDeclaration(
            'var',
            [
                Types.variableDeclarator(
                    Types.identifier(CreateFunctionContextVarName),
                    Types.callExpression(
                        Types.identifier(CreateFunctionContextName),
                        []
                    )
                )
            ]
        )
    );

}

// 添加 Hook.state 上下文
const AddHookStateContext = (path, ref) => {

    let param1 = path.node.arguments[0] || Types.identifier('undefined');
    let param2 = Types.identifier(CreateFunctionContextVarName)

    if (path?.node?.SraxOptions?.isAddFunctionContext) {
        return;
    }

    path.node.arguments = [param1, param2];

    // 标记已经处理过
    Utils.initSraxOptions(path.node, 'isAddFunctionContext', true);

}

export const CallExpression = (path, ref) => {

    // Hook.state
    let isUseHookState = IsUseHookState(path, ref);
    let parentFunction = Utils.getParentFunctionExpression(path, ref);

    // JSX {} 表达式
    // let isJSXCallExpression = IsCallExpression(path, ref, CreateJSXExpressionName);
    // // 当前是不是 param 拦截器
    // let isParamInterceptorName = IsCallExpression(path, ref, CreateFunctionParamInterceptorName);

    // // 当前是不是带 Hook.state 的函数
    // let isSraxFunction = parentFunction?.node?.body?.SraxOptions?.isSraxFunction;

    // // 检查是否是 JSX {} 表达式
    // // 如果是则判断当前函数内是否有使用 Hook.state
    // // 因为执行顺序的原因，需要在判断下，如果不是则删除上下文
    // if (isJSXCallExpression && !isSraxFunction) {
    //     RemoveContext(path, ref);
    // }

    // // 检查是不是 params 拦截器
    // if (isParamInterceptorName && !isSraxFunction) {
    //     RemoveContext(path, ref);
    // }

    if (isUseHookState) {

        // Hook.state 是每个都添加
        AddHookStateContext(path);

        AddFunctionContext(parentFunction);
        AddCreateSraxFunction(parentFunction);

        // 标记已经处理过
        Utils.initSraxOptions(parentFunction.node.body, 'isSraxFunction', true);

    }

}