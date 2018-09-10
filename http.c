#include "http.h"
#include <stdio.h>

void* pthread_process(void* arg)
{
    // 接收到的socket
    int64_t sock_fd = (int64_t)arg;
    return NULL;
}

int main(int argc, char* argv[])
{
    // 接受端口号，IP地址使用IPADDR_ANY
    if (argc != 2) {
        printf("Usage: ./http port\n");
        return -1;
    }

    // 创建监听socket
    int listen_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listen_fd < 0) {
        perror("socket");
        return -1;
    }

    // 绑定地址端口
    struct sockaddr_in listen_addr;
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(atoi(argv[1]));
    socklen_t len = sizeof(struct sockaddr_in);

    if (bind(listen_fd, (struct sockaddr*)&listen_addr, len) < 0) {
        perror("bind");
        return -1;
    }

    // 监听链接请求
    if (listen(listen_fd, 5) < 0) {
        perror("listen");
        return -1;
    }

    // 开始循环处理客户端请求
    while (1) {
        struct sockaddr_in client_addr;
        int64_t new_fd = accept(listen_fd, (struct sockaddr*)&client_addr, &len);
        if (new_fd < 0) {
            perror("accept");
            continue;
        }
        // 为了提高服务器处理链接的能力，使用多线程
        pthread_t tid;
        pthread_create(&tid, NULL, pthread_process, (void*)new_fd);
        pthread_detach(tid);
    }
    return 0;
}
