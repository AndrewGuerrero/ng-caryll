# More Effective C++

*1996 Scott Meyers*

## Basics

### Item 1: Distinguish between pointers and references

- There is no such thing as a `null` reference.
- References require the object to be initialized.

> ``` cpp
> char *pc = 0;
> char& rc = *pc;   // null reference
> 
> string& rs;       // needs initialization
> ```

> `operator[]` should `return` a reference instead of a pointer as a convention.
> 
> ``` cpp
> vector<int> v(10);
> v[5] = 10;  // target of this assignment is
>             // the return value of operator[]
> ```
> 
> Otherwise, if `operator[]` `return`ed a pointer, it must be de-referenced to avoid assigning the
> pointer.
> 
> ``` cpp  
> *v[5] = 10;
> ```

### Item 2: Prefer C++-style casts

C++ offers four cast operators.

#### `const_cast`

- Change the `const`ness of an object.
- Change the `volatile`ness of an object.


``` cpp
class Widget { ... };
class SpecialWidget : public Widget { ... };

void update(SpecialWidget *psw);

SpecialWidget sw;
const SpecialWidget& csw = sw;   // const reference to non-const object

update(&csw);  // error, can't pass a const SpecialWidget*
update(const_cast<SpecialWidget*>(&csw));    // fine
update((SpecialWidget*)&csw); // fine, but hard to recognise

Widget *pw = new SpecialWidget;
update(pw); // error, can't pass a Widget*
update(const_cast<SpecialWidget*>(pw)); // error, const_cast cannot cast down the inheritance hierarchy
```

#### `dynamic_cast`

- *Safe cast* an object down or across an inheritance hierarchy. *Safe cast* will
  - Set pointer to `null` if cast fails
  - `throw` an `exception` if reference cast fails


``` cpp
Widget *pw;
...
update(dynamic_cast<SpecialWidget*>(pw)); // fine but may pass a null pointer
void updateViaRef(SpecialWidget& rsw);
updateViaRef(dynamic_cast<SpecialWidget&>(*pw)); // fine but may throw an exception

int firstNumber, secondNumber;
...
double result = dynamic_cast<double>(firstNumber)/secondNumber; // error, int has no virtual functions (Item 24)
const SpecialWidget csw;
...
update(dynamic_cast<SpecialWidget*>(&csw));  // error, can't cast away constness
```

#### `static_cast`

- Closest to the C-style cast.
- More flexible than `dynamic_cast` for situations where inheritance is not involved.

#### `reinterpret_cast`

- This cast should be rarely used as it destroys portability.
- The most common use is to cast between function pointer types.

``` cpp
typedef void (*FuncPtr)(); // function takes no args and returns ``void``
FuncPtr funcPtrArray[10];
int doSomething();
funcPtrArray[0] = &doSomething; // error, type mismatch
funcPtrArray[0] = reinterpret_cast<FuncPtr>(&doSomething); // compiles
```

> Avoid casting function pointers as results may vary.

### Item 3: Never treat arrays polymorphically

Inheritance allows manipulation of derived `class` objects through pointers and references to base
`class` objects. C++ also allows manipulation of arrays of derived objects as well. However, it
shouldn't be attempted.

``` cpp
class BST { ... }; // Binary Search Tree for ints
class BalancedBST : public BST { ... };

void printBSTArray(ostream& s, const BST array[], int numElements)
{
  for (int i = 0; i , numElements; ++i) {
    s << array[i]; // assumes operator<< is defined for BST objects
  }
}

BST BSTArray[10];
...
printBSTArray(cout, BSTArray, 10); // works fine

BalancedBSTArray bBSTArray[10];
...
printBSTArray(cout, bBSTArray, 10); // works fine?
```

`array[i]` is pointer arithmetic that assumes it is working with objects `sizeof(BST)`. Unless
`balancedBST` is the same size as `BST`, the result will not be pleasant.

> The same issue arises with `delete[]` which also uses pointer arithmetic.

