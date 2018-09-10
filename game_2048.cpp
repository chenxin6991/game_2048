#include "http_server.h"

void usage(string proc)
{
    cout << "Usage: " << proc << " port" << endl;
}

void* pthread_proc(void* arg)
{
    int64_t new_fd = (int64_t)arg;
    return NULL;
}

int main(int argc, char* argv[])
{
    if (argc != 3) {
        usage(argv[0]);
        return -1;
    }

    http_server server(atoi(argv[1]));
    server.init_server();

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t len = sizeof(struct sockaddr_in);
        int64_t new_fd = server.accept_proc((sockaddr*)&client_addr, &len);
        if (new_fd < 0) {
            perror("accept");
            continue;
        }

        pthread_t tid;
        pthread_create(&tid, NULL, pthread_proc, (void*)new_fd);
        pthread_detach(tid);
    }
    return 0;
}
