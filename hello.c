/*************************************************************************
 > File Name: hello.c
 > Author: Lyle
 > Mail: lixianfayx@163.com
 > Created Time: 2014年04月10日 星期四 21时24分45秒
 ************************************************************************/
#include<stdio.h>
int main()
{
    printf("hello world!\n");

    int a[10];

    for(int i = 0; i < 10; ++i)
    {
        a[i] = i*i;
    }
    for(int i = 0; i<10; ++i)
    {
        printf("%d\t",a[i]);
    }
    printf("\n");

    return 0;
}
