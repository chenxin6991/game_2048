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
    http_server(int port);
    void init_server();
    int accept_proc(struct sockaddr* client_addr, socklen_t* len);
    ~http_server();
private:
    int _port;
    int _listen_fd;
};

#endif
