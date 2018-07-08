# Effective STL

*2008 Scott Meyers*

Read the book [here](https://www.aristeia.com/books.html).

## Containers

### Item 1: Choose your containers with care

#### Overview

- **Standard STL sequence containers** - `vector`, `string`, `deque`, and `list`.
- **Standard STL associative containers** - `set`, `multiset`, `map`, and `multimap`.
- **Nonstandard sequence containers** - `slist` and `rope`. See [Item
  50](effective_stl#item-50-familiarize-yourself-with-stl-related-web-sites).
- **Nonstandard associative containers** - `hash_set`, `hash_multiset`, `hash_map`, and `hash_multimap`. See
  [Item 25](effective_stl#item-25-familiarize-yourself-with-the-nonstandard-hashed-containers).
- **`vector<char>` as a replacement for string:** See 
  [Item 13](effective_stl#item-13-prefer-vector-and-string-to-dynamically-allocated-arrays).
- **`vector` as a replacement for standard associative containers:** See 
  [Item 23](effective_stl#item-23-consider-replacing-associative-containers-with-sorted-vectors).
- **standard non-STL containers** - arrays, `bitset`, `valarray`, `stack`, `queue`, and `priority_queue`.
  non-STL containers are mostly outside of the scope of this book.

#### Memory arrangement

|                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contiguous memory containers** | Elements are stored in one or more dynamically allocated chunks of memory, each chunk holding more than one container element. If a new element is inserted or an existing element is erased, other elements in the same memory chunk have to be shifted up or down to make room for the new element or fill the space formerly occupied by the erased element. `vector`, `string`, `deque`, and `rope` are *contiguous memory containers*. |
| **Node-based containers**        | Only a single element is stored per chunk of dynamically allocated memory. Insertion or erasure of a container element affects only pointers to nodes, not the contents of nodes themselves, so element values need not be moved when something is inserted or erased. `list`, and `slist` are *node-based container*s.                                                                                                                     |

#### Design decisions

| Decision                                                                                                                                                                                                                          | Solution                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Do you need to be able to insert a new element at an arbitrary position in the container?                                                                                                                                         | Use sequence containers, not associative containers                                                                                                                                                                                                                                                                |
| Do you care how elements are ordered in the container?                                                                                                                                                                            | If so, avoid hashed containers.                                                                                                                                                                                                                                                                                    |
| Must the container be a part of standard C++?                                                                                                                                                                                     | If so that removes `slist` and `rope`.                                                                                                                                                                                                                                                                             |
| What category of iterators do you need?                                                                                                                                                                                           | If they must be random access iterators, use `vector`, `deque`, `string`, and `rope`. If bidirectional iterators are required, avoid `slist` as well as a common implementation of hashed containers (see [Item 25](effective_stl#item-25-familiarize-yourself-with-the-nonstandard-hashed-containers)).           |
| Is it important to avoid movement of existing container elements when insertions or erasures take place?                                                                                                                          | If so, avoid contiguous memory containers.                                                                                                                                                                                                                                                                         |
| Does the data in the container need to be layout-compatible with C?                                                                                                                                                               | If so, you may only use `vector` (see [Item16](effective_stl#item-16-know-how-to-pass-vector-and-string-data-to-legacy-apis)).                                                                                                                                                                                     |
| Is lookup speed a critical consideration?                                                                                                                                                                                         | If so, look at hashed containers (see [Item 25](effective_stl#item-25-familiarize-yourself-with-the-nonstandard-hashed-containers)), sorted `vectors` (see [Item 23](effective_stl#item-23-consider-replacing-associative-containers-with-sorted-vectors)), and the standard associative containers in that order. |
| Do you mind if the underlying container uses reference counting?                                                                                                                                                                  | If so, avoid `string` and `rope` and consider `vector<char>`.                                                                                                                                                                                                                                                      |
| Do you need transactional semantics for insertions and erasures?                                                                                                                                                                  | If so, you'll want to use a node based container. If you need transactional semantics for multiple-element insertions (such as the range form - see [Item 5](effective_stl#item-5-prefer-range-member-functions-to-their-single-element-counterparts)), you'll want to choose `list`.                              |
| Do you need to reduce iterator, pointers, and reference invalidation?                                                                                                                                                             | If so, you will want to use node-based containers.                                                                                                                                                                                                                                                                 |
| Do you care if using `swap` on containers invalidates iterators, pointers, and references?                                                                                                                                        | If so, avoid using `string`.                                                                                                                                                                                                                                                                                       |
| Would it be helpful to have a sequence container with random access iterators where pointers and references to data are not invalidated as long as nothing is erased and insertions take place only at the ends of the container? | Well then, `deque` is for you!                                                                                                                                                                                                                                                                                     |

### Item 2: Beware the illusion of container-independent code

Containers have different strengths and weaknesses. They are not designed to be interchangeable.

With that said, sometimes a container type must be changed throughout the life of the source code.
Encapsulation can make this easier. For example, instead of writing this:

``` cpp
class Widget {...};

vector<Widget> vw;
Widget bestWidget;

...

vector<Widget>::iterator i = find(vw.begin(), vw.end(), bestWidget);
```

Write this

``` cpp
class Widget {...}

typedef vector<Widget> WidgetContainer;

WidgetContainer cw;
Widget bestWidget;

...

WidgetContainer::iterator i = find(cw.begin(), cw.end(), bestWidget);
```

Now, making changes, such as adding a custom allocator, becomes an easy task.

``` cpp
class Widget {...};

template<typename T>
class SpecialAllocator {...}; // needs to be a template

typedef vector<Widget, SpecialAllocator<Widget> > WidgetContainer;

WidgetContainer cw; // still works
Widget bestWidget;

...

// still works
WidgetContainer::iterator i = find(cw.begin(), cw.end(), bestWidget);
```

> `typedef` can save a lot of typing, especially when using STL.

To limit client exposure to a container, hide the container in a `class` and limit visibility to
container specific information.

``` cpp
class CustomerList {
private:
  typdef list<Customer> CustomerContainer;
  typdef CustomerContainer::iterator CCIterator;

  CustomerContainer customers;

public:
  ...
};
```

If properly encapsulated, changing `CustomerList` to be a `vector` or `deque` instead of a `list`
should have little to no impact on the client.

### Item 3: Make copying cheap and correct for objects in containers

When using STL containers, it's common for objects to be copied using the copy constructor or the
copy assignment operator. Filling a container with objects that are expensive to copy can lead to
performance bottlenecks, especially when objects are moved around in the container.

Furthermore, objects with unconventional methods of copying can lead to grief when used with
containers (see [Item 8](effective_stl#item-8-never-create-containers-of-auto_ptrs)). When using inheritance,
*slicing* is also a concern.

An easy way to correct the above issues is to create containers of pointers instead of containers of
objects. Unfortunately, pointers have their own set of issues, discussed in 
[Item 7](effective_stl#item-7-when-using-containers-of-newed-pointers-remember-to-delete-the-pointers-before-the-container-is-destroyed)
and [Item 33](effective_stl#item-33-be-wary-of-remove-like-algorithms-on-containers-of-pointers). Using containers of
*smart pointers* is an attractive choice.

Although STL does copy objects, it's still much more civilized than an array.

``` cpp
Widget w[maxNumWidgets];
```

The code above will default-construct `maxNumWidgets` `Widget`s even if only a few widgets are expected to be used
or each default-constructed value is overwritten with values used from someplace else. An STL container, like
`vector`, will grow when it needs to. It's even possible to create an empty `vector` that has enough space
for `maxNumWidgets` `Widget`s, without needing to construct them.

``` cpp
vector<Widget> vw;
vw.reserve(maxNumWidgets);
```

### Item 4: Call `empty` instead of checking `size()` against zero

For any container `c`, writing

``` cpp
if (c.size() == 0) ...
```

is equal to

``` cpp
if (c.empty()) ...
```

Yet, `empty` is a constant-time operation while `size` can take linear time. Why? Consider this
code:

``` cpp
list<int> list1;
list<int> list2;

...

// move all the nodes in list2 from the first occurrence of 5
// through the last occurrence of 10 to the end of list1.
list1.splice(list1.end(), list2,
             find(list2.begin(), list2.end(), 5),
             find(list2.rbegin(), list2.rend(), 10).base());
```

There's no way to tell how many elements were `splice`d into `list2` without traversing the range and
counting them. This is because `splice` is a high-efficiency constant-time operation and counting
the number of elements `splice`d would compromise its efficiency. The trade-off is `size` becoming a
linear-time operation.

### Item 5: Prefer range member functions to their single-element counterparts

|                           |                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| **Range member function** | Uses two iterator parameters to specify a range of elements over which something should be done. |

*Range member functions* remove the need to write an explicit `for` loop (see [Item
43](effective_stl#item-43-prefer-algorithm-calls-to-hand-written-loops)) which translates to less work writing and
reading code. Also, for standard sequence containers, *range member functions* are more efficient.

``` cpp
int data[numValues];
vector<int> v;
...

// range insert
v.insert(v.begin(), data, data + numValues);

// single-element insert
vector<int>::iterator insertLoc(v.begin());
for (int i = 0; i < numValues; ++i) {
  insertLoc = v.insert(insertLoc, data[i]);
  ++insertLoc;
}

// copy
copy(data, data + numValues, inserter(v, v.begin()));
```

Compared to range `insert`, the single-element `insert` loop pays three extra taxes:

1. **Unnecessary function calls** - It's possible that `inline`ing might nullify this tax, but there's
   no guarantee that the `insert` can be `inline`d.
1. **Unnecessary movement of elements to their final positions** - Each time `insert` is called, an
   element is inserted at the front of `v`. To do so, all the other elements in `v` need to be
   shifted up one position. This becomes especially problematic if `v` has elements before
   the `insert` loop.
1. **Unnecessary container resizing** - As 
   [Item14](effective_stl#item-14-use-reserve-to-avoid-unnecessary-reallocations) explains, `insert`ing an
   element into a `vector` whose memory is full will cause it to allocate new memory with more capacity, copy
   elements from the old memory to the new memory, destroy the elements in the old memory, deallocate the old memory
   and then `insert` the element into the new memory. `insert`ing a large number of elements one at a time can cause
   multiple new allocations.

Efficiency wise, `copy` is the same as the single element `insert`, so all comments about the
single-element `insert` also apply to `copy`. 

The same reasoning applies to `string`s too. `deque`s manage memory differently so tax #3 does not
apply. For `list`, tax #1 applies but tax #2 does not. Instead, `list` suffers from repeated
superfluous assignments of the `next` pointer of the element being `insert`ed and the `prev` pointer
pointing to the element being `insert`ed. Pointer assignments are cheap, but there's no need to pay
for them.

### Item 6: Be alert for C++'s most vexing parse

|                             |                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------- |
| **C++'s most vexing parse** | Situations where the C++ compiler recognizes a constructor as a function declaration. |

``` cpp
ifstream dataFile("ints.dat");
list<int> data(istream_iterator<int>(dataFile), istream_iterator<int>());
```

Here, this range constructor ([Item
5](effective_stl#item-5-prefer-range-member-functions-to-their-single-element-counterparts)) is supposed to copy
`int`s in the file into a `list` called `data`. Instead, it declares a function called `data` whose `return` type is
`list<int>`. `data` takes two parameters both of type `istream_iterator<int>`, one called `dataFile`,
and the other nameless.

One way to get the compiler to recognize the range constructor as a function is to surround the arguments with
parenthesis.

``` cpp
list<int> data((istream_iterator<int>(dataFile)), istream_iterator<int>());
```

Sometimes the compiler still won't correctly recognize this as a function call. A safer solution is
to give the iterators names.

``` cpp
ifstream dataFile("ints.dat"):
istream_iterator<int> dataBegin(dataFile);
istream_iterator<int> dataEnd;

list<int> data(dataBegin, dataEnd);
```

### Item 7: When using containers of `new`ed pointers, remember to `delete` the pointers before the container is destroyed

A container of pointers will destroy each element it has when the container is destroyed, but
the destructor for a pointer is a no-op. Cleaning up is easy enough:

``` cpp
void doSomething() {
  vector<Widget*> vwp;
  for (int i = 0; i < SOME_MAGIC_NUMBER; ++i)
    vwp.push_back(new Widget);
  ...

  for (vector<Widget*>::iterator i = vwp.begin(); i != vwp.end(); ++i)
    delete *i;
}
```

A `for_each` loop ([Item 43](effective_stl#item-43-prefer-algorithm-calls-to-hand-written-loops)) can help with clarity.

``` cpp
template<typename T>
struct DeleteObject:
  public unary_function<const T*, void> {

  void operator()(const T* ptr) const
  {
    delete ptr;
  }
};

void doSomething()
{
  ...

  for_each(vwp.begin(), vwp.end(), DeleteObject<Widget>());
}
```

Inheritance can further reduce typing and improve safety.

``` cpp
struct DeleteObject {
  template<typename T>
  void operator()(const T* ptr) const
  {
    delete ptr;
  }
};

void doSomething()
{
  vector<Widget*> vwp;
  ...

  for_each(vwp.begin(), vwp.end(), DeleteObject());
}
``` 

One final concern is `exception` safety. A popular solution is *smart pointers* (*More Effective
C++*, [Item 28](effective_stl#item-28-understand-how-to-use-reverse_iterators-base-iterator)).

``` cpp
void doSomething()
{
  typedef boost::shared_ptr<Widget> SPW;

  vector<SPW> vwp;
  for (int i = 0; i < SOME_MAGIC_NUMBER; ++i)
    vpw.push_back(SPW(new Widget));

  ...
}
```

> Never create containers of `auto_ptr`s ([Item 8](effective_stl#item-8-never-create-containers-of-auto_ptrs)).

### Item 8: Never create containers of `auto_ptr`s

Containers of `auto_ptr` are prohibited; they shouldn't compile.

The reasoning for prohibiting containers of `auto_ptr` is its unique copying behavior. Ownership of
the object pointed to by the `auto_ptr` is transferred to the copying `auto_ptr`, and the copied
`auto_ptr` becomes `null`. Since STL containers often copy elements when performing
operations like `sort`, several elements in the container may have unintentionally become
`null`.

### Item 9: Choose carefully among erasing operations

For some arbitrary STL container `c`, suppose the value `1963` should be removed:

-   **Contiguous-memory container** - The best approach is the `erase-remove` idiom.
  
    ``` cpp
    c.erase(remove(c.begin(), c.end(), 1963), c.end());
    ```
  
-   **`lists`** - Call `remove`.
-   **Associative containers** - Call `erase`.

Now suppose, instead of removing an element with a particular value, removing an element for which a
particular predicate `return`s `true` is desired:

``` cpp
bool isPredicate(int x);
```

- **Sequence containers** - replace `remove` with `remove_if`.
- **Standard associative containers** - Choose between:
  - **Easier-but-less-efficient** - `remove_copy_if` to copy desired values to a new container
      and then `swap` the contents of the original container with those of the new one.
     
      ``` cpp
      AssocContainer<int> c;
      ...
      AssocContainer<int> desiredValues;
      remove_copy_if(c.begin(), c.end(), inserter(desiredValues, desiredValues.end()), isPredicate);
      c.swap(desiredValues);
      ```
     
  - **Harder-but-more-efficient** - Make a `remove_if` function.
     
      ``` cpp
      AssocContainer<int> c;
      ...
      for (AssocContainer<int>::iterator i = c.begin(); i != c.end(); ++i) {
        if (isPredicate(*i)) c.erase(i);
      }
      ```
     
      Unfortunately, calling `erase` invalidates the `iterator` and yields undefined behavior once
      `i` is incremented. An `iterator` to the next element is required *before* calling `erase`.
     
      ``` cpp
      for (AssocContainer<int>::iterator i = c.begin(); i != c.end(); ) {
        if (isPredicate(*i)) c.erase(i++);
        else ++i;
      }
      ```

Now suppose, every time an element matching `isPredicate` is removed, a message should be logged to
a file:

-   **Associative containers** - Simply add the logging to the `for` loop.
-   **Sequence containers** - The `erase-remove` idiom no longer works. Instead, make a `for` loop
    like the associative container.
  
    ``` cpp
    ofstream logFile;
    SeqContainer<int> c;
    ...
    for (SeqContainer<int>::iterator i = c.begin(); i != c.end(); ) {
       if (isPredicate(*i)) {
          logFile << "Erasing " << *i << '\n';
          i = c.erase(i); // keep i valid by assigning i to return value of erase
       }
       else ++i;
    }
    ```

### Item 10: Be aware of allocator conventions and restrictions

Below is list of tips to consider when designing an allocator for a container:

- Allocators should be `template`s with the `template` parameter `T` representing the type of
  objects for which memory should be allocated.
- Provide the `typedef`s `pointer` and `reference`, but always have `pointer` be `T*` and
  reference be `T&`.
- Never give an allocator per-object state. In general, allocators should not have any
  non-`static` data members.
- An allocator's `allocate` member functions are passed the number of *objects* for which memory
  is required, not the number of bytes needed. These functions `return T*` pointers (via the
  `pointer typdef`), even though no `T` objects have been constructed yet.
- Be sure to provide the nested `rebind template` on which standard containers depend.

### Item 11: Understand the legitimate uses of custom allocators

Suppose a custom allocator is required for managing a heap of shared memory with the following
functions:

``` cpp
void* mallocShared(size_t bytesNeeded);
void freeShared(void* ptr);
```

The implementations of the allocator would look something like:

``` cpp
template<typename T>
class SharedMemoryAllocator {
public:
  ...
  pointer allocate(size_type numObjects, const void* localityHint = 0)
  {
    return static_cast<pointer>(mallocShared(numObjects * sizeof(T)));</pointer>
  }

  void deallocate(pointer ptrToMemory, size_type nuObjects)
  {
    freeShared(ptrToMemory);
  }
  ...
};
```

`SharedMemoryAllocator` would be used like:

``` cpp
typdef vector<double, SharedMemoryAllocator<allocator> > SharedDoubleVec;
...

{
  ...
  SharedDoubleVec v;
  ...
}
```

> The elements `v` holds are located in shared memory, but not `v` itself. Putting `v` and its contents
> in shared memory would look something like:
> 
> ``` cpp
> void* pVectorMemory = mallocShared(sizeof(SharedDoubleVec));
> SharedDoubleVec* v = new (pVectorMemory) SharedDoubleVec;
> ...
> v->~SharedDoubleVec();
> freeShared(pVectorMemory);
> ```

This custom allocator can be modified to use any arbitrary heap that follows a similar interface.

``` cpp
class Heap1
{
public:
  ...
  static void* alloc(size_t nemBytes, const void* memoryBlockToBeNear);
  static void dealloc(void* ptr);
  ...
};

class Heap2 { ... } // similar interface

template<typename T, typename Heap>
class SpecificHeapAllocator {
public:
  ...
  pointer allocate(size_t numObjects, const void* localityHint = 0)
  {
    return static_cast<pointer> (Heap::alloc(numObjects * sizeof(T), localityHint));
  }

  void dealloc(pointer ptrToMemory, size_type numObjects)
  {
    Heap::dealloc(ptrToMemory);
  }
  ...
};

vector<int, SpecificHeapAllocator<int, Heap1> > v;
list<Widget, SpecificHeapAllocator<Widget, Heap1> > s;

list<Widget, SpecificHeapAllocator<Widget, Heap2> > L;
map<int, string, less<int>. SpecificHeapAllocator<pair<const int, string>, Heap2> > m;
```

### Item 12: Have realistic expectations about the thread safety of STL containers

STL containers are not thread safe; they need manual concurrency control.

## `vector` and `string`

### Item 13: Prefer `vector` and `string` to dynamically allocated arrays

Compared to arrays, `string` and `vector`

- Make it easier to manage memory.
  - A container's memory grows as elements are added to it.
  - When the container is destroyed, it's destructor automatically destroys the elements in the
    container and deallocates the memory holding those elements.
- Provide powerful member functions to make manipulating elements easier.

There's only one concern when replacing arrays with `vector`s or `string`s: many `string`
implementations use reference counting behind the scenes. While generally an optimization, when
used in multithreaded applications, performance problems may arise. There's three things that can help troubleshoot
this problem.

- Check and see if the library implementation offers a way to disable reference counting.
- Develop an alternative `string` implementation.
- Consider using `vector<char>` instead of `string`.

### Item 14: Use `reserve` to avoid unnecessary reallocations

Containers have a size limit which can be discovered with `max_size`. If elements are inserted
into a container beyond it's limit, the container will automatically grow. This operation has
four parts:

- Allocate a new block of memory, usually 1.5 to 2 times it's current capacity.
- Copy all elements from the containers old memory to its new memory.
- Destroy all objects in the old memory.
- Deallocate the old memory.

Growing can be quite expensive, especially if it can be avoided. Containers have some interrelated member functions
to manage size:

- **`size()`** - `return`s the number of elements in the container.
- **`capacity()`** - `return`s the total number of elements the container can hold.
- **`resize(Container::size_type n)`** - Forces the container to hold `n` elements. If `n` is larger than `size`,
  elements are copied (via an extra parameter) or default-constructed to the end of the container. If `n` is
  larger than `capacity`, the container will grow. If `n` is smaller than `size`, elements at the
  end of the container will be destroyed.
- **`reserve(container::size_type n)`** - Forces the container to change its `capacity` to at least `n`. It's
  possible for a container to reduce its capacity, but generally it's better to use the `swap` trick in [Item
  17](effective_stl#item-17-use-the-swap-trick-to-trim-excess-capacity).

In general, use `reserve` to allocate space in advance. If needed, excess capacity can be trimmed later 
([Item 17](effective_stl#item-17-use-the-swap-trick-to-trim-excess-capacity)).

### Item 15: Be aware of variations in `string` implementations

Though a `string`s interface is virtually the same, it's implementation can vary from library to
library:

- `string`s, by default, are usually reference counted and offer a way to turn the feature off. For
  the price of some overhead, reference counting can be helpful when a string is copied often.
- `sizeof(string)` may range in size from greater than one to seven times the size of `char*`
  pointers.
- Construction of a new `string` may need zero, one or two dynamic allocations.
- `string` objects may or may not share information on the strings `size` and `capacity`.
- `string`s may or may not support per-object allocators.
- Minimum allocations for character buffers may differ.

### Item 16: Know how to pass `vector` and `string` data to legacy APIs

#### Reads

Given an an API that uses C primitives:

``` cpp
void doSomething(const int* pInts, size_t numInts);
void doSomething(const char* pString);
```

STL containers can feed the API their underlying API like so:

``` cpp
vector<int> v;
string s;
...
doSomething(&v[0], v.size());
doSomething(s.c_str());
```

> Passing an empty `vector` yields undefined results. Make sure the `vector` is not `empty` first.
> 
> `c_str` does not need a similar check since it will at least `return` a pointer to a `null` character.

#### Write

Passing a `vector` to a C API that modifies its elements is safe. But, `vector`
is the only container that is safe. Other containers must take advantage of `vector`.

``` cpp
// pArray is at most arraySize elements. Returns number of elements written.
size_t fillArray(double* pArray, size_t arraySize);
size_t fillString(char* pArray, size_t arraySize);

vector<double> vd(maxNumDoubles);
vd.resize(fillArray(&vd[0], vd.size()));

vector<char> vc(maxNumChars);
size_t charsWritten = fillString(&vc[0], vc.size());
string s(vc.begin(), vc.begin() + charsWritten);

deque<double> d(vd.begin(), vd.end());

list<double> l(vd.begin(), vd.end());

set<double> s(vd.begin(), vd.end));
```

### Item 17: Use the `swap` trick to trim excess capacity

`vector` and `string` can trim their excess capacity by using `swap`.

``` cpp
vector<int>(v.begin(), v.end()).swap(v);
string(s.begin(), s.end()).swap(s);
```

> There's no guarantee that the capacity will be reduced. This trick will simply make the capacity
> as small as the implementation is willing to make it. For example, implementations typically have a
> minimum capacity.

### Item 18: Avoid using `vector<bool>`

`vector<bool>` doesn't meet the requirements of an STL container. References and pointers to individual bits aren't
allowed and the standard requires any container `c` of objects of type `T` that supports `operator[]` to be able to
get a pointer to it's elements.

``` cpp
vector<bool> v;
bool *pb = &v[0];
```

The code above fails to compile. Instead, `deque<bool>` or `bitset` can be used as alternatives.

## Associative containers

### Item 19: Understand the difference between quality and equivalence

`set::insert` and the `find` algorithm are both make a comparison. Yet, the behavior of the comparison is different
because `set::insert` checks for equivalence, while `find` checks for equality.

|                 |                                                                                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Equality**    | Based on `operator==`, `x` and `y` are considered to be equal if `x == y`.                                                                                                                                            |
| **Equivalence** | Based on `operator<`, `x` and `y` are considered to be equal if `!(x < y) && !(y < x)`. Thinking about it in terms of some sorted range, this expression means `x` does not precede `y` and `y` does not precede `x`. |

While equality actually uses `operator==`, equivalence uses the predicate `key_comp`.

``` cpp
!c.key_comp()(x, y) && !c.key_comp()(y, x)
```

`c` is a sortable container.

Suppose a case-insensitive `set<string>` is desired. To do so, the `set` needs to know how to make a
case-insensitive comparison. Do so with a functor `class` whose `operator()` calls a
comparison function.

``` cpp
struct CIStringCompare:
public:
  binary_function<string, string, bool> {
  bool operator()(const string& lhs, const string& rhs) const
  {
    return ciStringCompare(lhs, rhs);
  }
};

set<string, CIStringCompare> ciss;
ciss.insert("STL"); // new element is added to set
ciss.insert("sTL"); // no new element is added to set

if (ciss.find("stl") != ciss.end()) ... // true
if (find(ciss.begin(), ciss.end(), "stl") != ciss.end()) ... // false
```

For info on how to write `ciStringCompare`, head over to [Item
35](effective_stl#item-35-implement-simple-case-insensitive-string-comparisons-via-mismatch-or-lexicographical_compare).
For more in equivalence, check out the hash tables in [Item
25](effective_stl#item-25-familiarize-yourself-with-the-nonstandard-hashed-containers).

### Item 20: Specify comparison types for associative containers of pointers

``` cpp
set<string*> ssp;
```

is shorthand for

``` cpp
set<string*, less<string*> > ssp;
```

`ssp` will sort by pointer value instead of by value. To sort by value, a custom comparison
functor `class` is needed.

``` cpp
struct StringPtrLess :
public binary_function<const string*, const string*, bool> {
  bool operator()(const string* ps1, const string* ps2) const
  {
    return *ps1 < *ps2;
  }
};

typdef set<string*, StringPtrLess> StringPtrSet;

StringPtrSet ssp;
...
```

> It might be handy to make this functor `class` generic so that it can be used for more than just
> `string`s.
> 
> ``` cpp
> struct DereferenceLess {
>   template<typename PtrType>
>   bool operator()(PtrType pT1, PtrType pT2) const
>   {
>     return *pT1 < *pT2;
>   }
> };
> ```

### Item 21: Always have comparison functions `return false` for equal values

``` cpp
set<int, less_equal<int> >  s; // s is sorted by "<="
s.insert(10);
s.insert(10);
```

When `10` is `insert`ed into `s` a second time, `s` will use `operator<=` to test for equivalence.
When the first `10` is compared to the second `10`, the test for equivalence becomes:

``` cpp
!(10 <= 10) && !(10 <= 10)
```

The test determines that the second `10` is not equal to the first `10` and the second `10` is
`insert`ed into `s`.

Comparison functions used to sort associative containers like `set` must define a "strict weak
ordering" over the objects they compare. One of the requirements of any function defining a strict
weak ordering is that it must `return` `false` if its passed two copies of the same value. Failure
to do so will break the functionality of the container and lead to unexpected results.

> Be careful when using `!` in a comparison function. Negating `<` is not equal to `>`.

### Item 22: Avoid in-place key modification in `set` and `multiset`

For `map` and `multimap`, in-place key modification is impossible.

``` cpp
map<int, string> m;
...
m.begin()->first = 10; // compile error
...

multimap<int, string> mm;
...
mm.begin()->first = 20; // compile error
```

This is because the elements of in an object of type `map<K, V>` or `multimap<K, V>` are of type
`pair<const K, V>`. Unfortunately, `set` and `multiset` are not the same. There's no
such equal standard for `set` and `multiset`, so it may be possible to change a key's value; it
depends on the implementation of the library.

> Though keys may be declared `const`, they are still vulnerable to `const_cast`. Doing so yields
> undefined results.

To safely change an element in a set:

1. Locate the element in the container that should be changed. (see [Item
   45](effective_stl#item-45-distinguish-among-count-find-binary_search-lower_bound-upper_bound-and-equal_range))
1. Make a copy of the element.
1. Change the copy as needed.
1. Remove the element form the container, typically via `erase` (see [Item
   9](effective_stl#item-9-choose-carefully-among-erasing-operations)).
1. Insert the new value into the container.

### Item 23: Consider replacing associative containers with sorted `vector`s

#### Sorted `vector` 

- **Consumes less memory** - Each node in an associative container consumes three extra pointers, left child, right
  child, and parent, plus overhead.
- **Faster searching** - Binary searches in a sorted `vector` are faster when page faults are considered.
- **Expensive insertions and erasures** - Using contiguous memory requires shifting everything beyond the new element.

Consider using a sorted `vector` instead of an associative container when lookups are almost never
mixed with insertions or erasures.

#### Sorted `vector` instead of `set`

``` cpp
vector<Widget> vw;

...

sort(vw.begin(), vw.end());

Widget w;
if (binary_search(vw.begin(), vw.end(), w)) ...

vector<Widget>::iterator i = lower_bound(vw.begin(), vw.end(), w);
if (i != vw.end() && !(w < *i)) ...

pair<vector<Widget>::iterator, vector<Widget>::iterator> range =
  equal_range(vw.begin(), vw.end(), w);
if (range.first != range.second) ...

sort(vw.begin(), vw.end());
```

#### Sorted `vector` instead of `map` or `multimap`

- `map<K, V>` is composed of elements of type `pair<const K, V>`. In a `vector` elements get moved
  around via assignment so the `const` must be omitted.
- When sorting, `map` only look at the key part of the element. A custom comparison function will
  be needed because `pair`'s `operator<` looks at both components.
- Another two comparison functions are needed for lookups. While sorting takes two `pair` objects,
  lookups take a key and a `pair` object. Two functions are needed so that the arguments can be
  swapped.

``` cpp
typedef pair<string, int> Data;

class DataCompare {
public:
  bool operator()(const Data& lhs, const Data& rhs) const {
    return keyLess(lhs.first, rhs.first);
  }

  bool operator()(const Data& lhs, const Data::first_type& k) const {
    return keyLess(lhs.first, k);
  }

  bool operator()(const Data::first_type& k, const Data& rhs) const {
    return keyLess(k, rhs.first);
  }

private:
  bool keyLess(const Data::first_type& k1, const Data::first_type& k2) const {
    return k1 < k3;
  }
};
```

``` cpp
vector<Data> vd;

...

sort(vd.begin(), vd.end(), DataCompare());

string s;
if (binary_search(vd.begin(), vd.end(), s, DataCompare())) ...

vector<Data>::iterator i = lower_bound(vd.begin(), vd.end(), s, DataCompare());
if (i != vd.end() && !DataCompare()(s, *i)) ...

pair<vector<Data>::iterator, vector<Data>::iterator> range =
  equal_range(vd.begin(), vd.end(), s, DataCompare());
if (range.first != range.second) ...

...

sort(vd.begin(), vd.end(), DataCompare());
```

### Item 24: Choose carefully between `map::operator[]` and `map::insert` when efficiency is important

``` cpp
class Widget {
public:
  Widget();
  Widget(double weight);

  Widget& operator=(double weight);
  ...
};

map<int, Widget> m;
```

The statement to "add" a `Widget` to `m`:

``` cpp
m[1] = 1.50;
```

is equal to:

``` cpp
typedef map<int, Widget> IntWidgetMap;

pair<IntWidgetMap::iterator, bool> result = m.insert(IntWidgetMap::value_type(1, Widget()));
result.first->second = 1.50;
```

Instead of default constructing and assigning, it would be more efficient to construct without the
assignment.

``` cpp
m.insert(IntWidgetMap::value_type(1, 1.50));
```

The situation reverses when "updating" a `Widget`.

``` cpp
m[1] = 2.50;

m.insert(IntWidgetMap::value_type(1, 2.50)).first->second = 2.50;
```

`insert` now costs an unnecessary construction and destruction.

A function that automatically detects the most efficient way to "add" or "update" is provide below.

``` cpp
template<typename MapType, typename KeyArgType, typename ValueArgType>

typename Maptype::iterator efficientAddOrUpdate(MapType& m,
                                                const KeyArgType& k,
                                                const ValueArgType& v)
{
  typename MapType::iterator lb = m.lower_bound(k);

  if (lb != map.end() && !(m.key_comp()(k, lb->first))) {
    lb->second = v;
    return lb;
  }
  else {
    typedef typename MapType::value_type MVT;
    return m.insert(lb, MVT(k, v));
  }
}
```

### Item 25: Familiarize yourself with the nonstandard hashed containers

As of C++11 hashed containers have been standardized as:

- `unordered_set`
- `unordered_multiset`
- `unordered_map`
- `unordered_multimap`

## Iterators

### Item 26: Prefer `iterator` to `const_iterator`, `reverse_iterator`, and `const_reverse_iterator`

When choosing an iterator, keep the following points in mind.

- Some versions of `insert` and `erase` need `iterator`. `const_iterator` and `reverse_iterator` won't do.
- It's not possible to implicitly convert a `const_iterator` to an `iterator`, and the technique
  described in [Item 27](effective_stl#item-27-use-distance-to-convert-a-containers-const_iterators-to-iterators) is
  neither universally applicable nor guaranteed to be efficient.
- Conversion from `reverse_iterator` to `iterator` may need extra steps after the
  conversion. See [Item 28](effective_stl#item-28-understand-how-to-use-reverse_iterators-base-iterator).
- Mixing iterators can sometimes cause funky compilation errors for seemingly correct code.

### Item 27: use `distance` to convert a container's `const_iterator`s to `iterator`s

``` cpp
typedef deque<int> IntDeque;
typedef IntDeque::iterator Iter;
typedef IntDeque::const_iterator ConstIter;

ConstIter ci;
...

Iter i(ci); // error! no implicit conversion from const_iterator to iterator

Iter i(const_cast<Iter>(ci)); // still an error!
```

All other containers fail to compile as well, except for `vector` and `string`, which
may compile. The two iterators should be treated as two separate `class`es; they usually are.

`distance` is the proper way to convert `const_iterator` to `iterator`.

``` cpp
IntDeque d;
ConstIter ci;
...

Iter i(d.begin());
advance(i, distance<ConstIter>(i, ci));
```

### Item 28: Understand how to use `reverse_iterator`'s base `iterator`

Recall from [Item
26](effective_stl#item-26-prefer-iterator-to-const_iterator-reverse_iterator-and-const_reverse_iterator) that some
functions need an `iterator`. For example, to `erase` or `insert`, a `reverse_iterator` must be converted to an
`iterator` using `base`.

After converting to `iterator`, it will point to the element preceding the `reverse_iterator` as if
it were decremented.

``` cpp
vector<int> v;
v.reserve(5);

for (int i = 1; i <= 5; ++i) {
  v.push_back(i);
}

vector<int>::reverse_iterator ri = find(v.rbegin(), v.rend(), 3);

vector<int>::iterator i(ri.base());

//   rend()        ri    rbegin()
//     |           |       |
//    \|/         \|/     \|/
//       | 1 | 2 | 3 | 4 | 5 |
//        /|\         /|\     /|\
//         |           |       |
//       begin()       i      end()
```

This off-by-one error must be considered depending on the operation:

-   **`insert`** - Element is inserted in *front* of element described by `iterator`. The base `iterator`
    is already in the correct position.
  
-   **`erase`** - Element `iterator` is pointing to is erased. The base `iterator` must be decremented.
  
    ``` cpp
    v.erase(--ri.base());
    ```

    > The code above is not portable because some implementations do not allow the pointer returned by
    > `base` to be modified. Instead, increment the `reverse_iterator` and then call `base`.
    > 
    > ``` cpp
    > v.erase((++ri).base());
    > ```

### Item 29: Consider `istreambuf_iterator`s for character-by-character input

``` cpp
istream inputFile("interestingData.txt");

string fileData((istream_iterator<char>(inputFile)), istream_iterator<char>());
```

The code above fails to copy whitespace in the file into the `string` because `istream_iterator`s use `operator>>`
to do the reading, and by default, `operator>>` functions skip whitespace. To copy whitespaces,
clear the `skipws` flag.

``` cpp
inputfile.unsetf(ios::skipws);
```

While `operator>>` provides powerful formatted input utility, it's overkill when the goal is
to grab the next character from the input stream. To improve efficiency, use `istreambuf_iterator`s
instead. Clearing the `skipws` flag isn't needed either.

## Algorithms

### Item 30: Make sure destination ranges are big enough

``` cpp
int transmogrify(int x);

vector<int> values;
...
vector<int> results;

transform(values.begin(), values.end(), results.end(), transmogrify);
```

The intention of the code above is to invoke `transmogrify` on every element in `values` and
`insert` at the `end` of the `results`. Yet, `*results.end()` doesn't exist and neither does any
object after it. To place objects at either end of a container, use `push_back` or
`push_front` and their associated iterators `front_inserter` and `back_inserter`.

``` cpp
transform(values.begin(), values.end(), back_inserter(results), transmogrify);
```

> `front_inserter` will insert objects in the *reverse* order of the corresponding objects in
> `values`. If that's not desired, iterate over `values` in reverse order.
> 
> ``` cpp
> transform(values.rbegin(), values.rend(), front_inserter(results), transmogrify);
> ```

> When working with `string` and `vector`, call `reserve` in advance. (See [Item
> 14](effective_stl#item-14-use-reserve-to-avoid-unnecessary-reallocations))
> 
> ``` cpp
> results.reserve(results.size() + values.size());
> ```

To overwrite, use `resize`.

``` cpp
if (results.size() < values.size()) {
  results.resize(values.size());
}

transform(values.begin(), values.end(), results.begin(), transmogrify);
```

Or, use `clear`.

``` cpp
results.clear();
results.reserve(values.size());

transform(values.begin(), values.end(), back_inserter(results), transmogrify);
```

### Item 31: Know your sorting options

| Goal                                                                           | Sorting algorithm                     |
| ------------------------------------------------------------------------------ | ------------------------------------- |
| Fully sort a container.                                                        | Use `sort` or `stable_sort`.          |
| Find top `n` elements                                                          | use `partial_sort`.                   |
| Find the element at position `n` or the top `n` element without ordering them. | Use `nth_element`.                    |
| Separate elements of an array into those that do and do not meet a criterion.  | Use `partition` or `stable_partiton`. |

When using `list`s, `partition` and `stable_partition` can be used directly, and `sort` and `stable_sort` can be
substituted for `list::sort`. `partial_sort` and `nth_element` cannot be used directly but it's possible to mimic
their behavior using other methods.

> Choose an algorithm based on what needs to be accomplished, not on performance considerations.

### Item 32: Follow `remove`-like algorithms by `erase` if you really want to remove something

`remove` is declared with a pair of iterators as parameters; it doesn't know anything about the
container on which it's operating.

``` cpp
vector<int> v;
v.reserve(10);
for (int i = 1; i <= 10; ++i) {
  v.push_back(i);
}

cout << v.size();                // prints 10

v[3] = v[5] = v[9] = 99;

remove(v.begin(), v.end(), 99);

cout << v.size();                // still prints 10
```

Here's how the `remove` call above works on `v`:

1. `v[0]`, `v[1]`, and `v[2]` do not need to be removed, continue to `v[3]`.
1. `v[3]` should be removed so mark `v[3]`.
1. `v[4]` does not need to be removed so assign `v[3]` to `v[4]`. `v[4]` is now marked.
1. `v[5]` should be removed, continue to `v[6]`.
1. `v[6]` do not need to be removed, assign `v[6]` to `v[4]`, mark `v[5]`.
1. As above, assign `v[7]` to `v[5]` and `v[8]` to `v[6]`. Mark `v[7]`.
1. `return` an `iterator` pointing to last marked element: `v[7]`.

`remove`d elements become garbage elements located in the back of the container. To actually remove them
from the container, use the range form of `erase`.

``` cpp
v.erase(remove(v.begin(), v.end(), 99), v.end());
```

> `list:remove` actually removes an element from its container. Inconsistent, but true.

> `unique` is another function that requires `erase`. True to form, `list::unique` actually removes adjacent
> duplicates from it's container as well.

### Item 33: Be wary of `remove`-like algorithms on containers of pointers

[Item 32](effective_stl#item-32-follow-remove-like-algorithms-by-erase-if-you-really-want-to-remove-something)
describes how the `remove` algorithm can re-assign `remove`d elements. When using containers with dynamically
allocated objects, pointers get reassigned; the objects become leaked memory.

Often, `partition` can be used in place of `remove`. Or, `delete` the pointers
and set them to `null` before using the `erase-remove` idiom.

``` cpp
void delAndNullifyUncertified(Widget*& pWidget)
{
  if (!pWidget->isCertified()) {
    delete pWidget;
    pWidget = 0;
  }
}

vector<Widget*> v;
...

for_each(v.begin(), v.end(), delAndNullifyUncertified)

v.erase(remove(v.begin(), v.end(), static_cast<Widget*>(0)), v.end());
```

Perhaps, the best choice is to replace pointers with *smart* pointers.

``` cpp
template<typename T>
class RCSP { ... }; // reference counting smart pointer

typdef RCSP<Widget> RCSPW;

vector<RCSPW> v;
...

v.erase(remove_if(v.begin(), v.end(), not1(mem_fun(&Widget::isCertified))), v.end());
```

### Item 34: Note which algorithms expect sorted ranges

In exchange for greater performance, the following algorithms need sorted ranges before they can be used:

- `binary_search`
- `upper_bound`
- `lower_bound`
- `equal_range`
- `set_union`
- `set_difference`
- `set_intersection`
- `set_symmetric_difference`
- `merge `
- `inplace_merge`
- `includes`

> If a different comparison function is used to sort a container, make sure the sorting algorithm has
> the same comparison function.
> 
> ``` cpp
> vector<int> v;
> ...
> sort(v.begin(), v.end(), greater<int>());
> ...
> bool a5Exists = binary_search(v.begin(), v.end(), 5, greater<int>());
> ```

### Item 35: Implement simple case-insensitive string comparisons via `mismatch` or `lexicographical_compare`

A non-standard way to compare `string`s is to use `stricmp` or `strcmpi`.

``` cpp
int ciStringCompare(const string& s1, const string& s2)
{
  return stricmp(s1.c_str(), s2.c_str());
}
```

To use STL, the first step is a write a character comparison function.

``` cpp
int ciCharCompare(char c1, char c2)
{
  int lc1 = tolower(static_cast<unsigned char>(c1));
  int lc2 = tolower(static_cast<unsigned char>(c2));

  if (lc1 < lc2) return -1;
  if (lc1 > lc2) return 1;
  return 0;
}
```

There's two common interfaces used to compare strings:

- **`strcmp`** - `return` negative number, positive number or zero
- **`operator<`** - `return` `true` or `false`

`mismatch` `return`s the first position in two ranges where corresponding values are not the
same; it's ideal for the `strcmp` interface. When using `mismatch`, the first range must be shorter
than the second.

``` cpp
int ciStringCompareImpl(const string& s1, const string& s2);

int ciStringCompare(const string& s1, const string& s2)
{
  if (s1.size() <= s2.size()) return ciStringCompareImpl(s1, s2);
  else return -ciStringCompareImpl(s2, s1);
}

int ciStringCompareImpl(const string& s1, const string& s2)
{
  typdef pair<string::const_iterator, string::const_iterator> PSCI;

  PSCI p = mismatch(s1.begin(), s1.end(), s2.begin(), not2(ptr_fun(ciCharCompare)));

  if (p.first == s1.end()) {
    if (p.second == s2.end()) return 0;
    else return -1;
  }

  return ciCharCompare(*p.first, *p.second);
}
```

To implement the `operator<` interface, `ciCharCompare` can be modified into a STL predicate and
used with `lexicographical_compare`.

``` cpp
bool ciCharLess(char c1, char c2)
{
  return
    tolower(static_cast<unsigned char>(c1)) <
    tolower(static_cast<unsigned char>(c2));
}

bool ciStringCompare(const string& s1, const string& s2)
{
  return lexicographical_compare(s1.begin(), s1.end(), s2.begin(), s2.end(), ciCharLess);
}
```

> The asumption of these two functions is that the strings are not internationalized. If this is a
> concern, look at `std::locale`.

### Item 36: Understand the proper implementation of `copy_if`

`copy_if` is not a STL algorithm. It's trival to implement, but it's also trivial to implement it
wrong. Below is the wrong implementation.

``` cpp
template<typename InputIterator, 
         typename OutputIterator, 
         typename Predicate>
OutputIterator copy_if(InputIterator begin, 
                       InputIterator end, 
                       OutputIterator destBegin, 
                       Predicate p)
{
  return remove_copy_if(begin, end, destBegin, not1(p));
}
```

[Item 41](effective_stl#item-41-understand-the-reasons-for-ptr_fun-mem_fun-and-mem_fun_ref) describes how `not1`
cannot be applied directly to a function pointer; the pointer must be passed through `ptr_fun` first. Passing an
*adaptable* function object shouldn't be required of the client.

``` cpp
template<typename InputIterator, 
         typename OutputIterator, 
         typename Predicate>
OutputIterator copy_if(InputIterator begin, 
                       InputIterator end, 
                       OutputIterator destBegin, 
                       Predicate p)
{
  while (begin != end) {
    if (p(*begin)) *destBegin++ = *begin;
    ++begin;
  }

  return destBegin;
}
```

### Item 37: Use `accumulate` or `for_each` to summarize ranges

`accumulate` and `for_each` are used to boil down an entire range into a single object.

#### `accumulate`

The default behavior of `acumulate` is to iterate through a range and `return` a sum using
`operator+`. Yet, `accumulate` can be generalized further by passing in a summarization
function.

``` cpp
struct Point {
  Point(double initX, double initY) : x(initX), y(initY) {}
  double x, y;
};

class PointAverage : public binary_function<Point, Point, Point> {
public:
  PointAverage() : numPoints(0), xSum(0), ySum(0) {}

  const Point operator()(const Point& avgSoFar, const Point& p)
  {          
    ++numPoints;
    xSum += p.x;
    ySum += p.y;

    return Point(xSum / numPoints, ySum / numPoints);
  }

private:
  size_t numPoints;
  double xSum;
  double ySum;
};

list<Point> lp;
...
Point avg = accumulate(lp.begin(), lp.end(), Point(0,0), PointAverage());
```

#### `for_each`

`for_each` is slightly more generic than `acumulate` in that it that it does not `return` a single
object directly, but, with a little extra work, it can do the same thing as `accumulate`.

``` cpp
struct Point { ... };

class PointAverage : public unary_function<Point, void> {
public:
  PointAverage() : numPoints(0), xSum(0), ySum(0) {}

  void operator()(const Point& p)
  {
    ++numPoints;
    xSum += p.x;
    ySum += p.y;
  }

  Point result() const
  {
    return Point(xSum / numPoints, ySum / numPoints);
  }

private:
  size_t numPoints;
  double xSum;
  double ySum;
};

list<Point> lp;
...

Point avg = for_each(lp.begin(), lp.end(), PointAverage()).result();
```

## Functors, Function Classes, Functions, etc

### Item 38: Design functor classes for pass-by-value

C and C++ need functions to be passed as pointers to functions. STL function objects (functors)
are modeled after function pointers. By convention, functors are always passed by value. Because of
this convention, functors should be:

- **small** to lessen the expense of copying.
- **monomorphic** to prevent slicing issues with the copy constructor.

Functors that need to be both large and polymorphic, like the one below:

``` cpp
template<typename T>
class BPFC : public unary_function<T, void> {    // "Big Polymorphic Functor Class"
private:
  Widget w;
  int x;
  ...                                           // lots of data
public:
  virtual void operator()(const T& val) const;  // susceptible to slicing
  ...
};
```

can be converted to acceptable functors using the *pimpl idiom*, like so:

``` cpp
template<typename T>
class BPFCImpl : public unary_function<T, void> {
private:
  Widget w;                                    // move all the data in BPFC here
  int x;
  ...
  virtual ~BPFCImpl();                       
  virtual void operator()(const T& val) const;

friend class BPFC<T>;
};

template<typename T>
class BPFC : public unary_function<T, void> {
private:
  BPFCImpl<T> *pImpl;                         // BPFC's only data

public:
  void operator()(const T& val) const         // nonvirtual
  {
    pImpl->operator()(val);
  }
  ...
};
```

### Item 39: Make predicates pure functions

STL implementations are allowed to copy predicates. 

``` cpp
class BadPredicate : public unary_function<Widget, bool> {
public:
  BadPredicate() : timesCalled(0) {}

  bool operator()(const Widget&)
  {
    return ++timesCalled == 3;
  }
private:
  size_t timeCalled;
};
```

``` cpp
bool anotherBadPredicate(const Widget&, const Widget&)
{
  static int timesCalled = 0;
  return ++timesCalled == 3;
}
```

If a predicate has some internal state, like the examples above, it's behavior is undefined because the object can be
copied and thus its internal state can be wiped out at any time.

A well behaved predicate must be a pure function; it's `return` value should only depend on its
parameters.

### Item 40: Make functor classes adaptable

STL functors are modeled after C++ functions, and a C++ function has only one set of parameter types
and one `return` type. As a result, the STL implicitly assumes each functor has only one
`operator()` function, and it's the parameter and `return` types for this function that should be
passed to `unary_function` or `binary_function`. Failure to do so will remove a functors
*adaptability*.

Making an *adaptable* functor will allow it to enjoy the benefits of the four standard function
adapters: `not1`, `not2`, `bind1st`, and `bind2nd`.

### Item 41: Understand the reasons for `ptr_fun`, `mem_fun`, and `mem_fun_ref`

For function `f` and object `x`, C++ gives three different syntaxes for invoking `f` on `x`

``` cpp
f(x);   // Syntax #1: f is non-member function
x.f();  // Syntax #2: f is member function, x is object or reference
p->f(); // Syntax #3: f is member function, p is pointer to x 
```

- `mem_fun` adapts Syntax #3 to Syntax #1.
- `mem_fun_ref` adapts Syntax #2 to Syntax #1.
- `ptr_fun` allows functions to be adaptable by providing necessary `typedef`s that adapters need.

### Item 42: Make sure `less<T>` means `operator<`

`less<T>` is expected to use `operator<` as a functor. Do make `less` do anything other than call
`operator<`.

For example, suppose a `Widget` can be sorted either by its `weight` or by its `maxSpeed`, and,
`operator<` compares two `Widget`s `weight`s.

``` cpp
class Widget {
public:
  ...
  size_t weight() const;
  size_t maxSpeed() const;
  ...
};

bool operator<(const Widget& lhs, const Widget& rhs)
{
  return lhs.weight() < rhs.weight();
}
```

`Widget` can now be sorted by `weight` with `less<Widget>`. If instead, a `Widget` needs to be
sorted by `maxSpeed`, do not re-define `less<Widget>`.

``` cpp
template<>
struct std::less<Widget> : public std::binary_function<Widget, Widget, bool> {
  bool operator()(const Widget& lhs, const Widget& rhs) const
  {
     return lhs.maxSpeed() < rhs.maxSpeed();
  }
};
```
 
Instead, make a brand new `struct` like `MaxSpeedCompare`, for example.

## Programming with the STL

### Item 43: Prefer algorithm calls to hand-written loops

Algorithm calls are preferable to hand-written loops because they offer:

- Efficiency
- Correctness
- Maintainability

#### Efficiency

-   **Minor:** Eliminates redundant computations.
   
    ``` cpp
    for(list<Widget>::iterator i = lw.begin(); i != lw.end(); ++i) {
      i->redraw();
    }
    ```
   
    The code above calls `list::end` each time around the loop.
   
    ``` cpp
    for_each(lw.begin(), lw.end(), mem_fun_ref(&Widget::redraw));
    ```
   
    `for_each` calls `list::end` once.
     
-   **Major:** Library implementations take advantage of their own container implementations to do faster traversals
    than anything you can come up with.
-   **Major:** Algorithms in the STL are much more sophisticated than anything you can come up with.

#### Correctness

Writers of hand-written loops need to worry about whether their `iterator`s are valid and that they point to the
right spot. Algorithms don't need `iterator` maintenance.

For example, take each element in an array, add 41 to it, and then `insert` it into the front of a `deque`.

``` cpp
double data[maxNumDoubles];
deque<double> d;
...

size_t numDoubles = fillArray(data, maxNumDoubles);

for (size_t i = 0; i < numDoubles; ++i) {
  d.insert(d.begin(), data[i] + 41);
}
```

Unintentionally, elements are `insert`ed in the reverse order of the corresponding elements in
`data`.

``` cpp
deque<double>::iterator insertLocation = d.begin();

for (size_t i = 0; i < numDoubles; ++i) {
  d.insert(insertLocation++, data[i] + 41);
}
```

After the first `insert`, `insertLocation` is invalidated.

``` cpp
deque<double>::iterator insertLocation = d.begin();

for (size_t i = 0; i < numDoubles; ++i) {
  insertLocation = d.insert(insertLocation, data[i] + 41);
  ++insertLocation;
}
```

Now, the code is correct, but the following algorithm does the same thing.

``` cpp
transform(data, data + numDoubles, inserter(d, d.begin()), bind2nd(plus<double>(), 41));
```

#### Maintainability

Each STL algorithm carries out some well-defined task and it's reasonable to expect professional
C++ programmers to know (or lookup) what each does. In general, it's easier to follow a call to an
algorithm than it's to decode a loop.

An exception to this rule is when an algorithm needs a separate functor or multiple adapters.

``` cpp
vector<int> v;
int x, y;
...

vector<int>::iterator i = v.begin();
for( ; i != v.end(); ++ i) {
  if (*i > x && *i < y) break;
}
...
```

The code above can be replaced using the algorithm `find_if`.

``` cpp
vector<int>::iterator i = find_if(v.begin(), v.end(), 
                                  compose2(logical_and<bool>(), 
                                           bind2nd(greater<int>(), x), 
                                           bind2nd(less<int>(), y)));
```

`find_if` can be simplified using a functor.

``` cpp
template<typename T>
class BetweenValues : public unary_function<T, bool> {
public:
  BetweenValues(const T& lowValue, const T& highValue)
  : lowVal(lowValue), highVal(highValue)
  {}

  bool operator()(const T& val) const
  {
     return val > lowVal && val < highValue;
  }

private:
  T lowVal;
  T highVal;
};

vector<int>::iterator i = find_if(v.begin(), v.end(), BetweenValues<int>(x, y));
```

In this case, most would find the `for`-loop preferable to manage. Yet, an increasingly
complex loop can quickly tilt the scales into the functor`s favor.

### Item 44: Prefer member functions to algorithms with the same names

Some containers have member functions with the same names as STL algorithms. Those member functions
are preferable to the algorithms because they are:

- Faster
- Integrate better with the container than the algorithm.

### Item 45: Distinguish among `count`, `find`, `binary_search`, `lower_bound`, `upper_bound`, and `equal_range`

<table>
<colgroup>
<col style="width: 27%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 21%" />
<col style="width: 18%" />
</colgroup>
<thead>
<tr class="header">
<th>What to search</th>
<th>Algorithm to use</th>
<th></th>
<th>Member function to use</th>
<th></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td></td>
<td><strong>Unsorted?</strong></td>
<td><strong>Sorted?</strong></td>
<td><strong><code>set</code> or</strong> <strong><code>map</code>?</strong></td>
<td><strong><code>multiset</code> or</strong> <strong><code>multimap</code>?</strong></td>
</tr>
<tr class="even">
<td>Does the desired value exist?</td>
<td><code>find</code></td>
<td><code>binary_search</code></td>
<td><code>count</code></td>
<td><code>find</code></td>
</tr>
<tr class="odd">
<td>Does the desired value exist? If so, where is the first object with that value?</td>
<td><code>find</code></td>
<td><code>equal_range</code></td>
<td><code>find</code></td>
<td><code>find</code> or <code>lower_bound</code></td>
</tr>
<tr class="even">
<td>Where is the first object with a value not preceding the desired value?</td>
<td><code>find_if</code></td>
<td><code>lower_bound</code></td>
<td><code>lower_bound</code></td>
<td><code>lower_bound</code></td>
</tr>
<tr class="odd">
<td>Where is the first object with a value succeeding the desired value?</td>
<td><code>find_if</code></td>
<td><code>upper_bound</code></td>
<td><code>upper_bound</code></td>
<td><code>upper_bound</code></td>
</tr>
<tr class="even">
<td>How many objects have the desired value?</td>
<td><code>count</code></td>
<td><code>equal_range</code>, then <code>distance</code></td>
<td><code>count</code></td>
<td><code>count</code></td>
</tr>
<tr class="odd">
<td>Where are all the objects with the desired value?</td>
<td><code>find</code></td>
<td><code>equal_range</code></td>
<td><code>equal_range</code></td>
<td><code>equal_range</code></td>
</tr>
</tbody>
</table>

### Item 46: Consider function object instead of functions as algorithm parameters

Function objects, or functors, are preferable to functions as parameters to algorithms because they are:

- **Efficient** - Functors can be `inline`d while passing a function directly guarantees a function
  call.
- **Robust** - Sometimes subtle, compiler-related bugs and pitfalls that can be
  encountered when using `const` member functions or `template`d functions.

### Item 47: Avoid producing write-only code

Use of the STL can produce code that is hard to read.

``` cpp
vector<int> v;
int x, y;
...

v.erase(
  remove_if(find_if(v.rbegin(), v.rend(), 
                    bind2nd(greater_equal<int>(), y)).base(), 
            v.end, 
            bind2nd(less<int>(), x)), 
  v.end());
```

Except for the `erase-remove` idiom, try to make it so that the code is only doing one
thing per line.

``` cpp
typedef vector<int>::iterator VecIntIter;
VecIntIter rangeBegin = find_if(v.rbegin(), v.rend(), bind2nd(greater_equal<int>(), y)).base();

v.erase(remove_if(rangeBegin, v.end(), bind2nd(less<int>(), x)), v.end());
```

### Item 48: Always `#include` the proper headers

To keep code portable, include all the necessary STL headers. Provided below is a quick summary of
whats in each STL-related header.

- Almost all the containers are declared in headers of the same name. The exceptions are `<set>`
  and `<map>`. `<set>` declares `set` and `multiset`. `<map>` declares `map` and `multimap`.
- All but four algorithms are declared in `<algorithm>`. Exceptions are `accumulate`,
  `inner_product`, `adjacent_difference`, and `partial_sum`, which are all declared in
  `<numeric>`.
- Special kinds of iterators, including `istream_iterator`s and `istreambuf_iterator`s, are
  declared in `<iterator>`.
- Standard functors (such as `less<T>`) and functor adapters (such as `not1`, `bind2nd`) are declared in
  `<functional>`.

### Item 49: Learn to decipher STL-related compiler diagnostics

When using the STL, compilers tend to emit gruesome compiler errors. Below is a list of hints for
decoding them.

- For `vector` and `string`, iterators are sometimes pointers, so compiler diagnostics may refer
  to pointer types if there's an error with an `iterator`.
- Messages mentioning `back_insert_iterator`, `front_insert_iterator`, or `insert_iterator` almost
  always describe an error calling `back_inserter`, `front_inserter` or `inserter`,
  respectively.
- Similarly, messages mentioning `binder1st` or `binder2nd` probably describe an error with
  `bind1st` or `bind2nd`.
- Output iterators do their outputting or inserting work inside assignment operators. Messages
  complaining about something inside some assignment operator are likely produced because of them.
- Error messages originating from inside an implementation of an STL algorithm usually describe something is wrong
  with the types used with that algorithm.
- If a compiler doesn't know a common STL-component, it's usually because of missing `#include`s.
  These typically arise when an application is ported to a new platform. See 
  [Item 48](effective_stl#item-48-always-include-the-proper-headers).

### Item 50: Familiarize yourself with STL-related web sites

For the bleeding-edge, check out the Boost library.
