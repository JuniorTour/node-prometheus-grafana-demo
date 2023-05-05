const express = require("express");
const client = require('prom-client');

const Registry = client.Registry;
const register = new Registry();

client.collectDefaultMetrics({ register });

const app = express();

const metricPath = '/metrics'
app.get(metricPath, async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

const port = 4001
app.listen(port, '0.0.0.0');
console.log(`node-prometheus-grafana-demo start at http://localhost:${port}${metricPath}`)