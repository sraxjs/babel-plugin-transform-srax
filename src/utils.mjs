export const IsUseSrax = (ref) => {
    return ref?.SraxOptions?.isUseSrax || false;
}

export const MemberExpressionToString = (me, suffix = '') => {

    let property = me.property;
    let object = me.object;

    suffix = object.name + '.' + property.name + suffix;

    switch (object.type) {
        case 'Identifier':
            return suffix;
        case 'MemberExpression':
            return MemberExpressionToString(object, '.' + suffix);
    }

}

// 检查是否使用了某些 Hook
export const IsUseHook = (path, Hooks) => {

    let node = path.node;

    if (node.type === 'CallExpression') {
        let callee = node.callee;
        if (callee?.type === 'MemberExpression') {
            let meString = MemberExpressionToString(callee);
            if (Hooks.indexOf(meString) > -1) {
                return true;
            }
        }
    }

    return false;

};

// 在表达式上插入标志，用于以后判断免得嵌套递归
export const AddSraxHandle = (expression) => {
    expression.isSraxHandle = true;
    return expression;
}

export default {
    IsUseSrax,
    MemberExpressionToString,
    IsUseHook,
    AddSraxHandle
}