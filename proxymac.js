const http = require("http");
const httpProxy = require("http-proxy");
const Proxy = require("http-mitm-proxy").Proxy;

// 创建一个普通的HTTP代理服务器
const httpProxyServer = httpProxy.createProxyServer({});
httpProxyServer.on("error", function (err, req, res) {
  if (err.code === "ETIMEDOUT") {
    res.writeHead(504, { "Content-Type": "text/plain" });
    res.end("The request timed out.");
  } else {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("An error occurred.");
  }
});
http
  .createServer(function (req, res) {
    // 检查请求的目标地址是否为 baidu.com
    if (req.headers.host && req.headers.host.includes("baidu.com")) {
      console.log("Proxying request to:", req.headers.host + req.url);
      httpProxyServer.web(req, res, { target: "http://" + req.headers.host });
    } else {
      // 如果目标地址不是 baidu.com，直接将请求转发到原始的目标地址
      httpProxyServer.web(req, res, { target: "http://" + req.headers.host });
    }
  })
  .listen(8080);

// 创建一个可以处理HTTPS请求的MitM代理服务器
const proxy = new Proxy({
  timeout: 60000, // 设置超时时间为60秒
});
// 创建一个可以处理HTTPS请求的MitM代理服务器
proxy.onError(function (ctx, err) {
  //   ctx.res.writeHead(500, { "Content-Type": "text/plain" });
  //   if (err.code === "ETIMEDOUT") {
  //     ctx.res.end("The request timed out.");
  //   } else {
  //     ctx.res.end("An error occurred.");
  //   }
});

let requests = [];

proxy.onRequest(function (ctx, callback) {
  let startTime = Date.now();
  let requestBodyChunks = [];
  ctx.clientToProxyRequest.on('data', chunk => {
    requestBodyChunks.push(chunk);
  });

  ctx.onResponse(function (ctx, callback) {
    let endTime = Date.now();
    let responseBodyChunks = [];
    ctx.proxyToClientResponse.on('data', chunk => {
      responseBodyChunks.push(chunk);
    });

    ctx.proxyToClientResponse.on('end', () => {
      let requestInfo = {
        url: ctx.clientToProxyRequest.url,
        method: ctx.clientToProxyRequest.method,
        requestHeaders: ctx.clientToProxyRequest.headers,
        requestBody: Buffer.concat(requestBodyChunks).toString(),
        responseHeaders: ctx.proxyToClientResponse.headers,
        responseBody: Buffer.concat(responseBodyChunks).toString(),
        time: new Date(startTime).toISOString(),
        duration: endTime - startTime,
      };
      requests.push(requestInfo);
    });

    callback();
  });

  callback();
});
proxy.listen({ port: 8081 });

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render("requests", { requests: requests });
});
app.listen(8082, function () {
  console.log("Web server is running at http://localhost:8082");
});

console.log("HTTP Proxy is running at http://localhost:8080");
console.log("HTTPS Proxy is running at http://localhost:8081");
