#ifndef __HTTP_SERVER_H__
#define __HTTP_SERVER_H__

#include <iostream>
#include <string>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>

using namespace std;

class http_server
{
public:
    void* pthread_proc(void* arg);
public:
    http_server(int port);
    // 初始化服务器，创建监听socket，绑定地址端口，开始监听
    void init_server();
    int accept_proc(struct sockaddr* client_addr, socklen_t* len);
    // 解析处理首行
    int firstline_proc(int sock_fd);
    // 读取一行
    int read_line(int64_t sock_fd);
    ~http_server();
private:
    int _port;
    int _listen_fd;
};

#endif
