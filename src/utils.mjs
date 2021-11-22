import { AllFunctionType } from './config.mjs';

const IsUseSrax = (ref) => {
    return ref?.SraxOptions?.isUseSrax || false;
}

const GetParentFunctionExpression = (path, ref) => {
    let parent = path?.context?.parentPath;
    if (parent && AllFunctionType.indexOf(parent.type) === -1) {
        return GetParentFunctionExpression(parent);
    }
    return parent;
}

const InitSraxOptions = (path, obj, value) => {
    if (!path.SraxOptions) {
        path.SraxOptions = {};
    }
    if (!path.SraxOptions[obj]) {
        path.SraxOptions[obj] = value;
    }
    return path;
}

const IsSraxFunction = (path) => {
    if (AllFunctionType.indexOf(path?.node?.type) > -1 && path?.node?.body?.SraxOptions?.isSraxFunction) {
        return true;
    }
    return false;
}

export default {
    isUseSrax: IsUseSrax,
    getParentFunctionExpression: GetParentFunctionExpression,
    initSraxOptions: InitSraxOptions,
    isSraxFunction: IsSraxFunction
}