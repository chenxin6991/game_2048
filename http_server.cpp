#include "http_server.h"

http_server::http_server(int port)
    : _port(port)
{}

void http_server::init_server()
{
    _listen_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (_listen_fd < 0) {
        perror("socket");
        return;
    }

    struct sockaddr_in listen_addr;
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(_port);
    socklen_t len = sizeof(struct sockaddr_in);

    if (bind(_listen_fd, (struct sockaddr*)&listen_addr, len) < 0) {
        perror("bind");
        return;
    }

    if (listen(_listen_fd, 5) < 0) {
        perror("listen");
        return;
    }
}

int http_server::accept_proc(struct sockaddr* client_addr, socklen_t* len)
{
    return accept(_listen_fd, client_addr, len);
}
