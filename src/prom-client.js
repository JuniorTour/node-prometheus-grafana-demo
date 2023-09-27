const client = require('prom-client');

const Registry = client.Registry;
const register = new Registry();

client.collectDefaultMetrics({ register });

function useCounter({ name, help, labels }) {
  let counter = register.getSingleMetric(name);
  if (!counter) {
    counter = new client.Counter({
      name,
      help,
      registers: [register],
      labelNames: Object.keys(labels),
    });
  }

  counter.inc(labels, 1);
}


function useGauge({ name, help, labels }, value) {
  let gauge = register.getSingleMetric(name);
  if (!gauge) {
    gauge = new client.Gauge({
      name,
      help,
      registers: [register],
      labelNames: Object.keys(labels),
    });
  }

  gauge.set(labels, value);
}

module.exports = {
  useCounter,
  useGauge,
  register,
};
