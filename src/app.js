const express = require('express');
const { register, useCounter } = require('./prom-client');

const app = express();

const metricPath = '/metrics';
app.get(metricPath, async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.use(express.json());

// 2. 对所有HTTP接口增加跨域资源共享（CORS）配置，以便本地开发调试
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow any origin
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  ); // Allow these headers
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST'); // Allow POST method
    return res.sendStatus(200);
  }
  next();
});

/*
2. 新增POST方法接口，接收客户端传来的任意自定义指标

客户端发送数据用法：
await fetch('http://localhost:4001/counter-metric', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: 'FCP',
      help: 'FCP data',
      labels: {
        rating: 'good',
        // num: Math.random() * 100,
        // bool: Math.random() < 0.5,
      }
    }),
})
*/
app.post('/counter-metric', function (req, res) {
  const { name, help, labels } = req.body;
  if (!name) {
    console.warn(
      `/counter-metric WARN: no name req: ${JSON.stringify(req.body, null, 2)}`
    );
    return;
  }

  useCounter({ name, help, labels });

  const message = `/counter-metric name=${name} labels=${JSON.stringify(
    labels
  )}`;
  console.log(message);
  res.status(200).json({ message });
});

const port = 4001;
app.listen(port, '0.0.0.0');
console.log(
  `node-prometheus-grafana-demo start at http://localhost:${port}${metricPath}`
);
