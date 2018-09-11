http:http.c
	$(CC) $^ -o $@ -lpthread
.PHONY:clean
clean:
	$(RM) http
