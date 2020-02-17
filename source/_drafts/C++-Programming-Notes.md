---
title: C++ Programming Notes
tags:
  - C++
  - programming
  - notes
categories:
  - Notes
---

## `nullptr` Instead of `NULL`

In C, `NULL` is a `#define` that is actually a integer which can be assigned to a pointer through implicit type conversion. However, in C++, this can cause troubles. See the example below:

```C++
void f(int* a);
void f(int a);
f(NULL);
f(nullptr);
```

The third line would actually call `void f(int a)` because `NULL` is an `int`. The fourth line would call `void f(int* a)` because `nullptr` cannot be converted to `int`.

Hence, in C++, it would be better to use `0` for int and `nullptr` for null pointer to avoid ambiguity.

See [here](https://en.cppreference.com/w/c/types/NULL) and [here](https://en.cppreference.com/w/cpp/types/NULL)

