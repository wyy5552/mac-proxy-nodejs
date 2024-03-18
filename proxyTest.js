const http = require("http");
const net = require("net");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: req.method,
    headers: req.headers,
  };

  console.log(
    `HTTP request: ${options.method} ${options.hostname}${options.path}`
  );

  const proxy = http.request(options, (targetRes) => {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res, { end: true });
  });

  req.pipe(proxy, { end: true });
});

server.on("connect", (req, clientSocket, head) => {
  const { port, hostname } = url.parse(`//${req.url}`, false, true);

  console.log(`Socket connection: ${hostname}:${port}`);

  const serverSocket = net.connect(port || 80, hostname, () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
  serverSocket.on("error", (err) => {
    console.error(`Error: ${err.message}`);
  });
});

server.listen(1337, "127.0.0.1", () => {
  console.log("Server running at http://127.0.0.1:1337/");
});