The best way to fix this issue is to prevent it from happening. Do not have a concrete `class`
(`BalancedBST`) inherit from another concrete `class` (`BST`). For more info, visit [Item
33](more_effective_cpp#item-33-make-non-leaf-classes-abstract).

### Item 4: Avoid gratuitous default constructors

Some objects conceptually shouldn't have a default constructor.

``` cpp
class EquipmentPiece {
public:
  EquipmentPiece(int IDNumber);
  ...
};
```

`class`es that lack a default constructor are problematic in three contexts

- Arrays
- `template`s
- `virtual` base `class`es

#### Arrays

In general there is no way to specify constructor arguments for objects in an array.

``` cpp
EquipmentPiece bestPieces[10];                        // error, no way to call constructor
EquipmentPiece *bestPieces = new EquipmentPiece[10];  // same problem
```

Below are three ways to workaround this issue.

**non-heap arrays**

``` cpp
int ID1, ID2, ID3, ..., ID10;
...
EquipmentPiece bestPieces[] = {
  EquipmentPiece(ID1),
  EquipmentPiece(ID2),
  EquipmentPiece(ID3),
  ...,
  EquipmentPiece(ID10)
};
```

**array of pointers**

``` cpp
typedef EquipmentPiece* PEP;

PEP bestPieces[10];              // no constructors called
PEP *bestPieces = new PEP[10];   // also fine

for (int i = 0; i < 10; ++i)
  bestPieces[i] = new EquipmentPiece( ID number );
```

> This approach is prone to memory leaks as it's easy to forget to `delete` the objects pointed to by
> the array.

**placement** `new` (see [Item 8](more_effective_cpp#item-8-understand-the-different-meanings-of-new-and-delete))

``` cpp
void *rawMemory = operator new[](10*sizeof(EquipmentPiece));
EquipmentPiece *bestPieces = static_cast<EquipmentPiece*>(rawMemory);
for (int i = 0; i < 10; ++i)
  new (bestPieces+i) EquipmentPiece( ID Number );
```

> In addition to manually calling the destructors on the objects in the array, raw memory must also be
> manually deallocated by calling `operator delete[]`
> 
> ```cpp
> for (int i = 9; i >= 0; --i)
>   bestPieces[i].~EquipmentPiece();
> 
> operator delete[](rawMemory);
> ```

#### `template`s

It is common for `template`-based container `class`es to usually use arrays of the `template`
parameter type.

``` cpp
template<class T>
class Array {
public:
  Array(int size);
  ...

private:
  T *data;
};

template<class T>
Array<T>::Array(int size)
{
  data = new T[size]; // calls T::T() for each element of the array.
  ...
}
```

This problem can be eliminated with careful `template` design.

#### `virtual` base `class`es

`virtual` base `class`es with no default constructor are painful to work with for derived `class`
authors because they need to magically know about, understand the meaning of and provide for the
`virtual` base `class`'s arguments.

## Operators

### Item 5: Be wary of user-defined conversion functions

Implicit conversions where information can be lost is possible in C++. Conversions like `int` to
`short` are allowed. However, when new function types are created, they have more control because
the author can choose to not provide the functions compilers use for implicit conversions. There are
two kinds of functions to worry about.

- implicit type conversion operators
- single-argument constructors

These types of functions should be avoided\!

#### Implicit type conversion operators

*Implicit type conversion operators* are member functions called `operator` followed by a type
specification.

``` cpp
class Rational {
public:
  ...
  operator double() const; // converts Rational to double
};

Rational r(1,2);
double d = 0.5 * r; // converts r to a double, then does multiplication
```

Suppose someone wants to print `r` without `operator<<` being defined.

``` cpp
Rational r(1,2);
cout << r;
```

Unexpectedly, the print will not fail. Since there is no `operator<<`, the compiler will search for
a acceptable sequence of implicit conversions that could be applied to make the call succeed. In
this case, the compiler would call `Rational::operator double`. `r` would then be printed as a
floating point number instead of a `Rational`.

The solution is to replace the implicit type conversion operator with an equivalent function.

``` cpp
class Rational {
public:
  ...
  double asDouble() const;
};

Rational r(1,2);
cout << r; // error!
cout << r.asDouble(); // fine, prints r as double
```

#### Single-argument constructors

*Single-argument constructors* may declare a single parameter or it may declare multiple parameters,
with each parameter after the first having a default value.

``` cpp
class Name {
public:
  Name(const string& s); // can implicitly convert string to Name
  ...
};

class Rational {
public:
  Rational(int numerator = 0, int denominator = 1); // can implicitly convert int to Rational
  ...
};
```

These functions are more difficult to eliminate and the problems they cause are worse. For example,
consider the following buggy code

``` cpp
template<class T>
class Array {
public:
  Array(int lowBound, int highBound);
  Array(int size);
  
  T& operator[](int index);
  ...
};

bool operator==(const Array<int>& lhs, const Array<int>& rhs);
Array<int> a(10);
Array<int> b(10);
...
for (int i = 0; i < 10; ++i) 
{
  if (a == b[i]) { // oops! a should be a[i]
    ...
  }
  else {
    ...
  }
}
```

Unfortunately, the compiler will not complain because `operator==` is defined. Since there is a
constructor for `Array` that takes a single `int` argument, the compiler generates code that looks
like

``` cpp
for (int i = 0; i < 10; ++i)
  if (a == static_cast< Array<int> >(b[i])) ...
```

To solve this problem, the `explicit` keyword exists to tell compilers that they may not use the
constructor for implicit conversions.

``` cpp
template<class T>
class Array {
public:
  ...
  explicit Array(int size);
  ...
};

Array<int> a(10);
Array<int> b(10);
if (a == b[i]) ...                              // error!
if (a == Array<int>(b[i])) ...                  // okay, logic aside
if (a == static_cast< Array<int> >(b[i])) ...   // same
if (a == (Array<int>)b[i]) ...                  // same
```

> ``` cpp
> static_cast< Array<int> >(b[i]))
> static_cast<Array<int>>(b[i]))
> ```
> 
> These two lines have a different meaning because of `operator>>`. Spaces are important.

If `explicit` is not available, another solution is careful `class` construction.

``` cpp
template<class T>
class Array {
public:

  class ArraySize {
  public:
    ArraySize(int numElements): theSize(numElements) {}
    int size() const { return numElements; }
  
  private:
    int theSize;
  };
  
  Array(int lowBound, int highBound);
  Array(ArraySize size);
  ...
}
```

Compilers are not allowed to perform double implicit conversions from `int` to `ArraySize` and then
`ArraySize` to `Array<int>`, it's verboten. `class`es such as `ArraySize` are called *proxy*
`class`es (see [Item 30](more_effective_cpp#item-30-proxy-classes)).

### Item 6: Distinguish between prefix and postfix forms of increment and decrement operators

Postfix forms of increment take a `int` argument, and compilers silently pass `0` as the `int`. The
only use of the parameter is to distinguish prefix and postfix invocation.

``` cpp
class UPInt {                    // "unlimited precision int"
public:
  UPInt& operator++();          // prefix ++
  const UPInt operator++(int);  // postfix ++

  UPInt& operator--();          // prefix --
  const UPInt operator--();     // postfix --

  UPInt& operator+=(int)        // += operator for UPInts and ints
  ...
};

UPint i;
++i;     // i.operator++();
i++;     // i.operator++(0);

--i;     // i.operator--();
i--;     // i.operator--(0);

// prefix form: increment and fetch
UPInt& UPInt::operator++()
{
  *this += 1;
  return *this;
}

// postfix form: fetch and increment
const UPInt::operator++(int)
{
  const UPInt oldValue = *this;
  ++(*this);
  return oldValue;
}
```

> *   It is common to omit the name of the parameter so compilers don't complain about unused
>     parameters.
>     
> *   Postfix returns a `const` value to prevent code like
>       
>       ``` cpp
>       i++++;   // i.operator(0).operator(0);
>       ```
>       
>     which is prohibited for built-int types (developers must prohibit their own types themselves).
>     Additionally, `i` would only be incremented once since the `oldValue` is `return`ed and not the
>     incremented value.

> The prefix version is more efficient than the postfix version which needs to make multiple
> temporaries.

</div>

### Item 7: Never overload `&&`, `||` or `,`

If `&&` is overloaded, what looks like this

``` cpp
if (expression1 && expression2) ...
```

looks to compilers like this

``` cpp
if (expression1.operator&&(expression2))  // member function version
if (operator&&(expression1, expression2)) // global function version
```

When a function call is made, all parameters must be evaluated; short-circuit functionality is lost.
Additionally, there is no guarantee which expression will be evaluated first where short-circuit
evaluation always evaluates from left to right.

The comma operator can be used to form expressions like so

``` cpp
// reverse string s in place
void reverse(char s[])
{
  for (int i = 0, j = strlen(s)-1; i < j; ++i, --j)
  {
    int c = s[i];
    s[i] = s[j];
    s[j] = c;
  }
}
```

Similarly "`,`" evaluates from left to right. There is no way to produce this functionality when the
operator is overloaded.

Mentioned above are the operators that technically can, but shouldn't be overloaded. Below is a list
of operators that can't be
overloaded.

```
\.   .*   ::   ?:   new   delete   sizeof  typeid   static_cast   const_cast   dynamic_cast   reinterpret_cast
```

Finally, for completeness, below is the list of operators that can be overloaded with care.

```
operator new   operator delete   operator new[]   operator delete[]
+  *    *    /    &    \     |     ~    !    =    <    >    +=    -=   *=   /=   %=
^=   &=   |=   <<   >>   >>=   <<=   ==   !=   <=   >=   ++   --   ->*   ->   ()   []
```

### Item 8: Understand the different meanings of `new` and `delete`

#### `new`

-   To create an object on the heap, use the `new` operator. It both allocates memory and calls the
    constructor for that object.
    
    ``` cpp
    string *ps = new string("Memory Management");
    ```
    
-   To only allocate memory, call `operator new`; no constructor will be called.
    
    ``` cpp
    void *rawMemory = operator new(sizeof(string));
    ```
    
    > When declaring `operator new` the first parameter must be `size_t` which specifies how much
    > memory to allocate.
    
-   To construct an object in a particular chunk of memory, use placement `new`.
    
    ``` cpp
    class Widget {
    public:
      Widget(int widgetSize);
      ...
    };
    
    Widget* constructWidgetInBuffer(void* buffer, int widgetSize)
    {
      return new (buffer) Widget(widgetSize);
    }
    
    void* operator new(size_t, void* location)
    {
      return location;
    }
    ```
    
    Placement `new` is `operator new` with an additional parameter to the memory which is simply
    returned.

#### `delete`

-   To deallocate memory as well as call the destructor, use the `delete` operator.
    
    ``` cpp
    string *ps;
    ...
    delete ps;
    ```
    
-   To only deallocate memory, call `operator delete`
    
    ``` cpp
    ps->~string();
    operator delete(ps);
    ```
    
-   If placement `new` is used to create an object, explicitly call the objects destructor.
    
    ``` cpp
    void * mallocShared(size_t size);
    void freeShared(size_t size);
    
    void sharedMemory = mallocShared(sizeof(Widget));
    
    Widget *pw = constructWidgetInSharedBuffer(sharedMemory, 10);
    ...
    
    pw->~Widget();
    // or
    freeShared(pw);
    ```
    
    > Do not use the `delete` operator on any memory that was allocated with placement `new`.

#### Array syntax

When using arrays, calls to `operator new` and `operator delete` are replaced with `operator new[]`
and `operator delete[]` instead. Overload these carefully.

## `exception`s

### Item 9: Use destructors to prevent resource leaks

``` cpp
class ALA { // Adorable Little Animal
public:
  virtual void processAdoption() = 0;
  ...
};

class Puppy : public ALA {
public:
  virtual void processAdoption();
  ...
};

class Kitten : public ALA {
public:
  virtual void processAdoption();
  ...
};

ALA* readALA(istream& dataSource);

void processAdoptions(istream& dataSource)
{
  while (dataSource) {
    ALA* pa = readALA(dataSource);
    pa->processAdoption();
    delete pa;
  }
}
```

`readALA` creates a new heap object each time it's called. Without the call to `delete`, the loop
would contain a resource leak. Assuming `processAdoption` will `throw` an `exception` (something
that should always be assumed), `processAdoptions` will contain a resource leak every time
`pa->processAdoption()` `throw`s.

``` cpp
void processAdoptions(istream& dataSource)
{
  while (dataSource) {
    ALA* pa = readALA(dataSource);
    try {
      pa->processAdoption();
    }
    catch (...) {
      delete pa;
      throw;
    }
    delete pa;
  }
}
```

Solving by surrounding in `try` and `catch` blocks can quickly become distracting and difficult to
maintain. Instead, use smart pointers such as `std::auto_ptr`. See [Item 28](more_effective_cpp#item-28-smart-pointers) for
more details.

``` cpp
void processAdoptions(istream& dataSource)
{
  while (dataSource) {
    auto_ptr<ALA> pa(readALA(dataSource));
    pa->processAdoption();
  }
}
```

Constructors and destructors can also `throw`. Read more about this in [Items
10](more_effective_cpp#item-10-prevent-resource-leaks-in-constructors) and [11](more_effective_cpp#item-11-prevent-exceptions-from-leaving-destructors).

### Item 10: Prevent resource leaks in constructors

#### Pointers

``` cpp
// header
class Image {
public:
  Image(const string& imageDataFileName);
  ...
};

class AudioClip {
public:
  AudioClip(const string& audioDataFileName);
  ...
};

class PhoneNumber { ... };

class BookEntry {
public:
  BookEntry(const string& name,
            const string& address = "",
            const string& imageFileName = "",
            const string& audioClipFileName = "");
  ~BookEntry();
  void addPhoneNumber(const PhoneNumber& number);
  ...

private:
  string theName;
  string theAddress;
  list<PhoneNumber> thePhones;
  Image* theImage;
  AudioClip* theAudioClip;
};

// source
BookEntry::BookEntry(const string& name,
                     const string& address = "",
                     const string& imageFileName = "",
                     const string& audioClipFileName = "")
: theName(name),
  theAddress(address),
  theImage(0),
  theAudioClip(0)
{
  if (imageFileName != "") {
    theImage = new Image(imageFileName);
  }

  if (audioClipFileName != "") {
    theAudioClip = new AudioClip(audioClipFileName);
  }
}

BookEntry::~BookEntry()
{
  delete theImage;
  delete theAudioClip;
}
```

The constructor for `BookEntry` is susceptible to `exception`s since `new` can `throw`.
Additionally, there is no guarantee that the constructors for `Image` and `AudioClip` will not
`throw`. This is especially concerning because resources will be leaked since `BookEntry`'s
destructor will never be called.

> C++ only destroys fully constructed objects and an object is only fully constructed when the
> object's constructor runs to completion.


``` cpp
BookEntry::BookEntry(const string& name,
                     const string& address = "",
                     const string& imageFileName = "",
                     const string& audioClipFileName = "")
: theName(name),
  theAddress(address),
  theImage(0),
  theAudioClip(0)
{
  try {
    if (imageFileName != "") {
      theImage = new Image(imageFileName);
    }
     
    if (audioClipFileName != "") {
      theAudioClip = new AudioClip(audioClipFileName);
    }
  }
  catch (...) {
  delete theImage;
  delete theAudioClip;

  throw;
  }
}
```

> The contents of the destructor and the `catch` block are similar so the common code can be
> refactored into a `private` helper function.

#### `const` pointers

If `theImage` and `theAudioClip` become `const` pointers, they must be initialized by the member
initialization list.

``` cpp
class BookEntry {
public:
  ...
private:
  ...
  Image* const theImage;
  AudioClip* theAudioClip;
};

BookEntry::BookEntry(const string& name,
                     const string& address = "",
                     const string& imageFileName = "",
                     const string& audioClipFileName = "")
: theName(name),
  theAddress(address),
  theImage(imageFileName != "" ? new Image(imageFileName) : 0),
  theAudioClip(audioClipFileName != "" ? new AudioClip(audioClipFileName) : 0)
{
}
```

Using the `try catch` block is not allowed inside the initialization member list. One solution is to
make `private` helper functions.

``` cpp
class BookEntry {
public:
  ...
private:
  ...
  Image* initImage(const string& imageFileName);
  AudioClip* initAudioClip(const string& audioClipFileName);
};

BookEntry::BookEntry(const string& name,
                     const string& address = "",
                     const string& imageFileName = "",
                     const string& audioClipFileName = "")
: theName(name),
  theAddress(address),
  theImage(initImage(imageFileName)),
  theAudioClip(initAudioClip(audioClipFileName))
{
}

Image* BookEntry::initImage(const string* imageFileName)
{
  if (imageFileName != "") return new Image(imageFileName);
  else return 0;
}

AudioClip* BookEntry::initAudioClip(const string& audioClipFileName)
{
  try {
    if (audioClipFileName != "") return new AudioClip(audioClipFileName);
    else return 0;
  }
  catch (...) {
    delete theImage;
    throw;
  }
}
```

While this solves the problem, it is a headache. A much simpler and intuitive solution is to use
RAII.

``` cpp
class BookEntry {
public:
  ...
private:
  ...
  const auto_ptr<Image> theImage;
  const auto_ptr<AudioClip> theAudioClip;
};
```

Now if `theAudioClip` `throw`s, then `theImage` will be automatically destroyed. Additionally, there
is no need need to provide a destructor, let C++ do that.

### Item 11: Prevent `exception`s from leaving destructors

A destructor can be called in two situations:

- Normal situations such as going out of scope, `delete`
- Stack unwinding as a part of `exception` propagation

If the destructor is called due to stack unwinding from an `exception` and then the code in the
destructor `throw`s and is allowed to propagate out of the destructor, C++ calls the `terminate`
function and the program ends immediately.

``` cpp
class Session {
public:
  Session();
  ~Session();
  ...

private:
  static void logCreation(Session* objAddr);
  static void logDestruction(Session* objAddr);
};

Session::~Session()
{
  logDestruction(this);
}
```

If `logDestruction` were to `throw`, the `terminate` function is automatically invoked. To stop
this, `try catch` blocks are necessary.

> Be mindful of code in the catch block `throw`ing. For example, `operator<<`
> 
> ``` cpp
> Session::~Session()
> {
>    try {
>       logDestruction(this);
>    }
>    catch (...) {
>       cerr << "Unable to log destruction of Session object at address "
>            << this << ".\n";
>    }
> }
> ```

If an uncaught exception is `throw`n in the destructor, the destructor will not run to completion.

``` cpp
Session::Session()
{
  logCreation(this);
  startTransaction();
}

Session::~Session()
{
  logDestruction(this); // if this throws
  endTransaction();     // this will never be executed
}
```

### Item 12: Understand how `throw`ing an `exception` differs from passing a parameter or calling a `virtual` function

Passing an `exception` from a `throw` block to a `catch` clause looks and feels the same a passing
an argument from a function call to the functions parameter. However, they are different.

#### `exception` copying

Function parameters and `exception`s can be passed by value, reference or pointer. However, once
passed, the behavior becomes different.

``` cpp
istream operator>>(istream& s, Widget& w);

void passAndThrowWidget()
{
  Widget localWidget;

  cin >> localWidget;

  throw localWidget;
}
```

In the case of a `operator>>`, the reference `w` inside the function is bound to `localWidget`. In
contrast, regardless of whether an `exception` is caught by value or by reference (can't be caught
by pointer because of type mismatch), a copy of `localWidget` must be made. That is because when
`localWidget` goes out of scope, the destructor is called leaving a carcass of what was once
`localWidget`.

Copying occurs even if there is no danger of destruction. This also means that no matter what
happens to `localWidget` after it is caught by reference, it is impossible to modify it.

``` cpp
catch (Widget w)
catch (Widget& w)
```

Taking into account `exception` copying, `catch`ing by value will copy the object *twice*. One to
create a temporary`exception` as it leaves scope and another to copy the temporary into `w`.
`catch`ing by reference only copies the object once.

#### Copying vs. propagation

``` cpp
catch(Widget& w)
{
  ...
  throw;
}

catch(Widget& w)
{
  ...
  throw w;
}
```

The first `catch` block will re-`throw` the current `exception` while the second block makes a copy
of the current `exception` and `throw`s the copy as the new current `exception`.

If a `SpecialWidget` was thrown, the first block will propagate the `SpecialWidget` while the second
block will copy and `throw` a new `exception` of type `Widget`.

#### `exception` conversion

Conversions of `exception`s are more limited. For example

``` cpp
double sqrt(double);
int i;
double sqrtOfi = sqrt(i);

void f(int value)
{
  try {
    if (someFunction()) {
      throw value;
    }
    ...
  }
  catch (double d) {
    ...
  }
  ...
}
```

Functions will allow implicit conversion of `i` from `int` to `double`, however, `value` will not be
caught by the `catch` clause because it will only catch `exception`s of type double.

There are two types of conversions allowed when matching `exception`s to `catch` clauses

- Inheritance-based
- Typed to untyped pointer

#### `catch` order

`catch` clauses are always tried *in order of their appearance*.

``` cpp
class SpecialWidget : public Widget { ... };

try {
  ...
}
catch (Widget& w) {
  ...
}
catch (SpecialWidget& w) {
  ...
}
```

The `SpecialWidget catch` clause will never be entered if a `SpecialWidget` is `throw`n. This is
because the `Widget catch` clause is always tried first and the `exception` will be converted.

### Item 13: Catch `exception`s by reference

When writing a `catch` clause, there are three different ways to `catch` an `exception`:

- by pointer
- by value
- by reference

`exception`s should always be caught by reference.

#### `catch` by pointer

Objects must exist after leaving scope. One way to `throw`, is to declare a `global` or `static`
`exception`

``` cpp
void someFunction()
{
   static exception ex;
   ...
   throw &ex;
   ...
}

void doSomething()
{
   try {
      someFunction();
   }
   catch (exception* ex) {
      ...
   }
}
```

or allocate memory on the heap.

``` cpp
void someFunction()
{
   ...
   throw new exception;
   ...
}
```

Determining if the `exception` should be `deleted` or not can become confusing.

Furthermore, the four standard `exception`s

<dl>
<dt><code>bad_alloc</code></dt>
<dd>
<code>throw</code>n when <code>operator new</code> cannot satisfy a memory request
</dd>
<dt><code>bad_cast</code></dt>
<dd>
<code>throw</code>n when <code>dynamic_cast</code> to a reference fails (see <a
href="more_effective_cpp#item-2-prefer-c-style-casts">Item 2</a>)
</dd>
<dt><code>bad_typeid</code></dt>
<dd>
<code>throw</code>n when <code>typeid</code> is applied to a dereferenced pointer
</dd>
<dt><code>bad_exception</code></dt>
<dd>
available for unexpected <code>exception</code>s (see <a
href="more_effective_cpp#item-14-use-exception-specifications-judiciously">Item 14</a>)
</dd>
</dl>

are all objects and never pointers so they need to be caught by value or by reference anyway.

#### `catch` by value

`catch` by value requires `exception` objects to be copied *twice* (see [Item
12](more_effective_cpp#item-12-understand-how-throwing-an-exception-differs-from-passing-a-parameter-or-calling-a-virtual-function)). Additionally, there is a *slicing problem*.

``` cpp
class exception { //std::exception
public:

   virtual const char* what() const throw();
   ...
};

class runtime_error : public exception {...};

class Validation_error : public runtime_error {
public:
   virtual const char* what() const throw();
   ...
}

void someFunction()
{
   ...
   if (a validation test fails) {
      throw Validation_error();
   }
   ...
}

void doSomething()
{
   try {
      someFunction();
   }
   catch (exception ex) {
      cerr << ex.what();
      ...
   }
}
```

Though `Validation_error` is `throw`n, the base `class` is caught. Catching by reference will remove
this slicing problem.

### Item 14: Use `exception` specifications judiciously

`exception` specifications make code easier to understand because they explicitly state what
`exception`s a function may `throw`. If a function `throw`s an `exception` that is not listed in the
specification, a special function `unexpected` is automatically invoked.

These benefits come with many drawbacks.

#### Default behavior

The default behavior for `unexpected` is to call `terminate`.

#### Violation prevention

Compilers are forbidden from rejecting calls to functions that might violate the `exception`
specification. Doing so allows flexibility but it becomes easy to violate the specification
resulting in a call to `unexpected`. It becomes the programmers task to

- Never use templates and `exception` specifications together.
- Omit `exception` specifications on functions making calls to functions that lack `exception`
  specifications.
- Handle the standard `exception`s `throw`n by C++.

These three things coupled together can make `exception` specifications more trouble than they are
worth.

### Item 15: Understand the costs of `exception` handling

To handle `exception`s at runtime, programs must handle the bookkeeping associated with

- Objects that require destruction if an `exception` is `throw`n
- Entry to and exit from a `try` block
- Associated `catch` clauses and types of `exception`s those clauses can handle

#### Default costs

Even in code that does not make use of exception-handling features, C++ will still store data to
keep tract of objects that are fully constructed and spend time to keep the data up to date.

#### `try` blocks

Assuming code that uses `try` blocks but never actually `throw`s exceptions, runtime and code size
is expected to increase by 5-10%.

`throw`ing an `exception` incurs speed penalties up to *three orders or magnitude* compared to
normally `return`ing from a function.

> These numbers are to be taken with a grain of salt. The fact of the matter is, very little is known
> about the costs associated with `exception`s.

## Efficiency

### Item 16: Remember the 80-20 rule

The 80-20 rule states that 80 percent of a programs resources are used by 20 percent of the code;
every program has its bottleneck(s). Locating bottlenecks is typically left to experience,
intuition, rumors, or worse.

The best option is to use a profiler. Profile using as many data sets as possible.

### Item 17: Consider using lazy evaluation

The best computations are the ones that never need to be made at all. This is the idea motivating
*lazy evaluation*.

#### Reference counting

``` cpp
class String { ... };

String s1 = "Hello";
String s2 = s1;
```

A common implementation for the `String` copy constructor would result in `s1` and `s2` each having
its own copy of `"Hello"`. This technique is called *eager evaluation*.

If `s2` were to share `s1`'s value, no copying would be necessary. This is fine for reading a value,
but when writing a new value, then `s2` can no longer be lazy. See [Item 29](more_effective_cpp#item-29-reference-counting) for
more details.

#### Distinguishing reads from writes

``` cpp
String s = "Homer's Iliad";
...
cout s[3];
s[3] = 'x';
```

A reference counting technique could possibly be used on elements of an array. To get this to work,
`operator[]` would need to know how to distinguish reads from writes. See [Item
30](more_effective_cpp#item-30-proxy-classes) for more details.

#### Lazy fetching

``` cpp
class LargeObject {
public:
  LargeObject(ObjectId id);

  const string& field const;
  int field2() const;
  double field3() const;
  const string& field4() const;
  const string& field5() const;
  ...
};

void restoreAndProcessObject(Objectid id)
{
  LargeObject object(id);

  if (object.field2() == 0) {
    cout << "Object " << id << ": null field2.\n"
  }
}
```

If only a potion of object's data is being used, *lazy fetching* is more time efficient.

``` cpp
class LargeObject {
  const string& field1() const;
  ...

private:
  ObjectId old;
  mutable string* field1Value;
  mutable int* field2Value;
  mutable double* field3Value;
  ...
};

LargeObject::LargeObject(ObjectID id)
: old(id), field1Value(0), field2Value(0), ....
{}

const string& LargeObject::field1() const
{
  if (field1Value == 0) {
    // read data from data base and point field1Value to it
  }

  return* field1Value;
}
```

`mutable` is used when the data members inside `const` member functions need to be modified.

> If `mutable` cannot be used, try the "fake `this`" approach.
> 
> ``` cpp
> class LargeObject {
> public:
>   const string& field1() const;
>   ...
> 
> private:
>   string* field1Value;
>   ...
> };
> 
> const string& LargeObject::field1() const
> {
>   LargeObject* const fakeThis = const_cast<LargeObject* const>(this);
> 
>   if (field1Value == 0) {
>     fakeThis->field1Value = // fetch data from database;
>   }
>
>   return* field1Value;
> }
> ```
> 
> If `const_cast` cannot be used, resort to C-style cast.

The use of pointers inside `LargeObject` is tedious and error-prone because they are always
initialized to zero. *smart pointers* would be better. See [Item 28](more_effective_cpp#item-28-smart-pointers) for more
details.

#### Lazy expression evaluation

``` cpp
template<class T>
class Matrix { ... };

Matrix<int> m1(1000,1000); // 1000 by 1000 matrix
Matrix<int> m2(1000,1000);
...
Matrix<int> m3 = m1 + m2;
```

One would expect the usual implementation of `operator+` to perform 1 million additions. Instead it
is possible to set up a data structure inside `m3` indicating that it is the sum of `s1` and `s2`.

``` cpp
cout << m3[4];
```

Once data for `m3` is read, only the parts that need to be computed are computed. With any luck, the
entirety of the matrix is not needed and resources are saved.

### Item 18: Amortize the cost of expected computations

While [Item 17](more_effective_cpp#item-17-consider-using-lazy-evaluation) focused on *lazy evaluation*, the contents
of this item can be described as *over-eager evaluation*

#### Caching

``` cpp
template<class NumericalType>
class DataCollection {
public:
  NumericalType min() const;
  NumericalType max() const;
  NumericalType avg() const;
  ...
};
```

Using *over-eager evaluation*, the running minimum, maximum, and average of the values in
`DataCollection` is tracked so that when `min`, `max` and `avg` are called, a value is immediately
`return`ed. The idea behind *over-eager evaluation* is to lower the cost per call, if the
computation is requested frequently, by caching the data.

One such way to cache data is with `std::map`.

``` cpp
int findCubicleNumber(const string& employeeName)
{
  // map of names to cube numbers
  typedef map<string, int> CubicleMap;
  static CubicleMap cubes;

  CubicleMap::iterator it = cubes.find(employeeName);

  if (it == cubes.end()) {
    int cubicle = // get data from database
    cubes[employeeName] = cubicle;
    return cubicle;
  }
  else {
    return (*it).second;
  }
}
```

#### Prefetching

Prefetching involves gathering more data than needed in the hopes that the local data will be needed
too. This is known as *locality of reference*.

``` cpp
template<class T>
class DynArray { ... };

DynArray<double> a;

a[22] = 3.5; // array extends itself through index 44
a[32] = 0;   // no need to extend

template<class T>
T& DynArray::operator[](int index)
{
  if (index < 0) // throw
  if (index > /* current maximum index */) {
    int diff = index - /* current maximum index */;
    /* allocate enough memory to make index + diff valid */;
  }
  return /* indexth element of the array */;
}
```

`operator[]` allocates twice as much memory as needed each time the array is extended. Here with
bulk allocations of memory, speed (less calls to `operator new`) is purchased in exchange for
memory.

### Item 19: Understand the origin of temporary objects

``` cpp
template<class T>
void swap(T& object1, T& object2)
{
  T temp = object1;
  object1 = object2;
  object2 = temp;
}
```

It's common to call `temp` a "temporary". As far as C++ is concerned, `temp` is not a temporary
object. True temporary objects are *unnamed* objects that do not appear in the source code.
Temporary objects arise in one of two ways:

- implicit type conversions are applied to make function call succeed
- functions `return` objects

#### implicit type conversions

``` cpp
size_t countChar(const string& str, char ch);

char buffer[MAX_STRING_LEN];
char c;
cin >> c >> setw(MAX_STRING_LEN) >> buffer;
cout << "There are " << countChar(buffer, c)
     << " occurrences of the character " << c
     << " in " << buffer << endl;
```

An implicit type conversion occurs when the `char` array buffer used as an argument for `countChar`
is converted to a parameter of type `const string&`. This conversion creates a temporary `string`
object bound by `str`.

Though convenient, the conversion is unnecessarily expensive. This can be solved by redesigning
software so that the conversion either cannot take place (see [Item
5](more_effective_cpp#item-5-be-wary-of-user-defined-conversion-functions)) or is unnecessary (see [Item
21](item-21-overload-to-avoid-implicit-type-conversions)).

> These conversions only take place when passing objects by value or when passing to a
> reference-to-`const` parameter. They do not occur when passing an object to a
> reference-to-non-`const` parameter. This is because the temporary object would be changed instead of
> the non-temporary argument.

#### returning an object

``` cpp
const Number operator+(const Number& lhs, const Number& rhs);
```

This function `return`s a temporary which must both be constructed and destructed. A technique
called *return value optimization* will remove the need for a temporary. For more details see [Item
20](more_effective_cpp#item-20-facilitate-the-return-value-optimization).

### Item 20: Facilitate the return value optimization

``` cpp
class Rational {
public:
  Rational(int numerator = 0; int denominator = 1);
  ...
  int numerator() const;
  int denominator() const;
};

const Rational operator*(const Rational& lhs, const Rational& rhs);
```

`operator+` `return`s the product of two *arbitrary* numbers. To do this, C++ must return a `new`
object. Attempting to `return` by pointer or by reference are two equally fruitless endeavors.

The trick is to use a compiler optimization to `return` *constructor arguments* instead of objects.

``` cpp
const Rational operator*(const Rational& lhs, const Rational& rhs)
{
  return Rational(lhs.numerator() * rhs.numerator(),
                  lhs.denominator() * rhs.denominator());
}

Rational a = 10;
Rational b(1, 2);
Rational c = a * b;
```

The compiler is allowed to eliminate the temporary inside `operator*` by constructing the the object
defined by the `return` expression *inside the memory allotted for the object* `c`.

> The function can be further optimized by declaring the function `inline`.

### Item 21: Overload to avoid implicit type conversions

``` cpp
class UPInt {
public:
  UPInt();
  UPint(int value);
  ...
};

const UPInt operator+(const UPInt& lhs, const UPInt& rhs);

UPInt upi1, upi2;
...
UPInt upi3 = upi1 + upi2;

upi3 = upi1 + 10;
upi3 = 10 + upi1;
```

The last two statements unavoidably construct and destroy temporaries due to implicit type
conversions. This problem can be avoided by eliminating the need for type conversions in the first
place.

```cpp
const UPInt operator+(const UPInt& lhs, const UPInt);
const UPInt operator+(const UPInt& lhs, int rhs);
const UPInt operator+(int lhs, const UPInt& rhs);
```

> Before coding a slew of overloaded functions, remember the 80-20 rule from [Item
> 16](more_effective_cpp#item-16-remember-the-80-20-rule) and consider if it is really worth it.

### Item 22: Consider using `op=` instead of stand-alone `op`

Assignment operators `op=` are typically more efficient than stand-alone `op` because

-   Stand-alone `op` typically must `return` a new object which costs temporary object construction
    and destruction.
    
-   Assignment versions allow clients to decide on convenience or efficiency.
    
    ``` cpp
    Rational a, b, c, d, result;
    ...
    
    // convenience
    result = a + b + c + d; // probably needs 3 temporary objects
    
    // or efficiency
    result = a;    // no temporary needed
    result += b;   // no temporary needed
    result += c;   // no temporary needed
    result += d;   // no temporary needed
    ```
    
-   Stand-alone `template` code, like below, may be too complex for optimizing out the temporary
    object.
    
    ``` cpp
    template<class T>
    const T operator+(const T& lhs, const T& rhs)
    { return T(lhs) += rhs; }
    ```

### Item 23: Consider alternative libraries

The ideal library is small, fast, powerful, flexible, extensible, intuitive, universally available,
well supported, free of use restrictions and bug free. It is also non-existent. There are many
libraries offering the same functionality but with different trade offs. For example, `stdio` and
`iostream`.

### Item 24: Understand the costs of `virtual` functions, multiple inheritance, `virtual` base `class`es and RTTI

#### `virtual` functions

When a `virtual` function is called, the code executed must correspond to the dynamic type of the
object on which the function is invoked. This is achieved with *virtual tables* and *virtual table
pointers*. A `class` with a `virtual` function has the following additional costs:

- Space must be set aside for a *virtual table* for each `class`.
- Every object needs space for an extra *virtual pointer* for its own `class` and each base
  `class` it inherits from (with the possible `exception` of `virtual` base `class`es).
- Function calls gain a slight increase in overhead figuring out which function in the inheritance
  hierarchy to call.
- `virtual` functions cannot be `inline`d if the function calls are made through pointers or
  references to objects.

#### RTTI

RTTI requires the use of an abject called `type_info` to discover information about an objects
dynamic type at runtime. There only needs to be a single copy of RTTI information for each `class`
but there must be a way for an object to access that information. A `class` with a `virtual`
function must add an additional entry to the *virtual table* as well as additional space for the
`type_info` object.

#### Summary

| Feature                  | Increases size of objects | Increases per-`class` data | Reduces `inline`ing |
| --                       | --                        | --                         | --                  |
| **`virtual` functions**  | yes                       | yes                        | yes                 |
| **multiple inheritance** | yes                       | yes                        | no                  |
| **`virtual` base**       | often                     | sometimes                  | no                  |
| **`class`es RTTI**       | no                        | yes                        | no                  |

*Table 1: Features of C++ and their associated costs*

## Techniques

### Item 25: `virtual`izing constructors and non-member functions

The idea of `virtual` constructors and `virtual` non-member functions seems unintuitive and neither
can be declared with the `virtual` keyword. However, making these functions *act* `virtual` can be
very useful.

#### Making constructors `virtual`

``` cpp
class NLComponent {                    // abstract base class
public:
  ...
};

class TextBlock : public NLComponent { // concrete class
public:
  ...
};

class Graphic : public NLComponent {   // concrete class
public:
  ...
};

class NewsLetter {
public:
  NewsLetter(istream& str);
...
private:
  static NLComponent* readComponent(istream& str);

  list<NLComponent*> components;
};

NewsLetter::NewsLetter(istream& str)
{
  while (str) {
    components.push_back(readComponent(str));
  }
}
```

`readComponent` will construct a new `TextBlock` or `Graphic`, depending on the data it reads.
Because it can construct different kinds of objects, it is called a *virtual constructor*.

Another constructor called the *virtual copy constructor* is also widely useful.

``` cpp
class NLComponent {
public:
  virtual NLComponent* clone() const = 0;
  ...
};

class TextBlock : public NLComponent {
public:
  virtual TextBlock* clone() const
  { return new TextBlock(*this); }
  ...
};

class Graphic : public NLComponent {
public:
  virtual Graphic* clone() const
  { return new Graphic(*this); }
};
```

The existence of the *virtual copy constructor* makes it easier to implement the copy constructor
for `NewsLetter`.

``` cpp
class NewsLetter {
public:
  NewsLetter(const NewsLetter& rhs);
  ...
};

NewsLetter::NewsLetter(const NewsLetter& rhs)
{
  for (list<NLComponent*>::const_iterator it = rhs.components.begin();
   it != rhs.components.end(); ++ it) {
    components.push_back((*it)->clone());
  }
}
```

#### Making non-member functions act `virtual`

``` cpp
class NLcomponent {
public:
  virtual ostream& print(ostream& s) const = 0;
  ...
};

class TextBlock : public NLComponent {
public:
  virtual ostream& print(ostream& s) const;
  ...
};

class Graphic : public NLComponent {
public:
  virtual ostream& print(ostream& s) const;
  ...
};

inline ostream& operator<<(ostream& s, const NLComponent& c)
{
  return c.print();
}
```

### Item 26: Limiting the number of objects of a `class`

#### Allowing zero or one objects

Rights for creating an object can be removed by making the constructors `private` and the `static`
keyword can be used to limit the number of objects created to one.

``` cpp
class Printer {
public:
  static Printer& thePrinter();
  ...

private:
  Printer();
  Printer(const Printer& rhs);
  ...
};

Printer& Printer::thePrinter()
{
  static Printer p;
  return p;
}
```

> If a `inline` non-member function contains a local `static` object, it is possible for *more than
> one copy* of that `static` object to be created.

Another strategy in limiting objects is to count the number of times an object is created and
`throw` an `exception` when the number exceeds a threshold.

``` cpp
class Printer {
public:
  class ToManyObjects{}; // exception class

  Printer();
  ~Printer();
  ...
private:
  static size_t numObjects;
  Printer(const Printer& rhs); // limit of 1 so no copying
};

size_t Printer::numObjects = 0;

Printer::Printer()
{
  if (numObjects >= 1) {
    throw TooManyObjects();
  }
  ++numObjects;
}

Printer::~Printer()
{
  // destruction
  --numObjects;
}
```

#### Contexts for object construction

In the above example, `Printer` objects can exist in three different contexts

- On their own
- As a base `class`
- Inside larger objects

which can get confusing when limiting the number of objects in existence. Typically, the intent is
to only allow objects to exist on their own. This is easily done by declaring the constructors
`private` and providing a *pseudo-constructor*.

``` cpp
class Printer  {
public:
  // pseudo-constructors
  static Printer* makePrinter();
  static Printer* makePrinter(const Printer& rhs);
  ...
private:
  Printer();
  Printer(const Printer& rhs);
  ...
};

Printer* Printer::makePrinter()
{ return new Printer(); }

Printer* Printer::makePrinter(const Printer& rhs)
{ return new Printer(rhs); }
```

By `return`ing a pointer, an unlimited number of objects can be made, unlike `return`ing a reference
where only one unique object can be made. However, callers will need to call `delete` to prevent
resource leaks.

#### An object-counting base `class`

``` cpp
template<class BeingCounted>
class Counted {
public:
  class TooManyObjects{};

  static size_t objectCount() { return numObjects; }

protected:
  Counted();
  Counted(const Counted& rhs);

  ~Counted() { --numObjects; }

private:
  static size_t numObjects;
  static const size_t maxObjects;

  void init();
};

template<class BeingCounted>
Counted<BeingCounted>::Counted()
{ init(); }

template<class BeingCounted>
Counted<BeingCounted>::Counted(const Counted<BeingCounted>&)
{ init(); }

template<class BeingCounted>
void Counted<BeingCounted>::init()
{
  if (numObjects >= maxObjects) throw TooManyObjects();
  ++numObjects;
}

template<class BeingCounted>
size_t Counted<BeingCounted>::numObjects; // initializes to 0
```

> The client must provide the appropriate initialization of `maxObjects`
> 
> ``` cpp
> const size_t Counted<Printer>::maxObjects = 10;
> ```

### Item 27: Requiring or prohibiting heap-based objects

#### Requiring heap-based objects

The easiest way to require heap-based construction is to declare the destructor `private` and
provide a *pseudo-destructor*.

``` cpp
class UPNumber {
public:
  UPNumber();
  UPNumber(int initValue);
  UPNumber(double initValue);
  UPNumber(const UPNumber& rhs);

  // pseudo-destructor
  void destroy() const { delete this; }
  ...
private:
  ~UPNumber();
}
```

> An alternative is to declare all the constructors `private` but its usually less work to make the
> destructor `private`.

> This technique will also make inheritance illegal as well (see [Item
> 26](more_effective_cpp#item-26-limiting-the-number-of-objects-of-a-class)). If
> this is not desirable, inheritance can be allowed by declaring the destructor `protected` instead.

#### Determining whether an object is on the heap

There is no portable way to determine if an object lives on the heap. It is easier to determine if
it is safe to `delete` a pointer than to determine whether a pointer points to something on the
heap. All that is needed is a collection of addresses that have been returned by `operator new`.

``` cpp
class HeapTracked {
public:
  class MissingAddress{};

  virtual ~HeapTracked() = 0;

  static void* operator new(size_t size);
  static void operator delete(void* ptr);

  bool isOnHeap() const;

private:
  typedef const void* RawAddress;
  static list<RawAddress> addresses;
};

list<RawAddress> HeapTracked::addresses;

HeapTracked::~HeapTracked() {}

void* HeapTracked::operator new(size_t size)
{
  void* memPtr = ::operator new(size);
  addresses.push_front(memPtr);
  return memPtr;
}

void HeapTracked::operator delete(void* ptr)
{
  if (ptr = 0) return;

  list<RawAddress>::iterator it = find(addresses.begin(), addresses.end(), ptr);
  if (it != addresses.end()) {
    addresses.erase(it);
    ::operator delete(ptr);
  } else {
    throw MissingAddress();
  }
}

bool HeapTracked::isOnHeap() const
{
  const void* rawAddress = dynamic_cast<const void*>(this);
  list<RawAddress>::iterator it = find(addresses.begin(), addresses.end(), rawAddress);
  return it != addresses.end();
}
```

#### Prohibiting heap-based objects

Construction of heap-based objects can be prohibited by declared `operator new` and `operator
delete` `private`. Similarly, `operator new[]` and `operator delete[]` can also be declared
`private` to prevent heap-based arrays of objects.

``` cpp
class UPNumber {
private:
  static void* operator new(size_t size);
  static void operator delete(void* ptr);
  ...
};
```

> Declaring `operator new` `private` prohibits heap-based derived class objects as well.

> This technique cannot be used to prohibit construction of heap-based objects which contain members
> who prohibit heap-based construction.
> 
> ``` cpp
> class Asset {
> public:
>   Asset(int initValue);
>   ...
> private:
>   UPNumber value;
> };
> 
> Asset* pa = new Asset(100);   // fine, calls Asset::operator new,
>                               // not UPNumber::operator new
> ```

### Item 28: Smart pointers

*Smart pointer*s are pointers with additional functionality added to the built-in pointer. *Smart
pointers* allow control over

- Construction and destruction
- Copying and assignment
- Dereferencing

Below is a basic template for a DIY *smart pointer*.

``` cpp
template<class T>
class SmartPtr {
public:
  SmartPtr(T* realPtr = 0); // uninitialized ptrs default to 0
  SmartPtr(const SmartPtr& rhs);
  ~SmartPtr();
  SmartPtr& operator=(const SmartPtr& rhs);

  T* operator->() const;
  T& operator*() const;

private:
  T* pointee;
};
```

#### Construction, assignment, and destruction of *smart pointers*

`auto_ptr` is a *smart pointer* that points to a heap-based object until it is destroyed. Upon
destruction, the heap object is `delete`ed.

``` cpp
template<class T>
class auto_ptr {
public:
  auto_ptr(T* ptr = 0): pointee(ptr) {}
  ~auto_ptr() { delete pointee; }

  auto_ptr(auto_ptr<T>& rhs);
  auto_ptr<T>& operator=(auto_ptr<T>& rhs);
  ...
private:
  T* pointee;
};

template<class T>
auto_ptr<T>::auto_ptr(auto_ptr<T>& rhs)
{
  pointee = rhs.pointee;
  rhs.pointee = 0;
}

template<class T>
auto_ptr<T>& auto_ptr::operator=(auto_ptr<T>& rhs)
{
  if (this == &rhs) return *this;

  delete pointee;
  pointee = rhs.pointee;
  rhs.pointee = 0;

  return *this;
}
```

Notice the copy constructor and `operator=` are used as a way of transferring ownership of an object
to another pointer. This is important so that when two pointers point to the same object, the object
is not `delete`ed more than once.

#### Implementing the dereference operators

``` cpp
template<class T>
T& SmartPtr<T>::operator*() const
{
  // perform "smart pointer" processing;

  return *pointee;
}

template<class T>
T* SmartPtr<T>::operator->() const
{
  // perform "smart pointer" processing;

  return pointee;
}
```

> Make sure `operator*` `return`s a reference.

#### Testing *smart pointers* for nullness

``` cpp
template<class T>
class SmartPtr {
public:
  ...
  operator void*(); // returns 0 if ptr is null, non-zero otherwise
  bool operator!(); // returns true iff ptr is null
  ...
};
```

#### Converting smart pointers to dumb pointers

``` cpp
template<class T>
class DBPtr {
public:
  ...
  operator T*() { return pointee; }
  ...
};
```

> Don't provide implicit conversion operators to built-in pointers unless there is a compelling reason
> to do so; *Smart pointers* can never truly be interchangeable with built-in pointers.

#### Smart pointers and inheritance-based type conversions

Inheritance-based type conversions can be supported by adding implicit type conversion operators.
*Member templates* can help generate the conversion functions.

``` cpp
template<class T>
class SmartPtr {
public:
  ...
  template<class newType>
  operator SmartPtr<newType>()
  {
    return SmartPtr<newType>(pointee);
  }
  ...
};
```

> This conversion can only move one step up the inheritance hierarchy (a `class` the object directly
> inherits from).

#### *Smart pointers* and `const`

*Smart pointers* will not implicitly convert the objects they point to from non-`const` to `const`.

``` cpp
CD* pCd = new CD("Famous movie themes");
const CD* pConstCD = pCd;  // fine

SmartPtr<CD> pCD = new CD("Famous movie themes");
SmartPtr<const CD> pConstCD = pCD; // not fine
```

This problem can be solved by having each smart pointer-to-`T` `class` `public`ly inherit from a
corresponding smart pointer-to-`const`-`T` `class`.

``` cpp
template<class T>
class SmartPtrToConst {
  ...
protected:
  union {
    const T* constPointee;
    T* pointee;
  };
};

template<class T>
class SmartPtr : public SmartPtrToConst<T> {
  ...
};

SmartPtr<CD> pCD = new CD("Famous movie themes");
SmartPtrToConst<CD> pConstCD = pCD; // fine
```

### Item 29: Reference counting

*Reference counting* is a technique that allows multiple objects with the same value to share a
single representation of that value.

*Reference counting* is useful for improving efficiency under the following conditions

- Relatively few values are shared by relatively many objects
- Object values are expensive to create or destroy, or they use lots of memory.

#### Implementing reference counting

**Data**

``` cpp
class String {
public:
  ...
private:
  struct StringValue {
     size_t refCount;
     char* data;

     StringValue(const char* initValue);
     ~StringValue();
  };
  StringValue* value;
};

String::StringValue::StringValue(const char* initvalue)
: refCount(1)
{
  data = new char[strlen(initValue) + 1];
  strcpy(data, initValue);
}

String::StringValue::~StringValue()
{
  delete[] data;
}
```

**Constructors/destructor**

``` cpp
class String {
public:
  String(const char* initValue = "");
  String(const String& rhs);
  ~String();
  ...
};

String::String(const char* initValue)
: value(new StringValue(initValue))
{}

String::String(const String& rhs)
: value(rhs.value)
{
  ++value->refcount;
}

String::~String()
{
  if (--value->refCount == 0) delete value;
}
```

**Assignment operator**

``` cpp
class String {
public:
  String& operator=(const String& rhs);
  ...
};

String& String::operator=(const String& rhs)
{
  // do nothing if the values are already the same
  if (value == rhs.value) return *this;
  // destroy *this's value if no one else is using it
  if (--value->refCount == 0) delete value;
  // have *this share rhs's value
  value = rhs.value;
  ++value->refcount;

  return *this;
}
```

**Read**

``` cpp
class String {
public:
  const char& operator[](int index) const;
  ...
};

const char& String::operator[](int index) const
{
  return value->data[index];
}
```

#### Copy-on-write

``` cpp
class String {
public:
  char& operator[](int index);
  ...
};

char& String::operator[](int index)
{
  // if we are sharing a value with other String objects,
  // break off a separate copy of the value for ourselves
  if (value->refCount > 1) {
    --value->refCount;
    value = new StringValue(value->data);
  }
  return value->data[index];
}
```

Consider the following code

``` cpp
String s1 = "Hello";
char* p = &s1[1];

String s2 = s1;
*p = 'x';   // modifies both s1 and s2
```

To eliminate this problem a flag can be added to `StringValue` indicating whether the object is
shareable. The flag is initialized to `true` and is set to `false` whenever the non-`const`
`operator[]` is called.

``` cpp
class String {
private:
  struct StringValue {
     ...
     bool shareable;
     ...
  };
};

String::StringValue::StringValue(const char* initValue)
: refCount(1),
  shareable(true)
{ ... }

String::String(const String& rhs)
{
  if (rhs.value->shareable) {
     value = rhs.value;
     ++value->refCount;
  }
  else {
     value = new StringValue(rhs.value->data)
  }
}

char& String::operator[](int index)
{
  ...
  value->shareable = false;  // add this
  ...
}
```

#### Reference-counting base `class`

``` cpp
class RCObject {
public:
  RCObject();
  RCObject(const RCObject& rhs);
  RCObject& operator=(const RCObject& rhs);
  virtual ~RCObject() = 0;

  void addReference();
  void removeReference();

  void markUnsharable();
  bool isShareable() const;

  bool isShared() const;

private:
  size_t refCount;
  bool shareable;
};

RCObject::RCObject()
: refCount(0), shareable(true) {}

RCObject::RCObject(const RCObject&)
: refCount(0), shareable(true) {}

RCObject& RCObject::operator=(const RCObject&)
{ return *this; }

RCObject::~RCObject() {}

void RCObject::addReference()
{ ++refCount; }

void RCObject::removeReference()
{ if (--refCount == 0) delete this; }

void RCObject::markUnsharable()
{ shareable = false; }

bool RCObject::isShareable() const
{ return shareable; }

bool RCObject::isShared() const
{ return refCount > 1; }
```

To take advantage of the reference-counting base `class` `StringValue` will inherit `RCObject`

``` cpp
class String {
private:
  struct StringValue : public RCObject {
     char* data;

     StringValue(const char* initValue);
     ~StringValue();
  };
  ...
};

String::StringValue::StringValue(const char* initValue)
{
  data = new char[strlen(initValue) + 1];
  strcpy(data, initValue);
}

String::StringValue::~StringValue()
{
  delete [] data;
}
```

#### Automating reference count manipulations

At this point, `addReference` and `removeReference` must be called manually. Automatic reference
counting can be achieved with a reference-counting *smart pointer* (see [Item
28](more_effective_cpp#item-28-smart-pointers) for more).

``` cpp
template<class T>
class RCPtr {
public:
  RCPtr(T* realPtr = 0);
  RCPtr(const RCPtr& rhs);
  ~RCPtr();

  RCPtr& operator=(const RCPtr& rhs);

  T* operator->() const;
  T& operator*() const;

private:
  T* pointee;

  void init();
};

template<class T>
RCPtr<T>::RCPtr(T* realPtr)
: pointee(realPtr)
{
  init();
}

template<class T>
RCPtr<T>::RCPtr(const RCPtr& rhs)
: pointee(rhs.pointee)
{
  init();
}

template<class T>
RCPtr<T>::init()
{
  if (pointee == 0) return;

  // if value isn't shareable, copy it
  if (pointee->isShareable() == false) {
     pointee = new T(*pointee);
  }

  pointee->addReference();
}
```

> The `template` assumes `T` has a copy constructor. `StringValue` does not yet have a copy
> constructor. C++ will generate one, but, the generated copy constructor will only copy
> `StringValue`'s `data` pointer, not the `char*` `data` points to.
> 
> ``` cpp
> class String {
> private:
>   struct StringValue {
>      StringValue(const StringValue& rhs);
>      ...
>   };
>   ...
> };
> 
> String::StringValue::StringValue(const StringValue& rhs)
> {
>   data = new char[strlen(rhs.data) + 1];
>   strcpy(data, rhs.data);
> }
> ```

> Another assumption made by the `template` is that `T*` points to a `T` object, but `T*` might really
> be pointing to a class *derived* from `T`. This assumption will be left alone. See [Item
> 28](more_effective_cpp#item-28-smart-pointers) for more info.

``` cpp
template<class T>
RCPtr<T>& RCPtr<T>::operator=(const RCPtr& rhs)
{
  // skip assignment if value doesn't change.
  if (pointee != rhs.pointee) {
    T* oldPointee = pointee;
    pointee = rhs.pointee;
    // share if possible, else make own copy
    init();
    // remove reference to current value
    if (oldPointee) {
      oldPointee->removeReference();
    }
  }
  return *this;;
}

template<class T>
RCPtr<T>::~RCPtr()
{
  if (pointee) pointee->removeReference();
}

template<class T>
T* RCPtr<T>::operator->() const
{ return pointee; }

template<class T>
T& RCPtr<T>::operator*() const
{ return *pointee; }

All that's left, is to change the type of `value` to `RCPtr<StringValue>`.

class String {
...
private:
  RCPtr<StringValue> value;
};
```

### Item 30: Proxy `class`es

*Proxy classes* are `class`es that change the usage or interface of another `class`.

Below are some examples of how a proxy `class` can be used.

#### Implementing two-dimensional arrays

``` cpp
template<class T>
class Array2D {
public:
  Array2D(int dim1, int dim2);
  ...
};
```

Accessing an element of `Array2D` should look something like this

``` cpp
Array2D<int> data(10,20);
data[3][6] = 10;
```

However, there is no such thing as `operator[][]`. Instead, `operator[]` can be used to `return` an
object of a new `class`, `Array1D` and `operator[]` in `Array1D` can be used to `return` an element.

``` cpp
template<class T>
class Array2D {
public:
  class Array1D {
  public:
     T& operator[](int index);
     const T& operator[](int index) const;
     ...
  };

  Array1D operator[](int index);
  const Array1D operator[](int index) const;
  ...
};
```

`Array1D` is used as a *proxy class* to provide behavior for indexing an `Array2D` object twice.

#### Distinguishing reads from writes via `operator[]`

`operator[]` can be used in two contexts: rvalue usages or reads and lvalue usages or writes. The
context cannot be determined from the usage of either the `const` or non-`const` `operator[]` alone.
However, if `operator[]` `return`s a proxy `class`, `CharProxy`, which also has it's own set of
`operator[]`, it becomes possible to distinguish context.

``` cpp
class String {
public:

  class CharProxy {
  public:
    CharProxy(String& str, int index);

    // lvalue uses
    CharProxy& operator=(const CharProxy& rhs);
    CharProxy& operator=(char c);
    // rvalue uses
    operator char() const;

  private:
    String& theString;
    int charIndex;
  };
...
const CharProxy operator[](int index) const; // for const strings
CharProxy operator[](int index) const;       // for non-const strings
...
friend class CharProxy;

private:
  RCPtr<StringValue> value;
};

String::CharProxy::CharProxy(String& str, int index)
: theString(str), charIndex(index) {}

const String::CharProxy String::operator[](int index) const
{
  return CharProxy(const_cast<String&>(*this), index);
}

String::CharProxy String::operator[](int index)
{
  return CharProxy(*this, index);
}

String::CharProxy::operator char() const
{
  return theString.value->data[charIndex];
}

String::CharProxy& String::CharProxy::operator=(const CharProxy& rhs)
{
  // if the string is sharing a value with other String objects
  // break off a separate copy of the value for this string only
  if (theString.value->isShared()) {
    theString.value = new StringValue(theString.value->data);
  }

  // assign the value of the char represented by the rhs to the
  // char represented by *this
  theString.value->data[charIndex] = rhs.theString.value->data[rhs.charIndex];

  return *this;
}

String::CharProxy& String::CharProxy::operator=(char c)
{
  if (theString.value->isShared()) {
    theString.value = new StringValue(theString.value->data);
  }

  theString.value->data[charIndex] = c;

  return *this;
}
```

> *proxy objects* need to seamlessly replace the objects they stand for which can become rather
> involved.

### Item 31: Making functions `virtual` with respect to more than one object

``` cpp
class GameObject { ... };
class SpaceShip : public GameObject { ... };
class SpaceStation : public GameObject { ... };
class Asteroid : public GameObject { ... };

void checkForCollision(GameObject& object1, GameObject& object2)
{
  if (theyJustCollided(object1, object2)) {
    processCollision(object1, object2);
  }
  else {
    ...
  }
}
```

The goal of this item is to explore ways to implement `processCollisions` whose behavior depends on
the dynamic types of both objects. This is commonly known as *double dispatching* since the function
call is `virtual` on two parameters.

#### Using `virtual` functions and RTTI

<dl>
<dt>Goal</dt>
<dd>
Implement double dispatch
</dd>
<dt>Approach</dt>
<dd>
Chains of <code>if-then-else</code>.
</dd>
</dl>

``` cpp
class CollisionWithUnknownObject {
public::
  CollisionWithUnknownObject(GameObject& whatWeHit);
  ...
};

void SpaceShip::collide(GameObject& otherObject)
{
  const type_info& objectType = typeid(otherObject);

  if (objectType == typeid(SpaceShip)) {
    SpaceShip& ss = static_cast<SpaceShip&>(otherObject);
    // process SpaceShip-SpaceShip collision
  }
  else if (objectType == typeid(SpaceStation)) {
    SpaceStation& ss = static_cast<SpaceStation&>(otherObject);
    // process SpaceShip-SpaceStation collision
  }
  else if (onjectType == typeid(Asteroid)) {
    Asteroid& a = static_cast<Asteroid&>(otherObject);
    // process SpaceShip-Asteroid collision
  }
  else {
    throw CollisionWithUnknownObject(otherObject);
  }
}
``` 

#### Using `virtual` functions only

<dl>
<dt>Goal</dt>
<dd>
Increase maintainability
</dd>
<dt>Approach</dt>
<dd>
Implement <em>double dispatch</em> as two <em>single dispatches</em>
</dd>
</dl>

``` cpp
class SpaceShip;
class SpaceStation;
class Asteroid;
class GameObject {
public:
  virtual void collide(GameObject&    otherObject) = 0;
  virtual void collide(SpaceShip&     otherObject) = 0;
  virtual void collide(SpaceStation&  otherObject) = 0;
  virtual void collide(Asteroid&      otherObject) = 0;
  ...
};

void SpaceShip::collide(GameObject& otherObject)
{
  // not recursive, version of collide is called
  // based on static type of *this
  otherObject.collide(*this);
}

void SpaceShip::collide(SpaceShip& otherObject)
{
  // process SpaceShip-SpaceShip collision
}

void SpaceShip::collide(SpaceStation& otherObject)
{
  // process SpaceShip-SpaceStation collision
}

void SpaceShip::collide(Asteroid& otherObject)
{
  // process SpaceShip-Asteroid collision
}
```

#### Emulating `virtual` function tables

<dl>
<dt>Goal</dt>
<dd>
Improve extensibility
</dd>
<dt>Approach</dt>
<dd>
Map <code>virtual</code> function pointers to a <code>class</code>es dynamic type.
</dd>
</dl>

``` cpp
class GameObject {
public:
  virtual void collide(GameObject& otherObject) = 0 ;
  ...
}

class SpaceShip : public GameObject {
public:
  virtual void collide(GameObject& otherObject);
  virtual void hitSpaceShip(GameObject& spaceShip);
  virtual void hitSpaceStation(GameObject& spaceStation);
  virtual void hitAsteroid(GameObject& asteroid);
  ...
private:
  typedef void (SpaceShip::*HitFunctionPtr)(GameObject&);
  typedef map<string, HitFunctionPtr> HitMap;

  static HitFunctionPtr lookup(const GameObject& whatWeHit);
  static HitMap* InitializeCollisionMap();
  ...
}

void SpaceShip::collide(GameObject& otherObject)
{
  HitFuntionPtr hfp = lookup(otherObject);
  if (hfp) {
    (this->*hfp)(otherObject)
  }
  else {
    throw CollisionWithUnknownObject(otherObject);
  }
}

SpaceShip::HitFunctionPtr SpaceShip::lookup(const GameObject* whatWeHit)
{
  static auto_ptr<HitMap> collisionMap(initializeCollisionMap());
  HitMap::iterator mapEntry = collisionMap.find(typeid(whatWeHit).name());
  if (mapEntry == collisionMap.end()) return 0;
  return (*mapEntry).second;
}

SpaceShip::HitMap* SpaceShip::initializeCollisionMap()
{
  HitMap *phm = new HitMap;

  (*phm)["SpaceShip"] = &hitSpaceShip;
  (*phm)["SpaceStation"] = &hitSpaceStation;
  (*phm)["Asteroid"] = &hitAsteroid;

  return phm;
}

void SpaceShip::hitSpaceShip(GameObject& spaceShip)
{
  SpaceShip& otherShip = dynamic_cast<SpaceShip&>(spaceShip);
  // process a SpaceShip-SpaceShip collision
}

void SpaceShip::hitSpaceStation(GameObject& spaceStation)
{
  SpaceStation& station = dynamic_cast<SpaceStation&>(spaceStation);
  // process a SpaceShip-SpaceStation collision
}

void SpaceShip::hitAsteroid(GameObject& asteroid)
{
  Asteroid& theAsteroid = dynamic_cast<Asteroid&>(asteroid);
  // process a SpaceShip-Asteroid collision
}
```

#### Using Non-member collision-processing functions

<dl>
<dt>Goal</dt>
<dd>
Extending does not force a full recompile
</dd>
<dt>Approach </dt>
<dd>
Move collision-processing functions outside of <code>class</code>es.
</dd>
</dl>

``` cpp
#include "SpaceShip.h"
#include "SpaceStation.h"
#include "Asteroid.h"

namespace {

  // primary collision-processing functions
  void shipAsteroid(GameObject& spaceship, GameObject& asteroid);
  void shipStation(GameObject& spaceship, GameObject& spaceStation);
  void asteroidStation(GameObject& asteroid, GameObject& spaceStation);
  ...


  // secondary collision-processing functions
  void asteroidShip(GameObject& asteroid, GameObject& spaceShip)
  { shipAsteroid(spaceShip, asteroid); }
  void stationShip(GameObject& spaceStation, GameObject& spaceShip)
  { shipStation(spaceShip, spaceStation); }
  void stationAsteroid(GameObject& spaceStation, GameObject& asteroid)
  { asteroidStation(asteroid, spaceStation); }
  ...

  typedef void (*HitFunctionPair)(GameObject&, GameObject&);
  typedef map<pair<string, string>, HitFunctionPtr> HitMap;

  pair<string, string> makeStringPair(const string& class1, const string& class2);
  HitMap* initializeCollisionMap();
  HitFunctionPtr lookup(const string& class1, const string& class2);
}

void processCollision(GameObject& object1, GameObject& object2)
{
  HitFunctionPtr phf = lookup(typeid(object1).name(), typeid(object2).name());
  if (phf) phf(object1, object2);
  else throw UnknownCollision(object1, object2);
}

namespace {
  pair<string,string> makeStringPair(const char* s1, const char* s2)
  { return pair<string,string>(s1,s2); }

  HitMap* initializeCollisionMap()
  {
    HitMap* phm = new HitMap;

    (*phm)[makeStringPair("SpaceShip", "Asteroid")] = &shipAsteroid;
    (*phm)[makeStringPair("SpaceShip", "SpaceStation")] = &shipStation;
    ...

    return phm;
  }

  HitFunctionPtr lookup(const string& class1, const string& class2)
  {
    static auto_ptr<HitMap> collisionMap(initializeCollisionMap());
    HitMap::iterator mapEntry = collisionMap->find(make_pair(class1, class2));
    if (mapEntry == collisionMap->end()) return 0;
    return (*mapEntry).second;
  }
}
```

#### Dynamic emulated `virtual` function tables

<dl>
<dt>Goal</dt>
<dd>
Make a dynamic <code>virtual</code> function table
</dd>
<dt>Approach</dt>
<dd>
Turn <code>HitMap</code> into a <code>class</code> that can add and remove entries
</dd>
</dl>

``` cpp
class CollisionMap {
public:
  typedef void (*HitFunctionPtr)(GameObject&, GameObject&);

  void addEntry(const string& type1,
                const string& type2,
                HitFunctionPtr collisionFunction,
                bool symmetric = true);
  void removeEntry(const string& type1, const string& type2);
  HitFunctionPtr lookup(const string& type1, const string& type2);
  static CollisionMap& theCollisionMap();

private:
  CollisionMap();
  CollisionMap(const CollisionMap&);
};
```

> The `static` function and the `private` constructors enforce the existence of no more than one
> `CollisionMap` object. See [Item 26](more_effective_cpp#item-26-limiting-the-number-of-objects-of-a-class) for more details.

## Miscellany

### Item 32: Program in the future tense

- Provide complete `class`es, even if some parts aren't currently used. When new demands are made
  on the `class`es, it is less likely to have to go back and modify them.
- Design interfaces to facilitate common operations and prevent common errors. Make the `class`es
  easy to use correctly, hard to use incorrectly.
- If there is no great penalty for generalizing code, generalize it.

### Item 33: Make non-leaf classes abstract

``` cpp
class Animal {
public:
  Animal& operator=(const Animal& rhs);
  ...
};

class Lizard : public Animal {
public:
  Lizard& operator=(const Lizard& rhs);
  ...
};

class Chicken : public Animal {
public:
  Chicken& operator=(const Chicken& rhs);
  ...
}
```

Suppose, this code should be allowed

``` cpp
Lizard liz1;
Chicken chick;

Animal* pAnimal1 = &liz1;
Animal* pAnimal2 = &liz2;
...

*pAnimal1 = *pAnimal2;
```

but, this code should be prohibited

``` cpp
Lizard liz;
Chicken chick;

Animal* pAnimal1 = &liz;
Animal* pAnimal2 = &chick;
...

*pAnimal1 = *pAnimal2;
```

There is no easy way to enforce this. It is best to eliminate the need to allow assignments between
`Animal` objects by making `Animal` an abstract `class`. If `Animal` is a necessary `class`, then
make a new abstract `class` and have all `class`es inherit from it.

``` cpp
class AbstractAnimal {
protected:
  AbstractAnimal& operator=(const AbstractAnimal& rhs);

public:
  virtual ~AbstractAnimal() = 0
  ...
};

class Animal : public AbstractAnimal {
public:
  Animal& operator=(const Animal& rhs);
  ...
};

class Lizard : public AbstractAnimal {
public:
  Lizard& operator=(const Lizard& rhs);
  ...
};

class Chicken : public AbstractAnimal {
public:
  Chicken& operator=(const Chicken& rhs);
  ...
};
```

> For a `class` to be abstract, it must contain at least one pure `virtual` function. If it is tough
> to find a suitable function, make the destructor pure `virtual`.

### Item 34: Understand how to combine C++ and C in the same program

Below is a list of things to keep in mind when C++ and C are mixed in the same program.

#### Name mangling

When using C++ functions outside of C++, use `extern "C"` to suppress mangling of names.

#### Initialization of statics

The constructors of `static` `class` objects and objects in global, `namespace`, and file scope are
usually called before the body of `main` is executed. Similarly, destruction of those objects takes
place after `main` has finished executing. If a C++ compiler does this, `static` initialization and
destruction *will not* take place unless `main` is written in C++. If `main` is written in C, any
`static` C++ objects used are in jeopardy.

One technique to circumvent this problem is to rename the `main` written C to `realMain` and write a
C++ version of `main` and have it call `realMain`

``` cpp
extern "C"
int realMain(int argc, char* argv[]);

int main(int argc, char* argv[])
{
  return realMain(argc, argv);
}
```

#### Dynamic memory allocation

C++ parts of a program use `new` and `delete`, and C parts of a program use `malloc` and `free`.
These keywords are not to be mixed and matched with the same object.

#### Data structure compatibility

C++ contains features that C does not. It is safe to pass data structures from C++ to C and C to C++
provided the definition of those structures compiles in both C++ and C. `virtual` member functions
are a no-go for C.
