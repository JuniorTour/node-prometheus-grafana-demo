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


/*
发送指标数据用法：在浏览器控制台 console 执行：
await fetch('http://localhost:4001/post-web-vitals', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      labels: {
        name: 'FCP',
        rating: 'good'
      }
    }),
})
*/
app.use(express.json())

// 3. 对所有接口增加 跨域资源共享（CORS）配置
// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Allow these headers
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Methods", "POST"); // Allow POST method
    return res.sendStatus(200);
  }
  next();
});

// 2. 新建了一个自定义计数指标webVitalsRatingCounter
// https://www.npmjs.com/package/prom-client#:~:text=()%3B-,Custom%20Metrics,-All%20metric%20types
const webVitalsRatingCounter = new client.Counter({
  name: 'webVitalsRatingCounter',
  help: 'counter to store web-vitals rating data',
  registers: [register],
  labelNames: ['name', 'rating'],
});

// 1. 增加了一个POST方法的接口
app.post('/post-web-vitals', function(req, res) {
  console.log(`req.body=${req.body}`)
  const labels = req.body.labels

  webVitalsRatingCounter.inc(labels)

  const message = `Get web-vitals: labels=${JSON.stringify(labels)}`
  console.log(message)
  res.status(200).json({ message });
});

const port = 4001
app.listen(port, '0.0.0.0');
console.log(`node-prometheus-grafana-demo start at http://localhost:${port}${metricPath}`)