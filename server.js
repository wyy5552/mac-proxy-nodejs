const http = require("http");
const fs = require("fs");
const path = require("path");

// 动态生成 CSS 内容
const cssContent = `
body {
    background-color: #f0f0f2;
    color: #333;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

h1 {
    color: #0066cc;
    margin: 20px;
}
`;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  if (req.url === "/style.css") {
    // 返回 CSS 内容
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(cssContent); // 直接返回动态生成的 CSS
  } else {
    // 返回 HTML 页面
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Node Server with Dynamic CSS</title>
                <link rel="stylesheet" type="text/css" href="style.css">
            </head>
            <body>
                <h1>Hello, World!</h1>
                <p>This is a simple Node.js server with dynamically generated CSS.</p>
            </body>
            </html>
        `);
  }
});

// 监听 3000 端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
