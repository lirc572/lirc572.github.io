---
title: C Programming Notes
tags:
- C
- programming
- notes
categories:
- Notes
---

This post consists of some notes of C.

## Determine the length of an array

```C
#include<stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5, 6, 7};
    printf("The length of array a is %d\n", sizeof(arr)/sizeof(int));
    return 0;
}
```

Compile and run the code above and you should see the programming showing the correct array length (7).

What about the following code?

```C
#include<stdio.h>

int lengthOfIntArray(int a[]) {
    return sizeof(a) / sizeof(int);
}

int main() {
    int arr[] = {1, 2, 3, 4, 5, 6, 7};
    printf("The length of array a is %d\n", lengthOfIntArray(arr));
    return 0;
}
```

It gives an output of 2??? It turns out that the results of sizeof() are compile-time constants. In the first example, the compiler knows that `arr` is an array and correctly gives the number of bytes occupied by the array. However, in the second example, when the array `arr` is passed as a parameter to a function, it "decays" to a normal int pointer. Thus sizeof(a) in funtion `lengthOfIntArray()` gives the number of bytes occupied by an int pointer instead of the array.

## Complex Pointer Declarations

```C
char * const *(*next)()
```

(算法竞赛入门经典（第二版）)

What is the type of `next` in the above declaration?

To evaluate the declaration, we:

1. start from the identifier being declared
2. go right until the closing bracket is met, then go left
3. Continue until the whole declaration has been evaluated

In the above example, we start from the identifier `next`. Since there is nothing on its right, we go left and find `*`. We then come out of the bracket and find `()` on the right. Then, we find `*`, `const`, `*`, `char` one by one. The result is shown below:

```C
next * () * const * char
```

It is interpreted as "next is a pointer to a function (which takes no parameter) which returns a pointer to a constant pointer to a char variable".
