const getDefaultInputValues = (properties: Record<string, any>) => {
    return Object?.entries(properties).reduce((acc, [key, prop]) => {
        if (prop.default !== undefined) acc[key] = prop.default;
        return acc;
    }, {} as Record<string, any>);
};

export default getDefaultInputValues;