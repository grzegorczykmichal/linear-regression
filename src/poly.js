export const poly = (...args) => x => {
  const y = args.reverse().reduce((acc, current, deg) => {
    acc += Math.pow(x, deg) * current;
    return acc
  }, 0);
  return y;
};

export const polyString = (...args) => {
  const y = args.reverse().reduce((acc, current, degree, { length }) => {
    acc += `${current}*x^${degree}`;
    acc += degree === length - 1 ? '' : '+';
    return acc
  }, '');
  return y;
};