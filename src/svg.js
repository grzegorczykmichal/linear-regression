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

const drawPoint = ({ svg, width, height, denormalize }) => {
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

const lineMaker = ({ width, height, denormalize }) => (fn, stroke = '#FFFF00') => {
  const x1 = -1;
  const x2 = 1;
  const y1 = fn(x1);
  const y2 = fn(x2);

  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', width / 2 + denormalize(x1));
  line.setAttribute('y1', height / 2 - denormalize(y1));
  line.setAttribute('x2', width / 2 + denormalize(x2));
  line.setAttribute('y2', height / 2 - denormalize(y2));
  line.setAttribute('style', `stroke:${stroke};stroke-width:1`);
  return line;
};

const drawLine = ({ svg, width, height, denormalize }) => {
  const createLine = lineMaker({ denormalize, width, height });
  return (fn, stroke = '#FFFF00') => {
    svg.appendChild(createLine(fn, stroke));
  }
};

const pathMaker = ({ width, height, denormalize }) => (fn, stroke = '#FFFF00') => {
  const x1 = -1;
  const x2 = 1;
  const step = 0.1;

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('style', `stroke:${stroke};stroke-width:1`);
  path.setAttribute('fill', `none`);

  const verticies = [];
  for (let i = x1; i <= x2; i += step) {
    const x = denormalize(i);
    const y = denormalize(fn(i));
    verticies.push([width / 2 + x, height / 2 - y]);
  }

  const d = verticies.reduce((d, v, i, { length }) => {
    if (i === 0) {
      d += `${v[0]} ${v[1]} `;
    } else {
      d += `L ${v[0]} ${v[1]} `;
    }

    return d;
  }, 'M ');

  path.setAttribute('d', d);

  return path;
};

const drawPath = ({ svg, width, height, denormalize }) => {
  const createPath = pathMaker({ denormalize, width, height });
  return (fn, stroke = '#FFFF00') => {
    svg.appendChild(createPath(fn, stroke));
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
    drawPath: drawPath(config),
    getXY: getXY(config),
    clear: clear(config)
  }
}

export default svg;