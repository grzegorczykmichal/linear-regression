const scale = (minD, maxD, minN, maxN) => x => {
    return ((x - minD) * (maxN - minN)) / (maxD - minD) + minN;
};

export default scale;
