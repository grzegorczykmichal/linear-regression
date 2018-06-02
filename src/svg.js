import scale from './scale';

const NS = 'http://www.w3.org/2000/svg';

const pointMaker = ({ width, height, denormalize }) => (x, y) => {
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('cx', width / 2 + denormalize(x));
  dot.setAttribute('cy', height / 2 - denormalize(y));
  dot.setAttribute('r', 5);
  dot.setAttribute('fill', '#efefef');
  return dot;
};

const drawPoint = (
  {
    svg,
    width,
    height,
    denormalize
  }
) => {
  const createPoint = pointMaker({ denormalize, width, height });
  return (x, y) => {
    svg.appendChild(createPoint(x, y));
  }
};

const drawPoints = (config) => {
  const createPoint = pointMaker(config);
  return (points) => {
    points.forEach(({ x, y }) => {
      config.svg.appendChild(createPoint(x, y));
    })
  }
};

const lineMaker = ({ width, height, denormalize }) => (fn) => {
  const x1 = -1;
  const x2 = 1;
  const y1 = fn(x1);
  const y2 = fn(x2);

  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', width / 2 + denormalize(x1));
  line.setAttribute('y1', height / 2 - denormalize(y1));
  line.setAttribute('x2', width / 2 + denormalize(x2));
  line.setAttribute('y2', height / 2 - denormalize(y2));
  line.setAttribute('style', 'stroke:rgb(250,250,0);stroke-width:1');
  return line;
};

const drawLine = (
  {
    svg,
    width,
    height,
    denormalize
  }
) => {
  const createLine = lineMaker({ denormalize, width, height });
  return (fn) => {
    svg.appendChild(createLine(fn));
  }
};

const getXY = ({ svg, width, height, normalize }) => {
  const rect = svg.getBoundingClientRect();
  return (x, y) => {
    return {
      x: normalize(-width / 2 + (x - rect.x)),
      y: normalize(height / 2 - (y - rect.y))
    };
  }
}

const clear = ({ svg }) => {
  return () => {
    svg.innerHTML = '';
  }
}

const svg = (config) => {
  config.normalize = x => x;
  config.denormalize = x => x;
  if (typeof config.scale !== 'undefined') {
    config.normalize = scale(config.scale.mind, config.scale.maxd, config.scale.minn, config.scale.maxn);
    config.denormalize = scale(config.scale.minn, config.scale.maxn, config.scale.mind, config.scale.maxd);
  }

  return {
    drawPoint: drawPoint(config),
    drawPoints: drawPoints(config),
    drawLine: drawLine(config),
    getXY: getXY(config),
    clear: clear(config)
  }
}

export default svg;