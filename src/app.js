import svg from './svg';
import scale from './scale';
import * as tf from '@tensorflow/tfjs';

const NS = 'http://www.w3.org/2000/svg';
const MIN = -400;
const MAX = 400;
const HEIGHT = 800;
const WIDTH = 800;

const LERNING_STEPS = 100;

let dots = [{ x: 1, y: 1 }, { x: -1, y: -1 }];

const a = tf.scalar(Math.random()).variable();
const b = tf.scalar(Math.random()).variable();

const learningRate = 0.01;
const optimizer = tf.train.sgd(learningRate);

const predict = x => x.mul(a).add(b);
const loss = (predictions, labels) => predictions.sub(labels).square().mean(); // tf.losses.meanSquaredError(predictions, labels);

const svgElement = document.getElementById('svg')

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
  return (fn) => {
    svg.clear();
    svg.drawPoints(dots);
    svg.drawLine(fn);
  }
}

const train = (data) => {
  const trainingData = tf.tensor1d(data.map(({ x }) => x));
  const labels = tf.tensor1d(data.map(({ x, y }) => y));

  for (let i = 0; i < LERNING_STEPS; i++) {
    optimizer.minimize(() => loss(predict(trainingData), labels));
  }

  return x => {
    const aData = a.dataSync()[0];
    const bData = b.dataSync()[0];
    return aData * x + bData;
  };
}

const render = renderer(s);
svgElement.addEventListener('click', e => {
  addPoint(s.getXY(e.x, e.y));
  tf.tidy(() => {
    const result = train(dots);
    render(result);
  });
})