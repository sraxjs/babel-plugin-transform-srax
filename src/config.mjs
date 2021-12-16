// 框架名字
export const FrameworkName = 'Srax';

// 判断是不是一个带有上下文方法的标识
export const ContextFunctionIdentification = [FrameworkName + '.Hook.context', 'Hook.context']

// Hook.effect
export const EffectIdentification = [FrameworkName + '.Hook.effect', 'Hook.effect'];

// 动态变量
// 在 return 或者 jsx {} 表达式外面包裹一个方法，形成闭包
export const CreateVariableContext = FrameworkName + '.Hook.CreateVariableContext';

// 函数上下文
export const CreateFunctionContext = FrameworkName + '.Hook.CreateFunctionContext';

// 带有 Hook.context 的方法的 return 包裹一层
export const CreateReturnContext = FrameworkName + '.Hook.CreateReturnContext';

// 框架路径，由此识别当前页面是否有用框架
// export const SraxNPMPath = '../../../../srax/src/main';
export const SraxNPMPath = '@sraxjs/srax';

// 所有 function 类型
export const AllFunctionType = ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'];

// {...attrs} 方法
export const DataJSXSpreadAttribute = 'srax-jsx-spread-attribute';