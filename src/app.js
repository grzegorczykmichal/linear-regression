import svg from './svg';
import scale from './scale';
import { poly, polyString } from './poly';
import * as tf from '@tensorflow/tfjs';
import d3 from 'd3';
import functionPlot from 'function-plot';

const LEARNING_STEPS = 10;

let dots = [];

const learningRate = 0.5;
const optimizer = tf.train.sgd(learningRate);

const predict = x => (...args) => {
  const y = args.reverse().reduce((acc, current, index) => {
    const deg = tf.scalar(index);
    return acc.add(x.pow(deg).mul(current));
  }, tf.scalar(0));
  return y;
};
const loss = (predictions, labels) => predictions.sub(labels).square().mean();;

const svgElement = document.getElementById('svg')
const HEIGHT = svgElement.getAttribute('height');
const WIDTH = svgElement.getAttribute('width');
const denormalize = scale(-1, 1, -WIDTH / 2, WIDTH / 2);
const s = svg({
  svg: svgElement,
  width: WIDTH,
  height: HEIGHT,
  scale: {
    mind: -WIDTH / 2,
    maxd: WIDTH / 2,
    minn: -1,
    maxn: 1
  }
});

const addPoint = (point) => {
  dots.push(point);
};

const renderer = (svg) => {
  const colors = ['#FF0000', '#0000FF'];
  return (fn) => {
    // svg.clear();
    svg.drawPoints(dots);
    svg.drawPath(fn.fn);

    functionPlot({
      target: '#quadratic',
      width: WIDTH,
      height: HEIGHT,
      grid: true,
      yAxis: { domain: [-1, 1] },
      xAxis: { domain: [-1, 1] },
      data: [
        {
          fn: fn.toString(),
          color: '#323232',
        },
      ]
    })
  }
}

const optimize = (optimizer, loss, predictions, labels) => {

  const a = tf.scalar(Math.random()).variable();
  const b = tf.scalar(Math.random()).variable();
  const c = tf.scalar(Math.random()).variable();
  const d = tf.scalar(Math.random()).variable();
  const e = tf.scalar(Math.random()).variable();
  s.clear();
  for (let i = 0; i < LEARNING_STEPS; i++) {
    optimizer.minimize(() => loss(predictions(a, b, c, d, e), labels));

    const aData = a.dataSync()[0];
    const bData = b.dataSync()[0];
    const cData = c.dataSync()[0];
    const dData = d.dataSync()[0];
    const eData = e.dataSync()[0];
    s.drawPath(x => {
      return poly(aData, bData, cData, dData, eData)(x);
    });
  }

  const aData = a.dataSync()[0];
  const bData = b.dataSync()[0];
  const cData = c.dataSync()[0];
  const dData = d.dataSync()[0];
  const eData = e.dataSync()[0];

  return {
    fn: x => {
      return poly(aData, bData, cData, dData, eData)(x);
    },
    toString: () => {
      return polyString(aData, bData, cData, dData, eData);
    },
  };

}

const train = (data) => {
  const trainingData = tf.tensor1d(data.map(({ x }) => x));
  const labels = tf.tensor1d(data.map(({ x, y }) => y));
  const predictions = predict(trainingData);

  return optimize(optimizer, loss, predictions, labels);
}

const render = renderer(s);

const run = () => {
  tf.tidy(() => {
    const result = train(dots);
    render(result);
  });
}

svgElement.addEventListener('click', e => {
  addPoint(s.getXY(e.x, e.y));
  run();
})