# Effective C++

*2005 Scott Meyers*

Read the book [here](https://www.aristeia.com/books.html).

## Accustoming Yourself to C++

### Item 1: View C++ as a federation of languages

C++ is a *multi-paradigm programming language*

- C
- Object-Oriented C++
- `template` C++
- The STL

**Things to Remember**

- Rules for effective C++ programming vary, depending on the part of C++ you are using.

### Item 2: Prefer `const`s, `enum`s, and `inline`s to `#define`s

Prefer the compiler to the preprocessor.

``` cpp
#define ASPECT_RATIO 1.653
```

`ASPECT_RATIO` can be hard to debug because the compiler may never get to see it. Use `const` instead.

``` cpp
const double aspectRatio = 1.653;
const char * const authorName = "Scott Meyers";
const std::string authorName("Scott Meyers");
```

> When defining a pointer, make sure both the pointer and the data is `const`.
 
`const` is more powerful than `#define` because the scope can be limited. Use the `static` keyword to
make sure there's only one copy.

``` cpp
class GamePlayer {
private:
  static const int NumTurns = 5;   // const declaration,
                                   // make sure its static
  int scores[NumTurns];
}

const int GamePlayer::NumTurns;     // const definition
```

> `NumTurns` is needed during compilation to give the array the correct size. Sometimes compilers get
> angry and "the `enum` hack" is needed.
>
> ``` cpp
> class GamePlayer {
> private:
>    enum { NumTurns = 5 };
>    int scores[NumTurns]    // now, compiler wont complain about size of array
> }
> ```

As an alternative to macros, prefer `template`d `inline` functions (see [Item
30](effective_cpp#item-30-understand-the-ins-and-outs-of-inlineing)).

``` cpp
template<typename T>                               // don't need to know what T is with
inline void callWithMax(const T& a, const T& b)    // pass by reference-to-const
{
  f(a > b ? a : b)
}
```

**Things to Remember**

- For simple constants, prefer `const` objects or `enum`s to `#define`s.
- For function-like macros, prefer `inline` functions to `#define`s.

### Item 3: Use `const` whenever possible

`const` tells the programmer and the compiler that an object should not be modified.

When using pointers, look at the asterisk. If `const` appears to the:

- **Left** - Whats *pointed to* is `const`.
- **Right** - The *Pointer itself* is `const`.

`const` can reduce bugs by making sure functions are used their intended way.

``` cpp
class Rational { ... };

const Rational operator*(const Rational& lhs, const Rational& rhs);

Rational a, b, c;
...
(a * b) = c;         // probably didn't want to do this.
if (a * b = c) ...   // probably didn't want to do this.
```

By making the result `const`, modification of the result is not allowed.

#### `const` Member Functions

Using `const` in member functions can help:

- Make the interface of a `class` easier to understand.
- Improve performance by passing objects by reference-to-`const`.

Non-`const` member functions can be overloaded with `const` counterparts. Often, the code
duplication is worth it.

``` cpp
class TextBlock {
public:
  ...
  const char& operator[](const std::size_t position) const
  { return text[position]; }

  char& operator[](const std::size_t position) const
  { return text[position]; }
private:
  std::string text;
};
```

To avoid duplicating code, have the non-`const` member function call the `const` one.

``` cpp
class TextBlock {
public:
  ...
  const char& operator[](std::size_t position) const
  {
    ...
    return text[position];
  }

  char& operator[](std::size_t position)
  {
    return const_cast<char&>(               // cast away const on op[] return type
      static_cast<const TextBlock&>(*this)  // add const to this*'s type
        [position]                          // call const version of op[]
     );
  }
  ...
};
```

Unfortunately, the cost is elegance.

#### Conceptual `const`ness

Sometimes an object's bits need to be modified in ways that are still undetectable to the client.
Unfortunately, `const` member functions will not allow it. To fix this problem, use `mutable` to
allow non-`static` data to be changed in a `const` member function.

``` cpp
class CTextBlock {
public:
  ...
  std::size_t length() const;

private:
  char *pText;
  mutable std::size_t textLength;  // mutable objects can be modified
  mutable bool lengthIsValid;      // in const member function
};

std::size_t CTextBlock::length() const
{
  if (!lengthIsValid) {
    textLength = std::strlen(pText);
    lengthIsValid = true;
  }

  return textLength;
}
```

**Things to Remember**

- Declaring something `const` helps compilers detect usage errors. `const` can be applied to objects at any scope, to
  function parameters and `return` types, and to member functions as whole.
- Compilers enforce bitwise `const`ness, but you should program using conceptual `const`ness.
- When `const` and non-`const` member functions have the same implementations, code duplication can be avoided by
  having the non-`const` version call the `const` version.

### Item 4: Make sure the objects are initialized before they're used

Objects used before they are initialized can yield undefined behavior, an excellent source of grief to debug.

Non-member objects should be initialized manually.

``` cpp
int x = 0;
const chat * text = "A C-style string";
double d;
std::cin >> d;
```

For everything else, constructors can be used, but do not confuse initialization with assignment.

``` cpp
class PhoneNumber { ... };

class ABEntry {
public:
  ABEntry(const std::string& name, const std::string& address,
          const std::list<PhoneNumber>& phones);
private:
  std::string theName;
  std::string theAddress;
  std::list<PhoneNumber> thePhones;
  int numTimesConsulted;
};

ABEntry::ABEntry(const std::string& name, const std::string& address,
                 const std::list<PhoneNumber>& phones)
{
  theName = name;
  theAddress = address;
  thePhones = phones;
  numTimesConsulted = 0;
}
```

While this is okay, the members of `ABEntry` are initialized before the body of the constructor is entered. Once the
body is entered, the members are being *assigned*. For `numTimesConsulted`, there's no guarantee that it was
initialized at all before it's assignment.

This looks like a job for...

#### Member Initialization list

Member initialization lists are:

- **Efficient** - members are copy-constructed from their parameters instead of a call to the
  default constructor and then another call to the assignment operator.
- **Required** - for
  - `const` members
  - members that are references

``` cpp
ABEntry::ABEntry()
: theName(),
  theAddress(),
  thePhones(),
  numTimesConsulted(0)
{}

ABEntry::ABEntry(const std::string& name, const std::string& address,
                 const std::list<PhoneNumber>& phones)
: theName(name),
  theAddress(address),
  thePhones(phones),
  numTimesConsulted(0)
{}
```

> Always list members in the initialization list in the same order as they are declared in the
> `class`.

#### Member Initialization with Global Variables

The relative initialization order of non-local `static` objects defined in different translation units (source and
header) is undefined.

``` cpp
// Service
class FileSystem {
public:
  ...
  std::size_t numDisks() const;
  ...
};

extern FileSystem tfs;  // global object for clients to use

// Client
class Directory {
public:
  Directory(params);
  ...
};

Directory::Directory(params)
{
...
std::size_t disks = tfs.numDisks();
...
}

Directory tempDir(params); // call constructor
```

`tfs` must be constructed before `tempDir`, but there's no way to guarantee it will be. Instead, `tfs` can be 
re-purposed into a function that `return`s a reference to a local `static` object.

``` cpp
class FileSystem { ... };

Filesystem& tfs()
{
  static FileSystem fs;
  return fs;
}

class Directory{ ... };

Directory::Directory( params )
{
  ...
  std::size_t disks = tfs.numDisks();
  ...
}

Directory& tempDir()
{
  static Directory td;
  return td;
}
```

The global objects are now local and `return` references to themselves.

> Non-`const`, `static` objects can create problems in multi-threaded applications

**Things to Remember**

- Manually initialize objects of a built-in type, because C++ only sometimes initializes them itself.
- In a constructor, prefer *member initialization list* to assignment inside the body of the constructor.
- Avoid initialization order problems across translation units by replacing non-local `static` objects with local
  `static` objects.

## Constructors, Destructors and Assignment Operators

### Item 5: Know what functions C++ silently writes and calls

If not declared, compilers will declare their own `public` `inline` versions of the following functions:

- Default constructor
- Copy constructor
- Copy assignment operator
- Destructor

For example, 

``` cpp
class Empty{};
```

is the same as

``` cpp
class Empty {
  public:
  Empty() { ... }                              // default constructor
  Empty(const Empty& rhs) { ... }              // copy constructor
  ~Empty() { ... }                             // destructor
  Empty& operator=(const Empty& rhs) { ... }   // copy assignment operator
};
```

> - If any constructor has been declared, the compiler will not generate a default constructor.
> - If a `class` has reference members, the copy assignment operator must be defined.

**Things to Remember**

- Compilers may implicitly generate a `class`'s default constructor, copy constructor, copy
  assignment operator, and destructor.

### Item 6: Explicitly disallow compiler-generated functions you do not want

Sometimes the compiler-generated functions are unwanted. To remove them, declare them as `private`.

``` cpp
class HomeForSale {
public:
  ...

private:
  HomeForSale(const HomeForSale&);             // client cannot copy
  HomeForSale& operator=(const HomeForSale&);
};
```

Or even better, make the compiler complain instead of the linker if the `class` is misused.

``` cpp
class Uncopyable {
protected:
  Uncopyable() {}                           // allow constructors
  ~Uncopyable() {}

private:
  Uncopyable(const Uncopyable&);
  Uncopyable& operator=(const Uncopyable&); // disallow copying
};

class HomeForSale: private Uncopyable {
  ...
};
```

> Check out the Boost implementation of `Uncopyable`, called `noncopyable`

**Things to Remember**

- To disallow the functionality automatically provided by compilers, declare the corresponding
  member functions `private` and give no implementations. Using a base `class` like `Uncopyable`
  is the best way to do this.

### Item 7: Declare destructors `virtual` in polymorphic base `class`es

When a derived `class` object is deleted through a pointer to a base `class` with a non-`virtual`
destructor, results are undefined (usually "partially-destroyed" objects). This is an excellent way
to leak memory.

Always give the base `class` a `virtual` destructor. As a general rule, any `class` that is intended
to be *polymorphic* should have a `virtual` destructor.

``` cpp
class TimeKeeper {
public:
  Timekeeper();
  virtual ~TimeKeeper();
  ...
};

Timekeeper *ptk = getTimeKeeper();
...
delete ptk;                         // now behaves properly
```

> Do not go around declaring all destructors `virtual`. Only declare the ones meant to be used
> as base `class`es. Declare a `virtual` destructor if and only if that `class` has at least one
> `virtual` function.

> By the same token, do not inherit from `class`es that do not have a `virtual` destructor.
> They are not meant to be used as base `class`es.

**Things to Remember**

- Polymorphic base `class`es should declare `virtual` destructors. If a `class` has any `virtual`
  functions, it should have a `virtual` destructor.
- `class`es not designed to be base `class`es or not designed to be used polymorphically should
  not declare `virtual` destructors.

### Item 8: Prevent exceptions from leaving destructors

**Things to Remember**

- Destructors should never emit exceptions. If functions called in a destructor may `throw`, the
  destructor should `catch` any exceptions, then swallow them or terminate the program.
- If `class` clients need to be able to react to exceptions `throw`n during an operation, the
  `class` should offer a non-destructor function that performs the operation.

### Item 9: Never call virtual functions during construction or destruction

Base `class` constructors execute before derived `class` constructors. During construction of the
base `class`, that object's type is that of it's base `class`, not the derived `class`. Similarly,
during destruction the object's type reduces to it's base `class`.

As a base `class`, calls to a pure `virtual` function are illegal.

``` cpp
class Transaction {
public:
  Transaction();

  virtual void logTransaction() const = 0;
  ...
};

Transaction::Transaction()
{
  ...
  logTransaction();
}

class BuyTransaction: public Transaction {
public:
  virtual void logTransaction() const;
};

BuyTransaction b;
```

`logTransaction` is pure `virtual` because the `BuyTransaction` object has type `Transaction` when
`logTransaction` is called.

One way to solve the problem is to turn `logTransaction` into a non-`virtual` function.

``` cpp
class Transaction {
public:
  Transaction(const std::string& logInfo);

  void logTransaction(const std::string logInfo&) const;
  ...
};

Transaction::Transaction(const std::string& logInfo)
{
  ...
  logTransaction(logInfo);
}

class BuyTransaction: public Transaction {
public:
  BuyTransaction(params)
  : Transaction(createLogString(params))
  { ... }
  ...

private:
  static std::string createLogString(params);
};
```

A helper function is used to pass information to the base `class` constructor.

**Things to Remember**

- Don't call `virtual` functions during construction or destruction because such calls will never
  go to a more derived `class` than that of the now executing constructor or destructor.

### Item 10: Have assignment operators `return` a reference to `*this`

Assignments can be chained together.

``` cpp
in x, y, z;
x = y = z = 15; // x = (y = (z = 15));
```

As a convention, have *all* assignment operators `return` a reference to `*this` to support
chaining.

``` cpp
class Widget {
public:
  ...
  Widget& operator +=(const Widget& rhs)
  {
    ...
    return *this;
  }
  Widget& operator=(const Widget& rhs)
  {
    ...
    return *this;
  }
  ...
};
```

**Things to Remember**

- Have assignment operators `return` a reference to `*this`.

### Item 11: Handle assignment to self in `operator=`

Assignment to self is legal.

``` cpp
w = w;
// sometimes harder to see
a[i] = a[j];
*px = *py;

class Base { ...};
class Derived: public Base { ... };
void doSomething(const Base& rb, Derived& pd); // rb and *pd may be the same object

class Bitmap { ... };
class Widget {
...
private:
  Bitmap *pb;
};

Widget& Widget::operator=(const widget& rhs)
{
  delete pb;
  pb = new Bitmap(*rhs.pb);
  return *this;
}
```

The best way to make a `class` self-assignment safe is to make it `exception` safe.

``` cpp
Widget& operator=(const Widget& rhs)
{
  Bitmap *pOrig = pb;
  pb = new Bitmap(*rhs.pb);
  delete pOrig;
  return *this;
}
```

Or, use the copy-and-`swap` technique. This technique is more efficient but less clear.

``` cpp
class Widget {
  ...
  void swap(Widget& rhs); // exchange *this's and rhs's data
  ...
};

Widget& Widget::operator=(const Widget& rhs)
{
  Widget temp(rhs);
  swap(temp);
  return this*
}
```

**Things to Remember**

- Make sure `operator=` is well-behaved when an object is assigned to itself. Techniques include
  comparing addresses of source and target objects, careful statement ordering, and
  copy-and-`swap`.
- Make sure that any function operating on more than one object behaves correctly if two or more
  objects are the same.

### Item 12: Copy all parts of an object

When adding data to a `class`, make sure the copy constructor, if a custom one is implemented,
copies that data.

One of the most insidious ways the issue can arise is through inheritance.

``` cpp
class Date { ... };
class Customer {
public:
  ...
private:
  std::string name;
  Date lastTransaction;
}

class PriorityCustomer: public Customer {
public:
  ...
  PriorityCustomer(const PriorityCustomer& rhs);
  PriorityCustomer& operator=(const PriorityCustomer& rhs);
};

PriorityCustomer::PriorityCustomer(const PriorityCustomer& rhs)
: priority(rhs.priority)
{
  logCall("PriorityCustomer copy constructor")
}

PriorityCustomer& PriorityCustomer::operator=(const PriorityCustomer& rhs)
{
  logCall("PriorityCustomer copy assignment operator");
  priority = rhs.priority;
  return *this;
}
```

Notice that `name` and `lastTransaction` are not being copied in the constructor. These members will
be *default* constructed. The copy assignment operator is fine but it's not hard to think of ways
where that wouldn't be the case.

> Though it's desirable to avoid code duplication by having one copy function call another, it's 
> dangerous. Don't do it! The best way to avoid code duplication is to make another function and
> have both copy functions call it.

**Things to Remember**

- Copying functions should be sure to copy all object's data members and base `class` parts.
- Don't try to implement one of the copying functions using the other. Instead, put common
  functionality in a third function that both call.

## Resource Management

### Item 13: Use objects to manage resources

Many resources that are dynamically allocated on the heap are used only within a single block or
function, and should be released when control leaves that block or function. Instead of using
`delete` to clean up resources, try out resource managing *smart pointer*s. Using objects to manage
resources is called *Resource Acquisition Is Initialization* (RAII).

- `auto_ptr` only lets one pointer point to the object it's managing. This means copying sets the
  right hand side to `null` automatically.
- `tr1::shared_ptr` is a *reference-counting smart pointer* which deletes objects when nobody is
  pointing to it anymore.

> Typically, `vector` and `string` replace dynamically allocated arrays. For resource management,
> check out `boost::scoped_array` and `boost::shared_array`.

**Things to Remember**

- To prevent resource leaks, use RAII objects that acquire resources in their constructors and
  release them in their destructors.
- Two commonly useful RAII classes are `tr1::shared_ptr` and `auto_ptr`. `tr1::shared_ptr` is
  usually the better choice, because its behavior when copied is intuitive. Copying an `auto_ptr`
  sets it to `null`.

### Item 14: Think carefully about copying behavior in resource-managing `class`es

At some point, it might be nice to write a custom resource management `class`. For example, a scoped mutex `class`:

``` cpp
class Lock {
public:
  explicit Lock(Mutex *pm)
  : mutexPtr(pm)
  { lock(mutexPtr); }

  ~Lock() { unlock(mutexPtr); }

private:
  Mutex *mutexPtr;
};
```

Given the behavior of `Lock`, it's a good idea to:

- Prohibit copying (see [Item 6](effective_cpp#item-6-explicitly-disallow-the-use-of-compiler-generated-functions-you-do-not-want)).
- Reference-count the underlying resource.
   
  ``` cpp
  class Lock {
  public:
    explicit Lock(Mutex *pm)
    : mutexPtr(pm, unlock)
    { lock(mutexPtr.get()); }
   
  private:
    // use shared ptr instead of raw ptr for reference-count
    std::tr1::shared_ptr<Mutex> mutexPtr;
  };
  ```
   
  > `mutexPtr` is now a `shared_ptr`, so the destructor is no longer needed.
   
- Copy the underlying resource (do a "deep copy").
- Transfer ownership of the underlying resource (see `auto_ptr` in [Item 13](effective_cpp#item-13-use-objects-to-manage-resources)).

**Things to Remember**

- Copying an RAII object entails copying the resource it manages, so the copying behavior of the
  resource determines the copying behavior of the RAII object.
- Common RAII `class` copying behaviors are disallowing copying and performing reference counting
  but other behaviors are possible.

### Item 15: Provide raw access to raw resources in resource-managing `class`es

Many APIs refer to resources directly, so obtaining raw access to a resource from it's managing
`class` can be useful. Doing so can be either:

- **Explicit** - `get`, or
- **Implicit** - `operator->` and `operator*`

Explicit conversion is safer because it minimizes the chances of unintended type conversions.

**Things to Remember**

- APIs often need access to raw resources, so each RAII `class` should offer a way to get at
  the resource it manages.
- Access may be via explicit conversion or implicit conversion. In general, explicit conversion is
  safer, but implicit conversion is more convenient for clients.

### Item 16: Use the same form of corresponding uses of `new` and `delete`

``` cpp
std::string *stringArray = new std::string[100];
...
delete stringArray;
```

99 of the 100 `string`s were likely deleted improperly because their destructors were not
called.

> - If `[]` is used in the `new` expression, use a `[]` in the corresponding `delete` expression.
> - If `[]` is *not* used in the `new` expression, don't use a `[]` in the corresponding `delete`
>   expression.
>
> Do not add arrays to `typedef`s. It's hard to know when to use `[]` for `delete`. Instead use
> `string` and `vector`.

**Things to Remember**

- If you use `[]` in a new expression, you must use `[]` in the corresponding `delete` expression.
  If you don't use `[]` in a `new` expression, you mustn't use `[]` in the corresponding `delete`
  expression.

### Item 17: Store `new`ed objects in smart pointers in standalone statements

``` cpp
int priority();
void processWidget(std::tr1::shared_ptr<Widget> pw, int priority);

processWidget(new Widget, priority());
```

The code above won't compile because it has no implicit conversion from `new Widget` to
`tr1::shared_ptr<Widget>`

``` cpp
processWidget(std::tr1::shared_ptr<Widget>(new Widget), priority());
```

The code above may cause memory leaks. C++ compilers are free to decide the order in which code is
generated. Consider this order of calls:

1. Execute `new Widget`
1. Call `priority`
1. Call the `tr1::shared_ptr` constructor

If `priority` yields an exception, the `new Widget` is created without the smart pointer and memory
is leaked. To avoid this, use a separate statement to create `Widget` and store in a smart pointer.

``` cpp
std::tr1::shared_ptr<Widget> pw(new Widget);
processWidget(pw, priority());
```

**Things to Remember**

- Store `new`ed objects in smart pointers in standalone statements. Failure to do this can lead to
  subtle resource leaks when exceptions are `throw`n.

## Designs and Declarations

### Item 18: Make interfaces easy to use correctly and hard to use incorrectly

``` cpp
class Date {
public:
  Date(int month, int day, in year);
  ...
};
```

It's really easy to pass in invalid information. One way to fix this is to introduce new types.

``` cpp
struct Day {
  explicit Day(int d)
  :val(d) {}

  int val;
};

struct Month {
  explicit Month(int m)
  :val(m) {}

  int val;
};

struct Year {
  explicit Year(int y)
  :val(y) {}

  int val;
};

class Date {
public:
  Date(const Month& m, const Day* d, const Year& y);
  ...
};
```

Once the right `structs` are in place, the values can be restricted.

``` cpp
class Month {
public:
  static Month Jan() { return Month(1); }
  static Month Feb() { return Month(2); }
  ...
  static Month Dec() { return Month(12); }
  ...
private:
  explicit Month(int m);
  ...
};
```

> - Stay consistent with built-in types. This makes things intuitive.
> - Don't make clients remember to do things. Instead, `return` smart pointers.
>   - `shared_ptr` can also give each object a custom `delete`r.
>   - Additionally, `shared_ptr` prevents problems such as creating a `new` object on one DLL and
>     `delete`ing it on another.

**Things to Remember**

- Good interfaces are easy to use correctly and hard to use incorrectly. You should strive for
  these characteristics in all your interfaces.
- Ways to promote correct use include consistency in interfaces and behavioral compatibility
  with build-in types.
- Ways to prevent errors include creating new types, restricting operations on new types,
  constraining object values, and eliminating client resource management responsibilities.
- `tr1::shared_ptr` supports custom `delete`rs. This prevents the cross-DLL problem, can be used
  to automatically unlock `Mutex`'s (see [Item 14](effective_cpp#item-14-think-carefully-about-copying-behavior-in-resource-managing-classes)), etc.

### Item 19: Treat `class` design as type design

Designing good `class`es includes designing good types. When designing `class`es ask:

- How should objects of the new type be created and destroyed?
  - Constructor.
  - Destructor.
  - Memory allocation/deallocation.
- How should object initialization differ from object assignment (see [Item
4](effective_cpp#item-4-make-sure-the-objects-are-initialized-before-theyre-used))?
- What does it mean for objects of the new type to be passed by value?
- What are the restrictions on legal values for the new type?
  - Errors and error checking.
- Does the new type fit into an inheritance graph?
  - Base `class` functions `virtual`/non-`virtual` (see [Item 34](effective_cpp#item-34-differentiate-between-inheritance-of-interface-and-inheritance-fo-implementation) and [Item
36](effective_cpp#item-36-never-redefine-an-inherited-non-virtual-function)).
  - Make `class` inheritable (see [Item 7](effective_cpp#item-7-declare-destructors-virtual-in-polymorphic-base-classes))?
- What kind of type conversions are allowed for the new type?
  - Implicit/explicit (see [Item 15](effective_cpp#item-15-provide-raw-access-to-raw-resources-in-resource-managing-classes)).
- What operators and functions make sense for the new type (see [Item 23](effective_cpp#item-23-prefer-non-member-non-friend-functions-to-member-functions),
[Item 24](effective_cpp#item-24-declare-non-member-functions-when-type-conversions-should-apply-to-all-parameters) and [Item 46](effective_cpp#item-46-define-non-member-functions-inside-templates-when-type-conversions-are-desired))?
- What standard functions should be disallowed (`private`) (see [Item 6](effective_cpp#item-6-explicitly-disallow-the-use-of-compiler-generated-functions-you-do-not-want))?
- Who should have access to the members of the new type?
  - `public`, `protected`, `private`.
  - friend `class`es and nested `class`es.
- What is the "undeclared interface" of new new type?
  - performance.
  - exception safety (see [Item 29](effective_cpp#item-29-strive-for-exception-safe-code)).
  - resource usage.
- How general is the new type?
  - type - `class`.
  - family of types - `class template`.
- Is a new type really needed?

**Things to Remember**

- `Class` design is type design. Before defining a new type, be sure to consider all the issues
discussed in this Item.

### Item 20: Prefer pass-by-reference-to-`const` to pass-by-value

- Pass-by-value is expensive because it makes a copy of the object being passed in as a
  parameter.
- Pass-by-reference-to-`const` does not make a new object.
- Pass-by-reference-to-`const` eliminates the *slicing* problem.

> For built-in types, STL iterator, and function type objects, pass-by-value is more efficient.
> Generally, user-defined types are not good pass-by-value candidates.

#### *Slicing* Problem

When a derived `class` object is passed by value as a base `class` object, only the base `class`
copy constructor is called, the derived `class` features are *sliced* off.

``` cpp
class Window {
public:
  ...
  std::string name() const;
  virtual void display() const;
};

class WindowWithScrollBars: public Window {
public:
  ...
  virtual void display() const;
};

// incorrect! parameter may be sliced!
void printNameAndDisplay(Window w)
{
  sts::cout << w.name();
  w.display();
}

// fine, parameter will not be sliced
void printNameAndDisplay(const Window& w)
{
  std::cout << w.name();
  w.display();
}
```

**Things to Remember**

- Prefer pass-by-reference-to-`const` over pass-by-value. It's typically more efficient and it
  avoids the slicing problem.
- The rule doesn't apply to built-in types, STL iterator and function type objects; pass-by-value is usually okay.

### Item 21: Don't try to `return` a reference when you must `return` an object

*References* are only names to objects that already exist.

``` cpp
class Rational {
public:
  Rational(int numerator = 0, int denominator = 1);
  ...
private:
  int n, d;

friend const Rational operator*(const Rational& lhs, const Rational& rhs);
};

Rational a(1,2);
Rational b(3.5);
Rational c = a * b; // operator* needs to create a Rational object
```

Try creating on the stack?

``` cpp
const Rational& operator*(const Rational& lhs, const Rational& rhs)
{
  Rational result(lhs.n * rhs.n, lhs.d * rhs.d);
  return result;
}
```

`result` is a local object that gets destroyed when `operator*` goes out of scope. By `return`ing a
reference to result, behavior is undefined.

What about the heap?

``` cpp
const Rational& operator*(const Rational& lhs, const Rational& rhs)
{
  Rational *result = new Rational(lhs.n * rhs.n, lhs.d * rhs.d);
  return *result;
}
```

Who will call `delete` on the object conjured up by `new`? Some usage will make it
impossible to prevent memory leaks.

``` cpp
Rational w, x, y, z;
w = x * y * z;       // same as operator*(operator*(x, y), z)
```

What about `return`ing a reference to a `static Rational` object?

``` cpp
const Rational& operator*(const Rational& lhs, const Rational& rhs)
{
  static Rational result;
  // multiply rhs by lhs and put product in result
  return result;
}
```

Beyond having thread problems, `static` variables keep state across function calls. Creating too
many `static` objects will produce bugs.

The best way to write a function that `return`s a new object is to actually `return` a new object.

``` cpp
inline const Rational operator*(const Rational& lhs, const Rational& rhs)
{
  return Rational(lhs.n * rhs.n, lhs.d * rhs.d);
}
```

**Things to Remember**

- Never `return` a pointer or reference to a local stack object, a reference to a heap-allocated
  object, or a pointer or a reference to a local `static` object if there's a chance that more
  than one such object is needed.

### Item 22: Declare data members `private`

Requiring functions to access data:

-   **Improves consistency**
    - Don't let clients question whether data is `public` or `private`. Always make them use a function.
-   **Provides restrictive access**

    ``` cpp
    class AccessLevels {
    public:
      ...
      int getReadOnly() const       { return readOnly; }
    
      void setReadWrite(int value)  { readWrite = value; }
      int getReadWrite() const      { return readWrite; }
    
      void setWriteOnly(int value)  { writeOnly = value; }
    
    private:
      int noAccess;
      int readOnly;
      int readWrite;
      int writeOnly;
    };
    ```

-   **Provides encapsulation**
    Encapsulation provides flexibility.
    
    ``` cpp
    class SpeedDataCollection {
      ...
    public:
      void addValue(int speed);
      double averageSoFar() const; // computation required
    }
    ```
    
    Encapsulating with a function gives the developer a choice of how to implement the computations
    involved in giving the client its data.
    
    > Using `protected` data is no better than `public`. Use accessors!

**Things to Remember**

- Declare data members `private`. It gives clients syntactically uniform access to data, affords
  fine-grained access control, allows invariants to be enforced and offers `class` authors
  implementation flexibility.
- `protected` is no more encapsulated than `public`.

### Item 23: Prefer non-member non-friend functions to member functions

``` cpp
class WebBrowser {
public:
  ...
  void clearCache();
  void clearHistory();
  void removeCookies();
  ...
  void clearEverything(); // calls clearCache, clearHistory, removeCookies
};

void clearBrowser(WebBrowser& wb)
{
  wb.clearCache();
  wb.clearHistory();
  wb.removeCookies();
}
```

`clearBrowser` is more encapsulated than `clearEverything` because less can see it.

Non-member, non-`friend` functions can be:

-   A `static` member function of some utility `class`.
-   A non-member function in the same `namespace` as `WebBrowser`:
    
    ``` cpp
    namespace WebBrowserStuff {
    
    class WebBrowser { ... };
    
    void clearBrowser(WebBrowser& wb);
    ...
    }
    ```

Functions such as `clearBrowser` are *convenience functions*. Try to spread them across several headers.

``` cpp
// header "webbrowser.h" - header for class WebBrowser itself as well as "core" WebBrowser-related functionality
namespace WebBrowserStuff {
  class WebBrowser { ... };
  // "core" functionality almost all clients need
}
// header "webbrowserbookmarks.h"
namespace WebBrowserStuff {
  // bookmark related convenience functions
}
// header "webbrowsercookies.h"
namespace WebBrowserStuff {
  // cookie-related convenience functions
}
...
```

This strategy makes it easier for clients to *extend* the convenience functions.

**Things to Remember**

- Prefer non-member non-`friend` functions to member functions. Doing so increases encapsulation,
  packaging flexibility, and functional extensibility.

### Item 24: Declare non-member functions when type conversions should apply to all parameters

To have `Rational` support commutative multiplication, one might make `operator*` a member function.
But, mixed-mode arithmetic will only work half of the time.

``` cpp
class Rational {
public:
  Rational(int numerator = 0, int denominator = 1);

  int numerator() const;
  int denominator() const;

  const Rational operator*(const Rational& rhs) const;

private:
  ...
};

Rational oneEighth(1, 8);
Rational oneHalf(1, 2);

Rational result = oneHalf * oneEighth;    // fine
result = result * oneEighth;              // fine
// mixed-mode
result = oneHalf * 2;                     // fine
result = 2 * oneHalf;                     // error!
```

The mixed-mode statements evaluate to:

``` cpp
result = oneHalf.operator*(2);
result = 2.operator*(oneHalf);
```

`oneHalf` is an instance of `Rational` which has an `operator*` but `2` is an `int` which has no
such function. Additionally, the compiler will try to globally search for:

``` cpp
result = operator*(2, oneHalf);        // error!
```

To support mixed-mode arithmetic, add support to the call by making a non-member function.

``` cpp
class Rational {
  ...
};

const Rational operator*(const Rational& lhs, const Rational& rhs)
{
  return Rational(lhs.numerator() * rhs.numerator(), lhs.denominator() * rhs.denominator());
}
```

**Things to Remember**

- If you need type conversions on all parameters to a function, including the one pointed to by
  the `this` pointer, the function must be a non-member.

### Item 25: Consider support for a non-`throw`ing `swap`

This item is about using `std::swap` using the *pimpl* idiom (pointer to implementation - see [Item
31](effective_cpp#item-31-reduce-compilation-dependencies-between-files)). Below is a `class` that implements the
*pimpl* idiom.

``` cpp
class WidgetImpl {
public:
  ...
private:
  int a, b, c;            // imagine that WidgetImpl contains a lot
  std::vector<double> v;  // of data and is very expensive to copy.
  ...
};

class Widget {
public:
  Widget(const Widget& rhs);

  Widget& operator=(const Widget& rhs) {
    ...
    *pImpl = *(rhs.pImpl);
    ...
  }
  ...
private:
  WidgetImpl *pImpl;
}
```

The default `std::swap` algorithm:

``` cpp
namespace std {

  template<typename T>
  void swap(T& a, T& b)
  {
    T temp(a);
    a = b;
    b = temp;
  }
}
```

copies three `Widget`s and three `WidgetImpl`s which is expensive. A better way to swap
their data would be to only `swap` their internal `pImpl` pointers. `std::swap` needs to be
specialized for `Widget`.

``` cpp
namespace std {
  template<>
  void swap<Widget>(Widget& a, Widget& b)
  {
    swap(a.pImpl, b.pImpl);
  }
}
```

> Adding `template <>` to the beginning of a function is called *total template specialization*. In
> combination with `swap<Widget>`, this `std::swap` implementation would be used instead of the
> default implementation when `T` is a `Widget`.

This code will not compile because `a.pImpl` and `b.pImpl` are `private`. `Widget` needs a member
function whose implementation calls the `std` implementation.

``` cpp
class Widget {
public:
...
  void swap(Widget& other)
  {
    using std::swap;
    swap(pImpl, other.pImpl);
  }
  ...
};

namespace std {
  template<>
  void swap<Widget>(Widget& a, Widget& b)
  {
    a.swap(b);
  }
}
```

> `std` is special. Overloading existing function `template`s is fine but adding any *new* stuff is
> considered bad practice. If `Widget` and `WidgetImpl` are `class template`s instead of just
> `class`es, `swap` needs to be in it's own `namespace`.

**Things to Remember**

- Provide a `swap` member function when `std::swap` would be inefficient for your type. Make sure
  your `swap` doesn't `throw` exceptions.
- If you offer a member `swap`, also offer a non-member `swap` that calls the member. For
  `class`es (not `template`s), specialize `std::swap` too.
- When calling `swap`, use a `using` declaration for `std::swap`, then call `swap` without
  `namespace` qualification.
- Its fine to totally specialize `std` `template`s for user-defined typos, but never try to add
  something completely new to `std`.

## Implementations

### Item 26: Postpone variable definitions as long as possible

``` cpp
// this function defines the variable "encrypted" too soon
std::string encryptPassword(const std::string& password)
{
  using namespace std;

  std::string encrypted;

  if (password.length() < MinimumPasswordLength) {
    throw logic_error("Password is too short");
  }
  encrypted = password;
  encrypt(encrypted);
  return encrypted;
}
```

`encrypted` is not used if the password is too short.

``` cpp
// the best way to define and initialize encrypted
std::string encryptPassword(const std::string& password)
{
  ...
  std::string encrypted(password);
  encrypt(encrypted);
  return encrypted;
}
```

Consider the following `for` loops:

``` cpp
// Approach A: define outside loop
Widget w;
for (int i = 0; i < n; ++i) {
  w = some value dependent on i;
  ...
}

// Approach B: define inside loop
for (int i = 0; i < n; ++i) {
  Widget w(some value dependent on i);
  ...
}
```

The costs for each approach are:

- **Approach A** - 1 constructor + 1 destructor + n assignments
- **Approach B** - n constructors + n destructors

In general, unless:

- Assignment is less expensive than constructor-destructor pair, and
- The code is performance-sensitive,

use Approach B.

**Things to Remember**

- Postpone variable definitions as long as possible. It increases program clarity and improves
program efficiency.

### Item 27: Reduce casting

C++ style casts:

- **`const_cast<T>(expression)`** - Used to cast away the `const`-ness of objects.
- **`dynamic_cast<T>(expression)`** - Used to do "safe downcasting", for example, to decide whether an
  object is of a particular type in an inheritance hierarchy.
- **`reinterpret_cast<T>(expression)`** - Used for low-level casts.
- **`static_cast<t>(expression)`** - Used to to force implicit conversions.

Old-style casts should only be used to call an *explicit* constructor to pass an object to a
function.

``` cpp
class Widget {
public:
  explicit Widgit(int size);
  ...
};

void doSomeWork(const Widget& w);

doSomeWork(Widget(15)); // create Widget from int with old-style cast
```

#### `static_cast`

Type conversions of any kind can lead to code that is only applied at runtime.

``` cpp
int x, y;
...
double d = static_cast<double>(x) / y; // division for doubles is typically different then for ints

class Base { ... };.
class Derived : public Base { ... };
Derived d;
Base *pb = &d; // implicitly convert Derived* -> Base*
```

Objects that inherit have more than just one address depending on the type of pointer (In this case,
`Base` or `Derived`).

``` cpp
class Window {
public:
  virtual void onResize() { ... }
  ...
};

class SpecialWindow : public Window {
public:
  virtual void onResize() {
    static_cast<Window>(*this).onResize();
    ...
  }
  ...
};
```

This code, as expected, casts `*this` to `Window` and then calls `Window::onResize`. Yet, it
does not invoke that function on the current object. Instead, it creates a new temporary *copy* of
the base `class` of `*this` then invokes `onResize` on the copy. This is probably not desired. There's no need to
cast anyway:

``` cpp
class SpecialWindow : public Window {
public:
  virtual void onResize() {
    Window::onResize();
    ...
  }
  ...
};
```

#### `dynamic_cast`

> `dynamic_cast` is expensive for performance-sensitive code.

`dynamic_cast` can be avoided in one of two ways:

1.  Use containers that store pointers (smart pointers) to derived `class` objects directly. Instead
    of this:

    ``` cpp
    class Window { ... };
   
    class SpecialWindow : public Window {
    public:
       void blink();
       ...
    };
    typedef
       std::vector<std::tr1::shared_ptr<Window> > VPW;
   
    VPW winPtrs;
  
    ...
  
    for (VPW::iterator iter = winPtrs.begin(); iter != winPtrs.end(); ++iter) {
      if (SpecialWindow *psw = dynamic_cast<SpecialWindow*>(iter->get()))
        psw->blink();
    }
    ```

    do this:

    ``` cpp
    typedef std::vector<std::tr1::shared_ptr<SpecialWindow> > VPSW;
   
    VPSW winPtrs;
    ...
   
    for (VPSW::iterator iter = winPtrs.begin(); iter != winPtrs.end(); ++iter) {
      (*iter)->blink();
    }
    ```

1.  Declare the function in the base `class` and offer a default implementation.
 
    ``` cpp
    class Window {
    public:
       virtual void blink() {}
       ...
    };
  
    class SpecialWindow : public Window {
       virtual void blink() { ... };
       ...
    };
  
    typedef std::vector<std::tr1::shared_ptr<Window> > VPW;
  
    VPW winPtrs;
    ...
  
    for (VPSW::iterator iter = winPtrs.begin(); iter != winPtrs.end(); ++iter) {
       (*iter)->blink();
    }
    ```

    > Avoid cascading `dynamic_cast`s
    >
    > ``` cpp
    > class Window { ... };
    > ...
    > 
    > typedef std::vector<std::tr1::shared_ptr<Window> > VPW;
    > 
    > VPW winPtrs;
    > ...
    > 
    > for (VPSW::iterator iter = winPtrs.begin(); iter != winPtrs.end(); ++iter) {
    >   if (SpecialWindow1 *psw1 = dynamic_cast<SpecialWindow1*>(iter->get())) {
    >     ...
    >   }
    >   else if (SpecialWindow2 *psw2 = dynamic_cast<SpecialWindow2*>(iter->get())) {
    >     ...
    >   }
    >   else if (SpecialWindow3 *psw3 = dynamic_cast<SpecialWindow3*>(iter->get())) {
    >     ...
    >   }
    >   ...
    > }
    > ```

> Good C++ uses few casts.

**Things to Remember**

- Avoid casts whenever practical, especially `dynamic_cast`s in performance-sensitive code. If a
  design requires casting, try to develop a cast-free alternative.
- When casting is necessary, try to hide it inside a function. Clients can then call the function
  instead of putting casts in their own code.
- Prefer c++-style casts to old-style casts. They are easier to see, and they are more specific
  about what they do.

### Item 28: Avoid `return`ing *handles* to object internals

*Handles* can be references, pointers or iterators to an objects internals, potentially
compromising an objects encapsulation. They can also lead to `const` member functions that allow an
object's state to be modified.

``` cpp
class Point {
public:
  Point(int x, int y);
  ...

  void setX(int newVal);
  void setY(int newVal);
  ...
};

struct RectData {
  Point ulhc; // upper left-hand corner
  Point lrhc; // lower right-hand corner
};

class Rectangle {
public:
  Point& upperLeft() const { return pData->ulhc; }
  Point& lowerRight() const { return pData->lrhc; }
  ...

private:
  std::tr1::shared_ptr<RectData> pData;
};
```

Now `Point` and `Rectangle` `return` references to `private` internal data so users can now change
that data.

``` cpp
Point coord1(0, 0);
Point coord2(100, 100);

const Rectangle rec(coord1, coord2);

rec.upperLeft().setX(50); // no bueno
```

One way to resolve this issue is to make the *handles* of `Rectangle` `return` `const` `Point`s. By
making the internals read-only, this is already much better. What about *dangling handles*
which refer to parts of objects that no longer exist?

``` cpp
class GUIObject { ... };

const Rectangle boundingBox(const GUIObject& obj);

GUIObject *pgo;
...
const Point *pUpperLeft = &(boundingBox(*pgo),upperLeft());
```

This code will `return` a temporary `Rectangle` object, call `upperLeft` which `return`s one of
the `Points`. `pUpperLeft` will then point to that `Point`. But at the end of the statement,
the temporary `Rectangle` will be destroyed. `pUpperLeft` now points to an object that no longer
exists.

> Code so that *handles* are minimized as much as possible.

**Things to Remember**

- Avoid `return`ing handles (references, pointers, or iterators) to object internals. It increases
  encapsulation, helps `const` functions act `const`, and minimizes the creation of *dangling
  handles*.

### Item 29: Strive for `exception`-safe code

``` cpp
class PrettyMenu {
public:
  ...
  void changeBackground(std::istream& imgSrc);
  ...

  private:
  Mutex mutex;

  Image &bgImage;
  int imageChanges;
};

void PrettyMenu::changeBackground(std::istream& imgSrc)
{
  lock(&mutex);

  delete bgImage;
  ++imageChanges;
  bgImage = new Image(imgSrc);

  unlock(&mutex);
}
```

`exception` safety comes with two requirements, and the above code satisfies neither:

- **Leak no resources** - Imagine `new Image(imgSrc)` yields an `exception`; the call to `unlock`
  never gets executed, and the mutex is never released.
- **Don't allow data structures to become corrupted** - If `new Image(imgSrc)` `throws`, `bgImage`
  continues pointing to a `delete`d object. Also, `imageChanges` is incremented even though updating
  the background image failed.

The first bullet can be fixed with resource management `class`es (see
[Item14](effective_cpp#item-14-think-carefully-about-copying-behavior-in-resource-managing-classes)). The second
bullet requires a choice about what kind of `exception`-safety can be guaranteed.

- **The basic guarantee** - If an `exception` is `throw`n, everything in the program remains in a
  valid state. Objects and data are not corrupted but the exact state of the program may not be
  predictable.
- **The strong guarantee** - If an `exception` is `throw`n, the state of the program is unchanged.
- **The nothrow guarantee** - An `exception` is never `throw`n because the function always promises
  to do what it's expected to do no matter what.

> Code should offer one of the three guarantees. Offer the strongest guarantee possible.

In this case, offering the strongest guarantee is not difficult. STL containers can be used to
manage the objects. Finally, rearrange `imageChanges` so that it's modified after the image has
been changed.

``` cpp
class PrettyMenu {
...
std::tr1::shared_ptr<Image> bgImage;
...
};

void PrettyMenu::changeBackground(std::istream& imgSrc)
{
  Lock ml(&mutex);
  bgImage.reset(new Image(imgSrc));
  ++imageChanges;
}
```

Now only the `Image` constructor is not `exception`-safe. Use the *pimpl* idiom with
copy-and-`swap`.

``` cpp
struct PMImpl {
  std::tr1::shared_ptr<Image> bgImage;
  int imageChanges;
};

class PrettyMenu {
  ...

  private:
  Mutex mutex;
  std::tr1::shared_ptr<PMImpl> pImpl;
};

void PrettyMenu::changeBackground(std:: istream& imgSrc)
{
  using std::swap;

  Lock ml(&mutex);

  std::tr1::shared_ptr<PMImpl> pNew(new PMImpl(*pImpl));

  pNew->bgImage.reset(new Image(imgSrc));
  ++pNew->imageChanges;

  swap(pImpl, pNew);
}
```

**Things to Remember**

- `exception`-safe functions leak no resources and allow no data structures to become corrupted,
  even when `exception`s are `throw`n. Such functions offer basic, strong, and `nothrow`
  guarantees.
- The strong guarantee can often be implemented via copy-and-`swap`, but the strong guarantee is
  not practical for all functions.
- A function can usually offer a guarantee no stronger than the weakest guarantee of the function
  it calls.

### Item 30: Understand the ins and outs of `inline`ing

`inline` functions can be declared implicitly by writing the function body in headers.

``` cpp
class Person {
public:
  ...
  int age() const { return theAge; }
  ...
private:
  int theAge;
};
```

Or, they can be defined explicitly with the `inline` keyword.

An `inline` function replaces each call of that function with it's code body.

- If the code body is long, it's likely to increase the size of object code compared to using a
  function call.
- If the code body is short, the code generated by the code body may be smaller than the code for
a function call, creating smaller object code.

`inline` is a request to compilers, not a command. Compilers may consider the code too
complicated. This decision depends on the build environment. In general, constructors and `virtual`
functions do not get `inline`d.

Most importantly, debuggers have trouble with `inline` functions. After all, its hard to set break points on
non-existent functions. When developing, do not declare anything `inline`. After testing, apply `inline` cautiously.

**Things to Remember**

- Limit most `inline`ing to small, often called functions. This facilitates debugging and
  binary upgradablility, reduces potential code bloat, and improves the chance of greater
  program speed.
- Don't declare function `template`s `inline` just because they appear in header files.

### Item 31: Reduce compilation dependencies between files

C++ doesn't do a good job of separating interfaces from implementations.

``` cpp
class Person {
public:
  Person(const std::string& name, const Date& birthday, const Address& addr);
  std::string name() const;
  std::string birthDate() const;
  std::string address() const;
  ...

private:
  std::string theName;
  Date theBirthDate;
  Address theAddress;
};
```

`Person` can't be compiled without access to definitions for `string`, `Date` and `Address`.

``` cpp
#include <string>
#include "date.h"
#include "address.h"
```

Now if any of these header files are changed, `Person` must be recompiled. One might be tempted to
*forward declare* to solve this problem.

``` cpp
namespace std {
  class string;
}

class Date;
class Address;

class Person {
public:
  Person(const std::string& name, const Date& birthday, const Address& addr);
  std::string name() const;
  std::string birthDate() const;
  std::string address() const;
  ...
};
```

1. Never try to manually declare parts of the standard library. `string` isn't even a `class`.
1. Compilers need to know the size of objects during compilation. Languages such as Smalltalk
   and Java work around this by only allocating enough space for a pointer to that object. This too, is
   legal in C++ with the *pimpl* idiom (see [Item 25](effective_cpp#item-25-consider-support-for-a-non-throwing-swap)).
   `class`es that use the *pimpl* idiom such as the example below are also known as *Handle classes* (see [Item
   28](effective_cpp#item-28-avoid-returning-handles-to-object-internals)).

``` cpp
#include <string>
#include <memory>

class PersonImpl;
class Date;
class Address;

class Person {
public:
  Person(const std::string& name, const Date& birthday, const Address& addr);
  std::string name() const;
  std::string birthDate() const;
  std::string address() const;
  ...

  private:
    std::tr1::shared_ptr<PersonImpl> pImpl;
};
```

The key to developing using the *Handle classes* is to:

- Avoid using objects when object references and pointers will do. Defining objects of a type
  necessitates the presence of the types definition.
- Depend on class declarations instead of class definitions whenever possible. Forward
  declare.
- Provide separate header files for declarations and definitions. For example, separate
  declarations into ".hpp" and definitions into ".cpp".

Another solution is to make `Person` an *Interface class*.

``` cpp
class Person {
public:
  virtual ~Person();
  // virtual constructor
  static std::tr1::shared_ptr<Person> create(const std::string& name,
                                             const Date& birthday,
                                             const Address& addr);
  ...
  virtual std::string name() const = 0;
  virtual std::string birthDate() const = 0;
  virtual std::string address() const = 0;
  ...
}
```

A concrete `class` inherits the interface and provides implementations

``` cpp
class RealPerson : public Person {
public:
  RealPerson(const std::string& name, const Date& birthday,
             const Address& addr)
  : theName(name), theBirthDate(birthday), theAddress(addr)
  {}
  virtual ~RealPerson() {}
  std::tr1::shared_ptr<Person> create(const std::string& name,
                                      const Date& birthday,
                                      const Address& addr)
  {
    return std::tr1::shared_ptr<Person>(new RealPerson(name, birthday, addr));
  }

  std::string name() const { ... }
  std::string birthDate() const { ... }
  std::string address() const { ... }

private:
  std::string theName;
  Date theBirthDate;
  Address theAddress;
 };
 ```

**Things to Remember**

- The general idea behind minimizing compilation dependencies is to depend on declarations instead
  of definitions. Two approaches based on this idea are *Handle classes* and *Interface classes*.
- Library header files should exist in full and declaration-only forms. This applies regardless of
  whether `template`s are involved.

## Inheritance and Object-Oriented Design

### Item 32: Make sure `public` inheritance models *is-a*

> `public` inheritance means *is-a*.

``` cpp
class Person { ... };
class Student : public Person { ... };
```

Every student is a person. Not every person *is a* student.

``` cpp
void eat(const Person& p);
void study(const Student& s);

Person p;
Student s;

study(s);   // fine
study(p);   // error! protected by inheritance
```

Yet, some things that are applicable to the base `class` are not applicable to the derived
`class`. For example:

**Birds and penguins**

``` cpp
class Bird {
public:
  virtual void fly();
  ...
};

class Penguin : public Bird {
  ...
};
```

Penguins are birds, but they can't fly.

**Rectangles and squares**

``` cpp
class Rectangle {
public:
  virtual void setHeight(int newHeight);
  virtual void setWidth(int newWidth);

  virtual int height() const;
  virtual int width() const;

  ...
};

void makeBigger(Rectangle& r)
{
  int oldHeight = r.height();
  r.setWidth(r.width() + 10);
  assert(r.height() == oldHeight);
}

class Square : public Rectangle { ... };
Square s;
...
assert(s.width() == s.height());
makeBigger(s);
assert(s.width() == s.height()); // should be true
```

`makeBigger` conflicts with the properties of a `Square`.

**Things to Remember**

- `public` inheritance means *is-a*. Everything that applies to base `class`es must also apply to
  derived `class`es, because every derived `class` object *is* a base `class` object.

### Item 33: Avoid hitting inherited names

Just like functions, inheritance can hide names in their scope.

``` cpp
class Base {
public:
  virtual void mf1() = 0;
  virtual void mf2();
  void mf3();
  ...

private:
  int x;
};

class Derived : public Base {
public:
  virtual void mf1();
  void mf4();
  ...
};

void Derived::mf4()
{
  ...
  mf2();
  ...
}
```

When the compiler sees `mf2()`, it first looks in the local scope `Derived`. It finds no
declaration, so it looks in the containing scope `Base`. It does see `mf2()` so the search stops. If
the search were to continue, it would first look in the `namespace`s containing `Base`, if any, and
then it would finally search in the global scope.

Now let's overload `mf1` and `mf3`.

``` cpp
class Base {
private:
  int x;
public:
  virtual void mf1() = 0;
  virtual void mf1(int);

  virtual void mf2();
  void mf3();
  void mf3(double);
  ...
};

class Derived : public Base {
public:
  virtual void mf1();
  void mf3();
  void mf4();
  ...
};

Derived d;
int x;

...
d.mf1();    // calls Derived::mf1
d.mf1(x);   // error! Derived::mf1 hides Base::mf1
d.mf2();    // calls Base::mf2
d.mf3();    // calls Derived::mf3
d.mf3(x);   // error! Derived::mf3 hides Base::mf3
```

The rationale behind this behavior is to prevent accidental overload inheritance from distant base
`class`es. Unfortunately, the overloads need to be inherited. Do so with the `using` declaration.

``` cpp
class Derived : public Base {
public:
  using Base::mf1;  // make mf1 and
  using Base::mf3;  // mf3 visible and public

  virtual void mf1();
  void mf3();
  void mf4();
  ...
};
```

Sometimes, functions from a base `class` do not need to be inherited. Under `public` `class`es,
this violates the *is-a* relationship. This is why `using` is in the `public` part of `Derived`.
For `private` inheritance, (see [Item 39](effective_cpp#item-39-use-private-inheritance-judiciously)), things are
different; use a simple forwarding function.

``` cpp
class Derived : private Base {
public:
  virtual void mf1()
  { Base::mf1; }
  ...
};

Derived d;
int x;

d.mf1();    // calls Derived::mf1
d.mf1(x);   // error! Base::mf1() is hidden
```

**Things to Remember**

- Names in derived `class`es hide names in base `class`es. For `public` inheritance, this is
  never desirable.
- To make hidden names visible again, use `using` declarations or forwarding functions.

### Item 34: Differentiate between inheritance of interface and inheritance fo implementation

`public` inheritance is composed of two parts:

- Inheritance of function interfaces.
- Inheritance of function implementations.

``` cpp
class Shape {
public:
  virtual void draw() const = 0;
  virtual void error(const std::string& msg);
  int objectID() const;
  ...
};

class Rectangle : public Shape { ... }
class Ellipse : public Shape { ... }
```

`Shape` has three different kinds of functions:

- `draw` is a *pure `virtual` function*. This makes `Shape` an *abstract `class`*. As such, clients
  cannot create instances of it.
- `error` is a *`virtual` function*. `virtual` functions contain a default implementation that
  derived `class`es can override.
- `objectID` is a *non-`virtual` function*. It's default implementation is mandatory for
  all derived `class`es.

> `virtual` functions can be tricky because it's easy to (undesirably) forget to override the
> implementation. One way around this is to force a pure `virtual` function, but also provide a default
> implementation that clients can `inline`.
>
> ``` cpp
> class Airplane {
> public:
>   virtual void fly(const Airport& destination) = 0;
>   ...
> protected:
>   void defaultFly(const Airport& destination);
> };
> 
> void Airplane::defaultFly(const Airport& destination)
> {
>   // default code
> }
> 
> class ModelA : public Airplane {
> public:
>   virtual void fly(const Airplane& destination)
>   { defaultFly(destination) }
>   ...
> };
> ```

**Things to Remember**

- Inheritance of interface is different from inheritance of implementation. Under `public`
  inheritance, derived `class`es always inherit base `class` interfaces.
- Pure `virtual` functions specify inheritance of interface only.
- Simple `virtual` functions specify inheritance of interface plus inheritance of a default
  implementation.
- Non-`virtual` functions specify inheritance of interface plus inheritance of a mandatory
  implementation.

### Item 35: Consider alternatives to `virtual` functions

Using `virtual` functions as interfaces

``` cpp
class GameCharacter {
public:
  virtual int healthValue() const;
  ...
};
```

is both boring and inflexible. Instead, try the patterns below.

#### The *template method* pattern via the *non-`virtual` interface* idiom

``` cpp
class GameCharacter {
public:
int healthValue() const
{
  ... // do before stuff
  int retVal = doHealthValue();
  ... // do after stuff
  return retVal;
}
...

private:
  virtual int doHealthValue() const
  {
    ...
  }
};
```

This design requires clients to call `private virtual` functions indirectly through `public`
non-`virtual` member functions. It's called the *non-virtual interface* idiom, derived from the
*template method* pattern. One advantage is that `heathValue` becomes a *wrapper* with the
ability to have setup and cleanup code surrounding the `virtual` function which does the real work.

#### The *strategy* pattern via function pointers

``` cpp
class GameCharacter;

int defaultHealthCalc(const GameCharacter& gc);

class GameCharacter {
public:
  typedef int (*HealthCalcFunc)(const GameCharacter&);

  explicit GameCharacter(HealthCalcFunc hcf = defaultHealthCalc)
  : healthFunc(hcf)
  {}

  int healthValue() const
  { return healthFunc(*this); }
  ...

private:
  HealthCalcFunc healthFunc;
}
```

The *strategy* pattern offers unique flexibility allowing different instances of the same type to have
different function implementations that can be swapped out during runtime.

``` cpp
class EvilBadGuy : public GameCharacter {
public:
  explicit EvilBadGuy(HealthCalcFunc hcf = defaultHealthCalc)
  : GameCharacter(hcf)
  { ... }

  ...
};

int loseHealthQuickly(const GameCharacter&);
int loseHealthSlowly(const GameCharacter&);

EvilBadGuy ebg1(loseHealthQuickly);
EvilBadGuy ebg2(loseHealthSlowly);
```

> Since the implementations are outside of the `class`, they have no special access to the internals of the object
> they are for. Unfortunately, the only ways for these implementations to gain access involve weakening the
> encapsulation of the object.

#### The *strategy* pattern via `tr1::function`

`tr1::function` adds further flexibility to the *strategy* pattern by replacing the function pointer
with a function object. The function object can hold any callable object with compatible signature.
This allows the client to do some powerful things.

``` cpp
class GameCharacter {
public:
  typdef std::tr1::function<int (const GameCharacter&)> HealthCalcFunc;

  explicit GameCharacter(HealthCalcFunc hcf = defaultHealthCalc)
  : healthFunc(hcf)
  {}

  int healthValue() const
  { return healthFunc(*this); }
  ...

private:
  HealthCalcFunc healthFunc;
};

short calcHealth(const GameCharacter&);

struct HealthCalculator {
  { ... }
};

class GameLevel {
public:
  float health(const GameCharacter&) const;
  ...
};

class EvilBadGuy : public GameCharacter {
  ...
};

class EyeCandyCharacter : public GameCharacter {
  ...
};

EvilBadGuy ebg1(calcHealth);
EyeCandyCharacter ecc1(HealthCalculator());

GameLevel currentLevel;
...
EvilBadGuy ebg2(std::tr1::bind(&GameLevel::health, currentLevel, _1));
```

#### The classic *strategy* pattern

Sometimes its good to have something that people have an easier time recognizing.

``` cpp
class GameCharacter;

class HealthCalcFunc {
public:
  ...
  virtual int calc(const GameCharacter& gc) const
  { ... }
  ...
};

HealthCalcFunc defaultHealthCalc;

class GameCharacter {
public:
  explicit GameCharacter(HealthCalcFunc *phcf = &defaultHealthCalc)
  : pHealthCalc(phcf)
  {}

  int healthValue() const
  { return pHealthCalc->calc(*this); }
  ...
private:
  HealthCalcFunc *pHealthCalc;
};
```

**Things to Remember**

- Alternatives to `virtual` functions include the *non-`virtual` interface* idiom and various forms
  of the *strategy* design pattern. The *non-`virtual` interface* idiom itself is an example of the
  *template method* pattern.
- A disadvantage of moving functionality from a member function to a function outside the `class`
  is that the non-member function lacks access to the `class`'s non-`public` members.
- `tr1::function` objects act like generalized function pointers. Such objects support all
  callable entities compatible with the given target signature.

### Item 36: Never redefine an inherited non-virtual function

``` cpp
class B {
public:
  void mf();
  ...
};

class D : public B {
public:
  void mf();  // hides B::mf
  ...
};

D x;
B *pB = &x;
pB->mf();   // calls B::mf

D *pD = &x;
pD->mf();   // calls D::mf
```

This two-faced behavior comes from the nature of the functions. non-`virtual` functions are
*statically bound* while `virtual` functions are *dynamically bound*. This inconsistent behavior
should be avoided at all costs since it breaks the *is-a* relationship of `public` inheritance.

**Things to Remember**

- Never redefine an inherited non-`virtual` function.

### Item 37: Never redefine a functions inherited default parameter value

``` cpp
class Shape {
public:
  enum ShapeColor { Red, Green, Blue };

  virtual void draw(ShapeColor = Red) const = 0;
  ...
};

class Rectangle : public Shape {
public:
  virtual void draw(ShapeColor color = Green) const;
  ...
};

class Circle : public Shape {
public:
  virtual void draw(ShapeColor color) const;
  ...
};

Shape *ps;
Shape *pc = new Circle;       // dynamic type: Circle
Shape *pr = new Rectangle;    // dynamic type: Rectangle
```

An objects *dynamic type* is determined by the type of the object to which it refers.

``` cpp
ps = *pc;   // dynamic type: Circle
ps = *pr;   // dynamic type: Rectangle
```

`virtual` functions are *dynamically bound* meaning the function called is determined by the dynamic
type of the object.

``` cpp
pc->draw(Shape::Red);   // calls Circle::draw(Shape::Red)
pr->draw(Shape::Red);   // calls Rectangle::draw(Shape::Red)
pr->draw();             // calls Rectangle::draw(Shape::Red)
```

One might expect the `Rectangle` to to be green by default, however, default parameter values are
*statically bound*. The result is unexpected behavior.

> To get a `virtual` function to behave appropriately, consider alternatives to `virtual` functions
> ([Item 35](effective_cpp#item-35-consider-alternatives-to-virtual-functions)). One such alternative is the
> *non-`virtual` interface* idiom.
> 
> ``` cpp
> class Shape {
> public:
>   enum ShapeColor { Red, Green, Blue };
> 
>   void draw(ShapeColor color = Red) const
>   {
>     doDraw(color);
>   }
>   ...
> private:
>   virtual void doDraw(ShapeColor color) const = 0;
> };
> 
> class Rectangle : public Shape {
> public:
> ...
> private:
>   virtual void doDraw(ShapeColor color) const;
>   ...
> };
> ```
> 
> Since non-`virtual` functions should never be overridden by derived `class`es ([Item
> 36](effective_cpp#item-36-never-redefine-an-inherited-non-virtual-function)), this design makes it clear that the
> default color parameter should always be `Red`.

**Things to Remember**

- Never redefine an inherited default parameter value, because default parameter values are
  *statically bound*, while `virtual` functions - the only functions you should be overriding -
  are *dynamically bound*.

### Item 38: Model "has-a" or "is-implemented-in-terms-of" through composition

*Composition* is a relationship where objects of one type contain objects of another type.

``` cpp
class PhoneNumber { ... };

class Person {
public:
  ...

private:
  std::string name;
  Address address;
  PhoneNumber number;
};
```

*Composition* can also mean an objects implementation leans heavily on another
objects implementation.

> *Has-a* and *is-implemented-in-terms-of* is not as strong of a relationship as *is-a*, so `public`
> inheritance cannot be used.

``` cpp
template<class T>
class Set {
public:
  bool member(const T& item) const;

  void insert(const T& item);
  void remove(const T& item);

  std::size_t size() const;

private:
  std::list<T> rep;
};

template<typename T>
bool Set<T>::member(const T& item) const
{
  return std::find(rep.begin(), rep.end(), item) != rep.end();
}

template<typename T>
void Set<T>::insert(const T& item)
{
  if (!member(item)) rep.push_back(item);
}

template<typename T>
void Set<T>::remove(const T& item)
{
  typename std::list<t>::iterator it = std::find(rep.begin(), rep.end(), item);
  if (it != rep.end()) rep.erase(it);
}

template<typename T>
std::size_t Set<T>::size() const
{
  return rep.size();
}
```

**Things to Remember**

- *Composition* has meanings completely different from that of `public` inheritance.
- In the application domain, *composition* means *has-a*. In the implementation domain, it means
  *is-implemented-in-terms-of.*

### Item 39: Use `private` inheritance judiciously

``` cpp
class Person { ... };
class Student : private Person { ... }

void eat(const Person& p);

void study(const Student& s);

Person p;
Student s;

eat(p); // fine, p is a Person
eat(s); // error, a Student isn't a Person
```

Rules of `private` inheritance:

- Compilers generally do not convert a derived `class` object into a base `class` object.
- Members inherited from a `private` base `class` become `private` members of the derived `class`
  no matter what.
- `private` inheritance means *is-implemented-in-terms-of*.

``` cpp
class Timer {
public:
  explicit Timer(int tickFrequency);
  virtual void onTick() const;
  ...
};

class Widget {
private:
  class WidgetTimer : public Timer {
  public:
    virtual void onTick() const;
    ...
  };
  WidgetTimer timer;
  ...
};
```

`private` inheritance is useful for:

- **Preventing derived `class`es from redefining `virtual` functions** - Any `class` derived from
  `Widget` cannot redefine `onTick` because it's a `private` function of `Widget`.
- **Minimizing compilation dependencies**s - If `Widget` inherits from `Timer`, `Timer`s definition is
  needed. Yet, if `WidgetTimer` is moved out of `Widget` and `Widget` only has a pointer
  to `WidgetTimer`, `Widget` then only needs a simple declaration of `WidgetTimer` and is
  decoupled from `Timer`.
- **Using *empty base optimization***
   
  ``` cpp
  class Empty {};   // has no data so objects should use no memory
  class HoldsAnInt1 { private: int x; Empty e; }
   
  class HoldsAnInt2 : private Empty { private: int x; };
  ```
   
  `HoldsAnInt1` requires more memory than `HoldsAnInt2`. This is because C++ compilers almost
  always silently insert padding due to alignment requirements ([Item 50](effective_cpp#item-50-understand-when-it-makes-sense-to-replace-new-and-delete)).
  The STL, for example, utilizes *empty base optimization* to create `class`es with useful members
  (such as `typedef`s) that come free of charge to a clients memory.

**Things to Remember**

- `private` inheritance means *is-implemented-in-terms-of*. It's usually inferior to composition,
  but it makes sense when the derived class needs access to `protected` base class members or
  needs to redefine inherited `virtual` functions.
- Unlike *composition*, `private` inheritance can enable the *empty base optimization*. This can
  be important for library developers who strive to reduce object sizes.

### Item 40: Use multiple-inheritance judiciously

Multiple-inheritance opens up possibility for ambiguity.

``` cpp
class BorrowableItem {
public:
  void checkOut();
  ...
}

class ElectronicGadget {
private:
  bool checkOut() const;
  ...
};

class MP3Player :
  public BorrowableItem,
  public ElectronicGadget
{ ... };

MP3Player mp;
mp.checkOut();    // which one?
```

Since `ElectronicGadget::checkOut()` is `private`, the functionality is not two-faced. That doesn't mean its not
confusing, especially when code becomes more complex.

 ### Deadly multiple-inheritance diamond

``` cpp
class File { ... };
class InputFile : public File { ... };
class OutputFile : public File { ... };
class IOFile :
  public InputFile,
  public OutputFile
{ ... };
```

If `File` has a data member `fileName`, should `IOFile` contain one or two `fileName` members? By
default, inheritance will replicate data members. One way to remove this replication is to use
`virtual` inheritance. But, `virtual` inheritance is costly in both memory and execution time.
In general,

- Don't use `virtual` inheritance where possible.
- If `virtual` base `class`es are needed, avoid putting data into them.

``` cpp
// interface
class IPerson {
public:
  virtual ~IPerson();

  virtual std::string name() const = 0;
  virtual std::string birthDate() const = 0;
};

// factory function to instantiate concrete classes
std::tr1::shared_ptr<IPerson> makePerson(DatabaseID personIdentifier);

DatabaseID askUserForDatabaseID();

DatabaseID id(askUserForDatabaseID());
std::tr1::shared_ptr<IPerson> pp(makePerson(id));
...

// helper class
class PersonInfo {
public:
  explicit PersonInfo(DatabaseID pid);
  virtual ~PersonInfo();

  virtual const char * theName() const;
  virtual const char * theBirthDate() const;
  ...

private:
  virtual const char * valueDelimOpen() const;
  virtual const char * valueDelimClose() const;
  ...
};
```

``` cpp
// Fields are delimited with special strings. 
// By default, the opening and closing delimiters are square
// brackets e.g "\[ring-tailed lemur\]"

// helper class implementation
const char * PersonInfo::valueDelimOpen() const
{
  return "[";
}

const char * PersonInfo::valueDelimClose() const
{
  return "]";
}

const char * PersonInfo::theName() const
{
  static char value[Max_Formatted_Field_Value_Length];
  std::strcpy(value, valueDelimOpen());
  // append the name without overrunning the buffer
  std::strcat(value, valueDelimClose());
  return value;
};
...
```

Now the concrete `class` `CPerson` can make use of both `IPerson` and `PersonInfo` but their
relationships are different. `CPerson` *is-a* `IPerson` and *is-implemented-in-terms-of*
`PersonInfo`. To remove (redefine) those delimiters, simple composition is not strong enough, so `private`
inheritance makes a lot of sense.

``` cpp
Class CPerson : public IPerson, private PersonInfo {
public:
  explicit CPerson(DatabaseID pid) : PersonInfo(pid) {}
  virtual std::string name() const
  { return PersonInfo::theName(); }

  virtual std::string birthDate() const
  { return PersonInfo::theBirthDate(); }

  private:
    const char * valueDelimOpen() const { return ""; }
    const char * valueDelimClose() const { return ""; }
};
```

**Things to Remember**

- Multiple-inheritance is more complex than single inheritance. It can lead to new ambiguity
  issues and to the need for `virtual` inheritance.
- `virtual` inheritance imposes costs in size, speed, and complexity of initialization and
  assignment. It's most practical when `virtual` base `class`es have no data.
- Multiple-inheritance does have legitimate uses. One scenario involves combining `public`
  inheritance from an interface `class` with `private` inheritance from a `class` that helps with
  implementation.

## `template`s and Generic Programming

### Item 41: Understand implicit interfaces and compile-time polymorphism

``` cpp
class Widget {
public:
  Widget();
  virtual ~Widget();

  virtual std::size_t size() const;
  virtual void normalize();
  void swap(Widget& other);
  ...
};

void doProcessing(Widget& w)
{
  if (w.size() < 10 && w != someWidget) {
    Widget temp(w);
    temp.normalize();
    temp.swap(w);
  }
}
```

- `w` must support the *explicitly interface* `Widget`.
- `w` calls functions that use *runtime polymorphism*; the specific function call is
  determined at runtime based on `w`s *dynamic type* ([Item
  37](effective_cpp#item-37-never-redefine-a-functions-inherited-default-parameter-value)).

``` cpp
template<typename T>
void doProcessing(T* w)
{
  if (w.size() < 10 && w != someWidget) {
    T temp(w);
    temp.normalize();
    temp.swap(w);
  }
}
```

- `w`s type must support `size`, `normalize` and `swap` as well as copy construction and
  comparison as part of an *implicit interface*.
- calls to functions involving `w` such as `operator>` and `operator!=` use *compile-time
  polymorphism*: the specific function call involves instantiating `template`s with different
  `template` parameters which can lead to different functions being called, all during
  compilation.

**Things to Remember**

- Both `class`es and `template`s support interfaces and polymorphism.
- For `class`es, interfaces are explicit and centered on function signatures. Polymorphism occurs
  at runtime through `virtual` functions.
- For `template` parameters, interfaces are implicit and based on valid expressions. Polymorphism
  occurs during compile through `template` instantiation and function overloading resolution.

### Item 42: Understand the two meanings of `typename`

#### `typename == class`

``` cpp
template<class T> class Widget;
template<typename T> class Widget;
```

`typename` and `class` mean exactly the same thing to the C++ compiler.

#### `typename` identifies *nested dependent type names*

``` cpp
template<typename C>
void print2nd(const C& container)
{
  if (container.size() >= 2) {
    C::const_iterator iter(container.begin());
    ++iter;
    int value = *iter;
    std::cout << value;
  }
}
```

|                                |                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Dependent name**             | Names in a `template` that are dependent on a `template` parameter such as `C::const_iterator`. |
| **Nested dependent name**      | *Dependent names* that are also nested inside of a `class` such as `C::const_iterator`.         |
| **Nested dependent type name** | *Nested dependent names* that also refer to a type such as `C::const_iterator`.                 |
| **Non-dependent name**         | Names that do not depend on any type parameter such as `int`.                                   |

``` cpp
template<typename C>
void print2nd(const C& container)
{
  C::const_iterator * x;
  ...
}
```

- Though it looks like `x` is being declared as a pointer to `C::const_iterator`, if
  `C::const_iterator` was a `static` data member and `x` happened to be the name of a global
  variable, then the code could mean multiply `C::const_iterator` by `x`.
- To resolve the ambiguity, when C++ encounters a *nested dependent name*, it assumes it's not a
  type, unless told otherwise.

Looking back, this code is not valid because C++ is not told that `C::const_iterator` is a type.

``` cpp
template<typename C>
void print2nd(const C& container)
{
  typename C::const_iterator iter(container.begin());
  ...
}
```

> Preceding a name with `typename` is required for the sole purpose of identifying *nested dependent
> type names*.

There's one small exception to this rule. `typename` should not precede *nested dependent type
names* if they are in a list of base `class`es or as a base `class` identifier in a *member
initialization list*.

``` cpp
template<typename T>
class Derived : public Base<T>::Nested {  // base class list, typename not allowed
public:
  // base class identifier in a member initialization list, typename not allowed
  explicit Derived(int x) : Base<T>::Nested(x)
  {
    // nested dependent type, typename is required
    typename Base<T>::Nested temp;
    ...
  }
};
```

> Working with `typename`s can get really tiring to type; make use of `typedef`.

``` cpp
template<typename IterT>
void workWithIterator(IterT iter)
{
  typedef typename std::iterator_traits<IterT>::value_type value_type;
  value_type temp(*iter)
  ...
}
```

### Item 43: Know how to access names in `template`-ized base `class`es

``` cpp
class CompanyA {
public:
  ...
  void sendClearText(const std::string& msg);
  void sendEncrypted(const std::string& msg);
  ...
};

class CompanyB {
public:
  ...
  void sendClearText(const std::string& msg);
  void sendEncrypted(const std::string& msg);
  ...
};
...

class MsgInfo { ... };

template<typename Company>
class MsgSender {
public:
  ...

  void sendClear(const MsgInfo& info)
  {
    std::string msg;
    // create msg from info

    Company c;
    c.sendClearText(msg);
  }

  void sendSecret(const MsgInfo& info)
  { ... }
};

template<typename Company>
 class LoggingMsgSender: public MsgSender<Company> {
 public:
  ...
  // if Company == CompanyZ,  this function doesn't exist!
  void sendClearMsg(const MsgInfo& info)
  {
    // write "before sending" info to log
    sendClear(info);
    // write "after sending" info to log
  }
  ...
 };
 ```

This code is good design, but it probably won't compile because it can't create `LoggingMsgSender`
without knowing what `MsgSender<Company>` looks like. For example, `CompanyZ` might never care to
send clear messages.

``` cpp
class CompanyZ {
public:
  ...
  void sendEncrypted(const std::string& msg);
  ...
};
```

The problem can be solved by creating a specialized `MsgSender` just for `CompanyZ`. This is called
*total template specialization*.

``` cpp
template<>
class MsgSender<CompanyZ> {
public:
  ...
  void sendSecret(const MsgInfo& info)
  { ... }
};

// choice #1
template<typename Company>
class LoggingMsgSender: public MsgSender<Company> {
public:
  ...
  void sendClearMsg(const MsgInfo& info)
  {
    // write "before sending" info to log
    this->sendClear(info);  // ok, assumes that sendClear will be inherited
    // write "after sending" info to log
  }
  ...
};

// choice #2
template<typename Company>
class LoggingMsgSender: public MsgSender<Company> {
public:
  using MsgSender<Company>::sendClear; // ok, assumes that sendClear is in base class
  ...
  void sendClearMsg(const MsgInfo& info)
  {
    // write "before sending" info to log
    sendClear(info);
    // write "after sending" info to log
  }
  ...
};

// choice #3
template<typename Company>
class LoggingMsgSender: public MsgSender<Company> {
public:
  ...
  void sendClearMsg(const MsgInfo& info)
  {
    // write "before sending" info to log
    MsgSender<Company>::sendClear(info); // ok, assumes that sendClear will be inherited
    // write "after sending" info to log
  }
  ...
};
```

> Each of these choices promise to the compiler that later specializations of the base `class`
> `template` will support the interface offered by the general template. If the client code doesn't
> deliver this promise, it won't compile.

``` cpp
LoggingMsgSender<CompanyZ> zMsgSender;
MsgInfo msgData;
zMsgSender.sendClearMsg(msgData); // error, sendClearMsg isn't defined in CompanyZ
```

**Things to Remember**

- In derived `class` `template`s, refer to names in base class `template`s via a `this->` prefix,
  via `using` declarations, or via an explicit base `class` qualification.

### Item 44: Factor parameter-independent code out of the `template`s

``` cpp
template<typename T,    // template for n x n matrices of
         std::size_t n> // objects of type T; see below for info
class SquareMatrix {    // on the size_t parameter
public:
  ...
  void invert();        // invert the matrix in place
};
```

The parameter of type `size_t`, is called a *non-type parameter*. 
``` cpp
SquareMatrix<double, 5> sm1;
...
sm1.invert();
SquareMatrix<double, 10> sm2;
...
sm2.invert();
```

Two copies of `invert` are instantiated. To remove the bloat, `invert` could take a size parameter.

``` cpp
template<typename T>
class SquareMatrixBase {
protected:
  ...
  void invert(std::size_t matrixSize);
  ...
};

template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
private:
  using SquareMatrixBase<T>::invert;

public:
  ...
  void invert() { this->invert(n) }
};
```

All matrices holding a given type of object will share a single `SquareMatrixBase` class. `invert` is templatized
only on the type of objects in the matrix. 

We have yet to address the data that `SquareMatrixBase::invert` operates on. One solution is to add it to the base
`class`.

``` cpp
template<typename T>
class SquareMatrixBase {
protected:
  SquareMatrixBase(std::size_t n, T *pMem)
  : size(n), pData(pMem) {}

  void setDataPtr(T *ptr) { pData = ptr; }
  ...

private:
  std::size_t size;
  T *pData;
};
```

The derived `class`es can then decide how to allocate memory.

``` cpp
// stack implementation
template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
public:
  SquareMatrix();
  : SquareMatrixBase<T>(n, data) {}
  ...

private:
  T data[n*n];
};

// heap implementation
template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
public:
  SquareMatrix();
  : SquareMatrixBase<T>(n, 0),
     pData(new T[n*n])
  { this->setDataPtr(pData.get()); }
  ...

private:
  boost::scoped_array<T> pData;
};
```

Many if not all `SquareMatrix`'s member functions can be simple `inline` (implicit) calls to
base `class` versions holding the same type of data regardless of size. At the same time, matrices of
different sizes have distinct types so there's no chance of passing a matrix of the wrong size off
to a function.

As far as speed is concerned, the generic size of the matrix is no longer eligible for any compiler
optimizations but the smaller executable size will improve locality on the cache.

In this case, the non-`template` parameter is the source of bloat, but `template` parameters can also cause
bloat as well.

**Things to Remember**

- `template`s generate many `class`es and functions, so any `template` code not
  dependent on a `template` parameter causes bloat.
- Bloat due to non-type `template` parameters can often be eliminated by replacing `template`
  parameters with function parameters or `class` data members.
- Bloat due to type parameters can be reduced by sharing implementations for instantiation types
  with equal binary representations.

### Item 45: Use member function `template`s to accept "all compatible types"

``` cpp
class Top { ... };
class Middle : public Top { ... };
class Bottom : public Middle { ... };
Top *pt1 = new Middle;
Top *pt2 = new Bottom;
const Top *pct2 = pt1;
```

Pointers effortlessly do implicit conversions. Getting smart pointers to offer the same behavior is quite a bit
trickier; it could take a potentially unlimited number of copy constructors. Fortunately, `template`s can be used to
make *generalized copy constructors*

``` cpp
template<typename T>
class SmartPtr {
public:
  template<typename U>
  SmartPtr(const SmartPtr<U>& other);
  ...
};
```

This `template` is not safe. For example, it shouldn't be possible to convert a base `class`
pointer to a derived `class` pointer. Instead, use the fact that `auto_ptr` and `tr1::shared_ptr`
offer a `get` member function that `return`s a copy of the built-in pointer held by the smart pointer
object.

``` cpp
template<typename T>
class SmartPtr {
public:
  template<typename U>
  SmartPtr(const SmartPtr<U>& other)
  : heldPtr(other.get()) { ... }

  T* get() const { return heldPtr: }
  ...

private:
  T *heldPtr;
};
```

Use of this `template` will only compile if the implicit conversion was supported by the original
built-in pointer. This same concept can be extended to support assignment as well, as long as the
types are compatible.

> Remembering [Item 5](effective_cpp#item-5-know-what-functions-c-silently-writes-and-calls), compilers give
> `class`es four member functions for free; non of them are `template` member functions. To have full
> control over copy construction, you need to declare the *normal* copy constructor as well. Otherwise, the compiler
> will declare the non-`template` version for you. Same goes for assignment.

**Things to Remember**

- Use member function `template`s to generate functions that accept all compatible types.
- If you declare member `template`s for generalized copy construction or generalized assignment,
  you'll still need to declare the normal copy constructor and copy assignment operator, too.

### Item 46: Define non-member functions inside `template`s when type conversions are desired

Be sure to read up on [Item
24](effective_cpp#item-24-declare-non-member-functions-when-type-conversions-should-apply-to-all-parameters) before
continuing. This item talks about the `template` version.

``` cpp
template<typename T>
class Rational {
public:
  Rational(const T& numerator = 0, const T& denominator = 1);
  const T numerator() const;
  const T denominator() const;
  ...
};

template<typename T>
const Rational<T> operator*(const Rational<T>& lhs,
                            const Rational<T>& rhs)
{ ... }

Rational<int> oneHalf(1, 2);
Rational<int> result = oneHalf * 2; // error, wont compile
```

The problem is the compiler can't figure out what `T` is for `operator*`. Is it `Rational<int>` or
is it `int`? One might expect the non-`explicit` constructor to convert `int` into `Rational<int>`,
but, the compiler will *never* consider implicit type conversion functions during `template`
argument deduction.

It's possible to make use of the fact that `class` `template`s do not depend on `template` argument
deduction. To do so, declare `operator*` as a `friend`.

``` cpp
template<typename T>
class Rational {
public:
  ...
  friend const operator*(const Rational& lhs,
                         const Rational& rhs)
  {
    return Rational(lhs.numerator() * rhs.numerator(),
                    lhs.denominator() * ths.denominator());
  }
};

template<typename T>
const Rational<T> operator*(const Rational<T>& lhs,
                            const Rational<T>& rhs)
{ ... }
```

> It's not enough to simply declare the `friend` function, it also needs to be defined.

> Though maybe not for this example, it can be useful to have the `friend` function call a helper
> function instead since the `friend` function is implicitly declared `inline` (see [Item
> 30](effective_cpp#item-30-understand-the-ins-and-outs-of-inlineing)).

**Things to Remember**

- When writing a `class` `template` that offers functions related to the `template` that support
  implicit conversions on all parameters, define those functions as `friend`s inside the `class`
  `template`.

### Item 47: Use traits `class`es for information about types

*Traits* classes allow information to be obtained about a type during compilation. This can be
useful when implementing different strategies for a `template` function based on the type of object.

Designing a *traits* `class` is as simple as:

1. Find some information about types to make available.
1. Choose a name to show that information.
1. Provide a `template` and set of specializations that contain the information for the types to
  support.

For example, let's design a utility function, `advance`, which allows an `iterator` to move
a distance forward or backward. `advance` would need to have behavior that is specific to the
`iterator_traits`.

``` cpp
template<typedef IterT>
struct iterator_traits {
  typedef typename IterT::iterator_category iterator_category;
}

// support pointers as random access iterators
template<typename IterT>
struct iterator_traits<IterT*>
{
  typedef random_access_iterator_tag iterator_category;
  ...
}

template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d)
{
  if (typeid(typename std::iterator_traits<IterT>::iterator_category) ==
    typeid(std::random_access_iterator_tag))
  ...
}
```

Ignoring the compilation problems ([Item 48](effective_cpp#item-48-be-aware-of-template-metaprogramming)), notice
that the `if` statement is evaluated at runtime. It would be better if it were evaluated at compile time with function overloading.

``` cpp
template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::random_access_iterator_tag)
{
  iter +=d;
}

template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::bidirectional_iterator_tag)
{
  if (d >= 0) { while (d--) ++iter; }
  else { while (d++) --iter; }
}

template<typename IterT, typename DistT>
void doAdvance(IterT& iter, DistT d, std::input_iterator_tag)
{
  if (d < 0 ) {
    throw std::out_of_range("Negative distance");
  }
  while (d--) ++iter;
}

template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d)
{
  doAdvance(iter, d, typename std::iterator_traits<IterT>::iterator_category());
}
```

To make a traits `class`:

- Create a set of overloaded "worker" functions or function `template`s (like `doAdvance`) that
  differ in traits parameter. Implement each function in accord with the traits information
  passed.
- Create a "master" function or function `template` (like `advance`) that calls the workers,
  passing information provided by the traits`class`.

**Things to Remember**

- Traits `class`es make information about types available during compilation. They're implemented
  using `template`s and `template` specializations.
- In conjunction to overloading, traits `class`es make it possible to do compile-time
  `if...else` tests on types.

### Item 48: Be aware of `template` metaprogramming

Continuing from [Item 47](effective_cpp#item-47-use-traits-classes-for-information-about-types), *Template
metaprogramming* is the process of writing `template` based C++ programs that execute during compilation.

``` cpp
template<typename IterT, typename DistT>
void advance(IterT& iter, DistT d)
{
  if (typeid(typename std::iterator_traits<IterT>::iterator_category) ==
      typeid(std::random_access_iterator_tag)) {
    iter += d;
  }
  else {
    if (d >= 0) { while (d--) ++iter; }
    else { while (d++) --iter; }
  }
}

std::list<int>::iterator iter;
...
advance(iter, 10); // wont compile
```

Because `std::list<>::iterator::iterator_category` is not a `std::random_access_iterator_tag`, one
could expect this to compile and just do nothing with the above implementation. Yet, the
compiler will still check to see if the above code is valid. The problem is `std::list<>::iterator`
doesn't support `+=`.

**Things to Remember**

- `template` metaprogramming can shift work from runtime to compile-time, thus enabling earlier
  error detection and higher runtime performance.
- `template` metaprogramming can be used to generate code based on combinations of policy choices,
  and it can be used avoid generating code inappropriate for particular types.

## Customizing `new` and `delete` 

### Item 49: Understand the behavior of the `new_handler`

When `operator new` cannot complete a memory allocation request, it `throw`s an `exception`. Before
it `throw`s the `exception`, it calls a client specifiable error-handling function called
`new_handler`. To set the function, clients call `set_new_handler` declared in `<new>`.

A well designed `new_handler` can do the following:

- Make more memory available.
- Install a different `new_handler`.
- Uninstall the `new_handler`.
- `throw` an `exception`.
- Not `return` (`abort`, `exit`).

To use a specific `new_handler` for a `class`, have that `class` provide its own versions of
`set_new_handler` and `operator new`.

#### `nothrow`

Since 1993, `operator new` will `throw` a `bad_alloc` `exception` if it can't allocate the requested
memory. Instead, the traditional failure-yields-`null` is still there in the form of `nothrow`.

``` cpp
class Widget { ... };
Widget *pw1 = new Widget;

if (pw1 == 0) { ... } // test is guaranteed to fail

Widget *pw2 = new(std::nothrow) Widget;

// test succeeds if allocation fails.
// However, it does not guarantee the
// statement as a whole won't throw.
if (pw2 == 0) { ... }
``` 

``` cpp
class Widget {
public:
    static std::new_handler set_new_handler(std::new_handler p) throw();
    static void * operator new(std::size_t size) throw(std::bad_alloc);
private:
    static std::new_handler currentHandler;
};

std::new_handler Widget::currentHandler = 0;

std::new_handler Widget::set_new_handler(std::new_handler p) throw()
{
    std::new_handler oldHandler = currentHandler;
    currentHandler = p;
    return oldHandler;
}

// resource handling class
class NewHandlerHolder {
public:
    explicit NewHandlerHolder(std::new_handler nh)
    : handler(nh) {}

    ~NewHandlerHolder()
    { std::set_new_handler(handler); }

private:
    std::new_handler handler;
    // prevent copying
    NewHandlerHolder( const NewHandlerHolder&);
    NewHandlerHolder& operator=(const NewHandlerHolder&);
};

// overload new to use new handler
void * Widget::operator new(std::size_t size) throw(std::bad_alloc)
{
    NewHandlerHolder h(std::set_new_handler(currentHandler));
    return ::operator new(size);
}
```

This code should be implemented in more than just a single `class`. One way is to turn the base `class` into a
`template`.

``` cpp
template<typename T>
class NewHandlerSupport {
public:
    static std::new_handler set_new_handler(std::new_handler p) throw();
    static void * operator new(std::size_t size) throw(std::bad_alloc);
    ...
private:
    static std::new_handler currentHandler;
};

template<typename T>
std::new_handler NewHandlerSupport<T>::set_new_handler(std::new_handler p) throw()
{
    std::new_handler oldHandler = currentHandler;
    currentHandler = p;
    return oldHandler;
}

template<typename T>
void* NewHandlerSupport<T>::operator new(std::size_t size) throw(std::bad_alloc)
{
    NewHandlerHolder h(std::set_new_handler(currentHandler));
    return ::operator new(size);
}

template<typename T>
std::new_handler NewHandlerSupport<T>::currentHandler = 0;

class Widget : public NewHandlerSupport<Widget> {
    // same as before but without declarations for set_new_handler or operator new
}
```

Though it might be worrisome to see `Widget` inherit a `template`-ized base `class` that doesn't
even use its `template` parameter `T`, this is actually a really common strategy called the *Curiously
Reoccurring Template Pattern*.

**Things to Remember**

- `set_new_handler` allows you to specify a function to be called when memory allocation requests
cannot be satisfied.
- `nothrow new` is of limited utility, because it applies only to memory allocation; later
constructor calls may still `throw` `exception`s.

### Item 50: Understand when it makes sense to replace `new` and `delete`

Replacing `new` and `delete` can be used to:

- Detect usage errors.
- Collect usage stats.
- Increase the speed of allocation and dealocation.
- Reduce the space overhead of default memory management.
- Compensate for sub-optimal alignment in the default allocator.
- Cluster related objects near one another.
- Add unconventional behavior.

For example, the code below facilitates the detection of underruns and overruns.

``` cpp
static const int signature = 0xDEADBEEF;

typedef unsigned char Byte;

void* operator new(std::size_t size) throw(std::bad_alloc)
{
  using namespace std;

  size_t realSize = size + 2 * sizeof(int);

  void *pMem = malloc(realSize);
  if (!pMem) throw bad_alloc();

  *(static_cast<int>(pMem) = signature;
  *(reinterpret_cast<int*>(static_cast<Byte*>(pMem)+realSize-sizeof(int))) = signature;

  return static_cast<Byte*>(pMem) + sizeof(int);
}
```

Though this fails to adhere to [Item 51](effective_cpp#item-51-adhere-to-convention-when-writing-new-and-delete), the
focus here will be *alignment*. Architectures may need, or prefer, types to occur at addresses of some multiple
(such as pointers at a multiple of four). The last line of code `return`s a pointer that, after being curated to a
specific address by `malloc`, is offset by `sizeof(int)`. This can be quite dangerous.

> Open source memory managers are available under many platforms from libraries such as `boost`.

**Things to Remember**

- There's many valid reasons for writing custom versions of `new` and `delete`, including
  improving performance, debugging heap usage errors, and collecting heap usage information.

### Item 51: Adhere to convention when writing `new` and `delete`

When writing a `operator new`:

- Be able to handle the cases where the memory request is 0 bytes by treating it like a 1 byte
  request.
- `operator new` should call `new_handler` if it can't complete the memory request.
- `operator new` should be an infinite loop. Attempts to allocate memory should only stop when
  `new_handler` says so by `throw`ing an `exception` of, or derived from `std::bad_alloc`.
- Keep in mind that inheritance can increase the size of the memory allocation. Add handling for
  when the allocation size is not what is expected.

When writing `operator delete`:

- `return` if `null` is passed in.
- Like `operator new`, be able to handle wrongly sized `delete` requests.

**Things to Remember**

- `operator new` should contain an infinite loop trying to allocate memory, should call the
  `new_handler` if it can't complete a memory request, and should handle requests for zero bytes.
  `class`-specific versions should handle requests for larger blocks than expected.
- `operator delete` should do nothing if passed a pointer that is `null`. `class`-specific
  versions should handle blocks that are larger than expected.

### Item 52: Write placement `delete` if you write placement `new`

``` cpp
Widget *pw = new Widget;
```

Two functions are called, one to `operator new` and one to the default constructor. Suppose
`operator new` was successful and the default constructor `threw` an `exception`. The C++ runtime
system is now responsible for calling `operator delete`. This is not a problem unless it's a
*placement* version: a custom `operator new` or `operator delete` that takes extra parameters.
The key is to make sure that `operator delete` takes the *same number and types of extra arguments*
as `operator new`.

> Failure to write a corresponding *placement* `operator delete` will cause subtle memory leaks.
> 
> ``` cpp
> delete pw; // never calls the placement delete
> ```

When writing a *placement* `operator delete`, be sure not to hide away the default `operator delete`.

``` cpp
class StandardNewDeleteForms {
public:
  // normal new/delete
  static void* operator new(std::size_t size) throw(std::bad_alloc)
  { return ::operator new(size); }
  static void operator delete(void *pMemory) throw()
  { return ::operator delete(pMemory); }

  // placement new/delete
  static void* operator new(std::size_t size, void *ptr) throw()
  { return ::operator new(size, prt); }
  static void operator delete(void *pMemory, void *ptr) throw()
  { return ::operator delete(pMemory, ptr); }

  // nothrow new/delete
  static void* operator new(std::size_t size, const std::nothrow_t& nt) throw()
  { return ::operator new(size, nt); }
  static void operator delete(void *pMemory, const std::nothrow_t&) throw()
  { return ::operator delete(pMemory); }
};

class Widget : public StandardNewDeleteForms {
public:
  using StandardNewDeleteForms::operator new;
  using StandardNewDeleteForms::operator delete;

  // custom placement new
  static void* operator new(std::size_t size,
                            std::ostream& logStream) throw(std::bad_alloc);
  // corresponding placement delete
  static void operator delete(void *pMemory,
                              std::ostream& logStream) throw();
  ...

};
```

**Things to Remember**

- When you write a placement version of `operator new`, be sure to write the corresponding
  placement version of `operator delete`. If you don't, your program may experience subtle,
  intermittent memory leaks.
- When you declare placement versions of `new` and `delete`, be sure not to unintentionally hide
  the normal versions of those functions.

## Miscellany

### Item 53: Pay attention to compiler warnings

**Things to Remember**

- Take compiler warnings seriously, and strive to compile warning-free at the greatest warning
  level supported by your compilers.
- Don't become dependent on compiler warnings, because different compilers warn about different
  things. Porting to a new compiler may remove warning messages you've come to rely on.

### Item 54: Familiarize yourself with the standard library, including TR1

#### Standard Library

- *Standard Template Library(STL)*
  - containers - `vector`, `string`, `map`
  - iterators
  - algorithms - `find`, `sort`, `transform`
  - function objects - `less`, `greater`
  - container and function object adapters - `stack`, `priority_queue`, `mem_func`, `not1`
- *Iostreams*
  - user-defined buffering
  - internationalized IO
  - `cin`, `cout`, `cerr` and `clog`
- *Support for internationalization*
  - many locales
  - Unicode - `wchar_t`, `wstring`
- *Support for numeric processing* - `complex`, `valarray`
- *An exception hierarchy* - `exception`, `logic_error`, `runtime_error`
- *C89's standard library*

#### TR1 - Discrete standalone functionality

- *Smart pointers*: `shared_pointer`, `weak_ptr`
- `function`
- `bind`
- *Hash tables*:
  - `set`, `multiset`, `map`, `multimap`
  - `unordered_set`, `unordered_multiset`, `unordered_map`, `unordered_multimap`
- *Regualar expressions*
- *Tuples*
- `array`
- `mem_fn`
- `reference_wrapper`
- *Random number generator*
- *Mathematical special functions*
  - Laguerre polynomials
  - Bessel functions
  - complete elliptic integrals
- *C99 compatibility extensions*

#### TR1 - `template` programming

- *Type traits*: is `T` a
  - Built-in type
  - `virtual` destructor
  - empty class
  - implicitly convertible to `U`
- `result_of` - deduce the `return` types of `return` calls.

> TR1 is only a document specifying code that will eventually be bundled with compilers. To take
> advantage of implementations, either wait or get a library that supports them like Boost ([Item
> 55](effective_cpp#item-55-familiarize-yourself-with-boost)).

**Things to Remember**

- The primary standard C++ library functionality consists of STL, iostreams, locales. The C99
  standard library is also included.
- TR1 adds support for smart pointers, generalized function pointers, hash-based containers,
  regular expressions and 10 other components.
- TR1 itself is only a specification. To take advantage of TR1, you need an implementation. One
  source of TR2 components is Boost.

### Item 55: Familiarize yourself with Boost

Here are some things Boost offers:

- *Conversion* - safer or more convenient cast operators
  - `numeric_cast` - `throw`s an `exception` if converting a numeric value leads to overflow or
    underflow.
  - `lexical_cast` - makes it possible to cast any type supporting `operator<<` into a string.
- *Boost Graph Library*
- *Boost MPL Library* - metaprogramming
- *String and text processing*
  - type-safe-`printf`-like formatting
  - regular expressions
  - tokenizing and parsing
- *Containers*
  - fixed-size arrays
  - variable-sized bitsets
  - multidimensional arrays
- *Function objects and higher-order programming*
  - Lambda library
- *Generic programming* - including extensive traits `class`es
- *Template metaprogramming*
  - compile-time `assert`ions
  - compile-time typelists
- *Math and numerics*
  - rational numbers
  - octonions and quarternions
  - greatest common divisor and least common multiple
  - random numbers
- *Correctness and testing*
  - implicit `template` interface ([Item 41](effective_cpp#item-41-understand-implicit-interfaces-and-compile-time-polymorphism)) support
  - test-first programming
- *Data structures*
  - type-safe unions
  - tuples
- *Inter-language support*
  - C++ <-> Python
- *Memory*
  - Pool library
  - smart pointers
- *Miscellaneous*
  - CRC checking
  - date and time
  - traversing file systems

**Things to Remember**

- Boost is a community and web site for development of free, open source, peer-reviewed C++
  libraries. Boost plays an influential role in C++ standardization.
- Boost offers implementations of many TR1 components, but also offers many other libraries as
  well.
