import Types from '@babel/Types';
import { FrameworkName, SraxNPMPath } from '../config.mjs';

export const ImportDeclaration = (path, ref) => {
    let specifiers = path.node.specifiers;
    let isSrax = false;
    let isUseSrax = false;
    if (specifiers) {
        // 是否有引入 Srax 框架
        if (path.node.source?.value === SraxNPMPath) {
            isUseSrax = true;
            for (let i = 0; i < specifiers.length; i++) {
                if (specifiers[i].local.name === FrameworkName) {
                    isSrax = true;
                    break;
                }
            }
            // 存起来，标识当前页面有引入 srax 框架
            ref.SraxOptions = {
                isUseSrax: true
            }
            // 如果没有引入 srax
            if (!isSrax) {
                specifiers.push(
                    Types.importSpecifier(
                        Types.identifier(FrameworkName),
                        Types.identifier(FrameworkName)
                    )
                );
            }
        }
    }
}