import Types from '@babel/Types';
import { CreateFunctionParamInterceptorName } from '../config.mjs';

const VariableDeclaration = (path, value, defaultValue) => {
    path?.node?.body?.body?.unshift(
        Types.expressionStatement(
            Types.assignmentExpression(
                '=',
                Types.identifier(value),
                Types.callExpression(
                    Types.identifier(CreateFunctionParamInterceptorName),
                    [
                        Types.identifier(value),
                        Types.FunctionExpression(
                            null,
                            [],
                            Types.blockStatement(
                                [
                                    Types.expressionStatement(
                                        Types.assignmentExpression(
                                            '=',
                                            Types.identifier(value),
                                            Types.identifier('arguments[0]')
                                        )
                                    )
                                ],
                                []
                            )
                        )
                    ]
                )
            )
        )
    );
}

export const ArrowFunctionExpression = (path, ref) => {

    let params = path.node.params;

    params?.forEach((v, i) => {

        let name;

        switch (v.type) {
            case 'AssignmentPattern':
                VariableDeclaration(path, v.left.name, v.right);
                break;
            case 'Identifier':
                VariableDeclaration(path, v.name);
                break;
            case 'RestElement':
                VariableDeclaration(path, v.argument.name);
                break;
            default:
        }

    });

}