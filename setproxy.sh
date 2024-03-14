
networksetup -setwebproxy $SERVICE_NAME localhost 8080

# 设置HTTPS代理
networksetup -setsecurewebproxy $SERVICE_NAME localhost 8080