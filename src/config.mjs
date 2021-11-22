// 框架名字
export const FrameworkName = 'Srax';

// JSX 表达式方法
export const CreateJSXExpressionName = FrameworkName + '.Hook.createJSXExpression';

// 框架函数方法
export const CreateSraxFunctionName = FrameworkName + '.Hook.createSraxFunction';

// params 方法
export const CreateFunctionParamInterceptorName = FrameworkName + '.Hook.createFunctionParamInterceptor';

// 页面上下文方法
export const CreateFunctionContextName = FrameworkName + '.Hook.createFunctionContext';
export const CreateFunctionContextVarName = '$$' + FrameworkName + 'HookFunctionContext';

// {...attrs} 方法
export const DataJSXSpreadAttribute = 'srax-jsx-spread-attribute';
// 框架路径，由此识别当前页面是否有用框架
// export const SraxNPMPath = '../../srax/main';
export const SraxNPMPath = '@sraxjs/srax';

// 所有 function 类型
export const AllFunctionType = ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'];