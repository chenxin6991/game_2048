#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>

#define SIZE (1024 * 10)

typedef struct http_request {
    // 响应状态码
    int status_code;
    // 保存首行信息
    char first_line[SIZE];
    // 首行部分
    char* method;
    char* url;
    char* url_path;
    // 域名
    char* domain_name;
    char* query_str;
    // 协议版本号
    char* protocol_version;

    int content_length;
}http_request;

int read_line(int64_t sock_fd, char buff[], ssize_t size)
{
    char c = '\0';
    ssize_t i = 0;

    while (i < size -1 && c != '\n') {
        ssize_t read_size = recv(sock_fd, &c, 1, 0);
        if (read_size <= 0) {
            perror("recv");
            return -1;
        }
        if (c == '\r') {
            // 读出数据但是并没有从缓冲区中删除
            read_size = recv(sock_fd, &c, 1, MSG_PEEK);
            if (read_size <= 0) {
                perror("recv");
                return -1;
            }
            if (c == '\n') {
                // 如果下一个字符是'\n'，那就把它从缓冲区读出来
                recv(sock_fd, &c, 1, 0);
                if (read_size <= 0) {
                    perror("recv");
                    return -1;
                }
            } else {
                // 说明此时的分隔符就是'\r'，那么把它改成'\n'，为了统一处理
                c = '\n';
            }
        }
        buff[i++] = c;
        if (c == '\n') {
            break;
        }
    }
    buff[i] = '\0';
    return i;
}

int split(char buff[], const char* tok_ch, char* tok[], int tok_size)
{
    char* saveptr = NULL;
    int i = 0;
    char* pcur = NULL;
    pcur = strtok_r(buff, tok_ch, &saveptr);
    while (pcur != NULL) {
        if (i >= tok_size) {
            return i;
        }
        tok[i++] = pcur;
        pcur = strtok_r(NULL, tok_ch, &saveptr);
    }
    return i;
}

int firstline_proc(int64_t sock_fd, http_request* request)
{
    int ret = read_line(sock_fd, request->first_line, sizeof(request->first_line));
    if (ret < 0) {
        perror("read_line");
        return -1;
    }

    char* tok[10];
    int tok_size = split(request->first_line, " ", tok, 10);
    if (tok_size != 3) {
        perror("split");
        return -1;
    }

    request->method = tok[0];
    request->url = tok[1];

    // 处理有域名的情况
    //char* saveptr = NULL;
    //char* pcur = NULL;
    //pcur = strtok_r(request->url, "/", &saveptr);
    //if (pcur != NULL) {
    //    
    //}


    char test_buff[100] = {0};
    strcpy(test_buff, "http://job.xjtu.edu.cn/company/Login/do/what.html");
    char* saveptr = NULL;
    char* pcur = NULL;
    pcur = strtok_r(test_buff, ":", &saveptr);
    if (pcur != NULL) {
        
    }
    request->protocol_version = tok[2];

    char* purl = request->url;
    request->query_str = NULL;
    while (*purl != '\0') {
        if (*purl == '\?') {
            *purl = '\0';
            request->query_str = purl + 1;
            break;
        }
        ++purl;
    }

    return 0;
}

int header_proc(int64_t sock_fd, http_request* request)
{
    char buff[SIZE] = {0};
    const char* str = "Content-Length: ";
    int ret;
    while (1) {
        ret = read_line(sock_fd, buff, sizeof(buff));
        if (ret <= 0) {
            perror("read_line");
            return -1;
        }
        if (strncmp(buff, str, strlen(str)) == 0) {
            request->content_length = atoi(buff + strlen(str));
        }
        if (strcmp(buff, "\n") == 0) {
            return 0;
        }
    }
}

// 处理页面请求的静态文件
int static_file_proc()
{
    return 0;
}

// 处理各种请求
int http_request_proc(http_request* request)
{
    if (request == NULL) {
        return -1;
    }

    int ret;
    // GET请求，查询字符串为空
    if (strcasecmp(request->method, "GET") == 0 && request->query_str == NULL) {
        ret = static_file_proc();
        if (ret < 0) {
            perror("static_file_proc");
        }
    }
    return 0;
}

void* pthread_proc(void* arg)
{
    int64_t new_fd = (int64_t)arg;
    http_request request;
    memset(&request, 0x00, sizeof(http_request));
    int ret = firstline_proc(new_fd, &request);
    if (ret < 0) {
        perror("first_line");
        request.status_code = 404;
    }

    ret = header_proc(new_fd, &request);
    if (ret < 0) {
        perror("header_proc");
        request.status_code = 404;
    }

    ret = http_request_proc(&request);
    return NULL;
}

int main(int argc, char* argv[])
{
    if (argc != 2) {
        printf("Usage: ./http port\n");
        return -1;
    }

    int listen_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listen_fd < 0) {
        perror("socket");
        return -1;
    }

    struct sockaddr_in listen_addr;
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(atoi(argv[1]));

    if (bind(listen_fd, (struct sockaddr*)&listen_addr, sizeof(struct sockaddr_in)) < 0) {
        perror("bind");
        return -1;
    }

    if (listen(listen_fd, 5) < 0) {
        perror("listen");
        return -1;
    }

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t len = sizeof(struct sockaddr_in);
        int64_t new_fd = accept(listen_fd, (struct sockaddr*)&client_addr, &len);
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
