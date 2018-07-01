# The Tao of Microservices

*2018 Richard Rodger*

Read the book [here](https://www.manning.com/books/the-tao-of-microservices).

##  Chapter 1: Brave new World

Software development is an art. It isn't predictable enough to be engineering. It isn't rigorous enough to be science.
Unlike art, software has to work.

### The technical debt crisis

|                    |                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Business Logic** | Logic that is directly specific to the business goal at hand. It's the representation of your business using the structures of your programming language. The term is suggestive, not prescriptive. |
| **Composition**    | Making big things out of small things in an additive process.                                                                                                                                       |

### Case study: A microblogging startup

#### Iteration 0: Posting entries

|                            |                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Minimum Viable Product** | Build the minimum set of features that lets you validate your assumptions about a market, and then iterate on those features and assumptions until the product fits the market. |

Suppose a microblogging site has decided to make a system that lets users post *entries* or short pieces of text. The
*minimum viable product* includes the following *activities* and associated *messages*

* **Posting an entry**
  - `post:entry`
  - `info:entry`
* **Listing earlier entries**
  - `store:list,kind:entry`
  - `store:load,kind:entry`
  - `store:save,kind:entry`
  - `store:remove,kind:entry`

> Instead of getting lost in implementation, focus on the messages first and think about interaction.

Once the messages have been fleshed out, they are grouped into sensible *services*. One such implementation is
provided in the diagram below.

![](https://drive.google.com/uc?id=15or1k9CkpwEJadWjr9yW_T7tdN-CdLbT)

#### Iteration 1: A search index

To add a new activity, like a search index, to the system, describe the activity with messages.

- **Search through entries**
  - `search:insert`
  - `search:query`

The search activity is added into the system as the `index` service:

![](https://drive.google.com/uc?id=1hrqvRUuu3rq3zI8_BQtXyINW7FmVPtk0)

> Notice the choice in implementation. `post` could have easily sent `search:insert` to `index`. Yet,
> doing so would couple `post` to `index`. Additionally, the decision for `index` to convert `info:entry` into
> `search:insert` messages can be dynamic to support loose coupling.

`index` can be added without any added changes to the system. Since an earlier version of `front` is already in
production, the principle of *additivity* can be applied. Deploy the new version of the `front` service alongside the
older version. Since both versions offer the same legacy functionality, nothing breaks. Both versions can be used
according to taste as the old version is gradually swapped out.

#### Iteration 2: Simple composition

While monitoring the system, `entry-store` exhibits high latency while talking to the database. One possible
solution is to make a cache in a new service: `entry-cache`.

The service captures messages intended for `entry-store`. One such way to capture messages is to add an extra
property such as `cache:true` to `store:*` messages. `entry-cache` will take the place of `entry-store` and
`entry-store` will act as a fallback only listening to messages with the added property `cache:true`.

`entry-cache` is trivial to introduce into the system but `entry-store` is a bit more complicated and will involve a
transition phase. Using the process of *additivity* introduce the new version of `entry-cache` but with a runtime
configuration that accepts both `store:*` and `store:*,cache:true` messages. A load-balancing solution routes some
messages straight to `entry-store` while others go through `entry-cache` first. Once the new functionality proves
itself, change the runtime configuration of `entry-store` to only accept `store:*,cache:true` messages.

![](https://drive.google.com/uc?id=1wr5tkpeh8kZFCrSp_nuE37hAC_-dY5pX)

#### Iteration 3: Timelines

Another core activity inside a microblogging framework is the ability for users to follow other users. Following the
pattern, the first step is to come up with a set of messages representative of the activity.

- **Follow user**
  - `follow:user`
  - `follow:list,kind:followers|following`
  - `timeline:insert`
  - `timeline:list`

The naming of the messages suggest two new services, `follow` and `timeline`.

> New functionality begets new services. Avoid technical debt by moving complexity into the message-routing
> configuration and out of the conditional code and intricate data structures.

Like the `index` service, the new microservices react to `info:entry` with an orchestration of
`follow:list,kind:followers` and `timeline:insert` messages. Instead of making complex routing and workflow rules, it's
perfectly reasonable to make a service, `fanout` with the sole purpose of performing this orchestration.

![](https://drive.google.com/uc?id=1N6ibwy6TL07WREyFm3WlvUgdD_HR_j0d)

#### Iteration 4: Scaling

The microservices are scaling fine, but the underlying database of `timeline` cannot handle the data volume. Let's
split it up.

One such technique, called *sharding*, assigns each item to a separate database based on key values in the data.
Though sharding can work at the database level, the microservice level is a good choice because it maintains
flexibility. The new `timeline:*` messages have an added `shard` property.

Adding the sharding `timeline` microservice uses the principle of *additivity*, just like Iteration 1. The
transition will take longer due to batch-transferring the old database into new database shards.

With that, this case study comes to a close with the final system diagram below:

![](https://drive.google.com/uc?id=1mswOZtkR94i8atf_9TRcKL1i78a7B2Rr)

### How the monolith betrays the promise of components

|              |                                                                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monolith** | Large, object-oriented, body of code that executes in a single process. A *monolith* is long-lived, undergoes constant modification and is essential to the health of the business. |

Components in a *monolith*:

- **Have lost encapsulation**: Boundaries between components are weak. Once breached, internals leak into other
  components.
- **Don't deliver on reusability**: After a loss of encapsulation, components become difficult to extract and reuse
  again.
- **Don't have well-defined interfaces**: Although strict, there's too many different ways to interact with an
  object.
- **Don't compose**: Baring special cases like inheritance and mixins, combining two objects does not create enhanced
  functionality.

In particular, *composition* is critical because it helps:

- **Manage complexity**: Elements of a *composition* are well encapsulated and protected.
- **Remove shared state**: Components communicate with each other using a stateless model.
- **Promote additivity**: Adding functionality does not involve modifying existing components. Instead, new components
  are added.

### The microservice idea

Microservices are characterized by the following axioms:

- **Small**: Components avoid accumulation of technical debt.
- **Distributed**: Components are not constrained to a single process or machine.
- **No privilege**: No components are privileged.
- **Uniform communication**: All components communicate homogeneously.
- **Composition**: Components can be composed of other components.

#### The core technical principles

|                            |                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Transport independence** | The ability to move messages from one microservice to another without requiring microservices to know about each other or the underlying message sending infrastructure. |
| **Pattern matching**       | The ability to route messages based on the data inside the message.                                                                                                      |
| **Additivity**             | The ability to change a system by adding new parts.                                                                                                                      |

### Practical implementations

#### Specification

Given a list of informal business requirements, decide the behaviors of the system and map the behaviors to messages.

> Move from general to specific. Focus on simple problems that offer high value first. 

#### Deployment

Deployment of microservices is a complex process; some automation will be necessary.

#### Security

External entry points to the system shouldn't be presented in the same way as internally generated messages. Requests
from external clients should not be directly translated into messages.

## Chapter 2: Services

### Microservice architectures

|                                           |                                                                                                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The mini web servers architecture**     | Microservices are web servers that offer small REST interfaces. Messages are synchronous HTTP requests and responses. Message content is JSON, XML, etc. Microservices communicate point-to-point or to a load-balancer.           |
| **The asynchronous message architecture** | Microservices publish messages to one or more message queues and listening microservices retrieve them. Gathering responses is asynchronous. If a response is not produced in time, the application moves on without that content. |

### Monolithic projects vs. microservice projects

#### Monolithic projects

- All members of the software development team must carefully coordinate so they don't block each other. There's only
  one code base.
- Developers have too many ways to create dependencies and gather technical debt rapidly.
- Deployment is all or nothing. Mitigating risk with techniques such as *blue-green* deployment costs infrastructure.

#### Microservice projects

- Development of a microservice can, and should be completed by one person in one iteration.
- The small size of a microservices increases estimation accuracy.
- The small size of a microservice makes it easier to dispose of without large impact on the company.
- Important microservices can be prioritized over less important microservices.
- It's easy to separate *business logic* from infrastructure.

### Case Study: The digital edition of a newspaper

#### Informal requirements

- Content consists of articles, each of which has its own separate page.
- Some pages are special article-listing pages, such as the front page, and special-interest sections.
- The website, tablet, and app versions should all use a common REST API, provided by the server side of the system.
- The website should deliver static versions of primary content for search engines to index, but it can load secondary
  content dynamically.
- The system has a concept of *users* that includes both readers and authors, with permissions for different levels
  of access.
- Content on pages need to target the current user by matching the content of the user's profile using business
  rules or optimization algorithms.
- The site is under continuous development because online newspapers are in fierce competition. New features need
  to be added quickly. These features include special short-term mini apps, such as special interactive content for
  elections.

#### Functional breakdown

- Handle article data and have the expected read, write, and query operations.
- Construct content pages and a cache for scaling.
- Handle user accounts: login, logout, profiles, and so on.
- Deliver targeted content and map user identities to articles.

#### Requirements to messages to services

Start by describing requirements with messages. The table below provides a mapping of requirements to messages:

| Requirement                | Messages                                                 |
| -------------------------- | -------------------------------------------------------- |
| Article pages              | `build-article, get-article, article-view`               |
| Article list pages         | `build-article-list, list article`                       |
| REST API                   | `get-article, add-article, remove-article, list-article` |
| Static and dynamic content | `article-need, article-collect`                          |
| User management            | `login, logout, register, get-profile`                   |
| Content targeting          | `visitor-need, visitor-collect`                          |
| Special-purpose mini apps  | App-specific                                             |

> Though not necessary here, in large systems, some activities will inevitably share messages. Shared messages should
> be namespaced.

Messages are then organized into services. A diagram of the system is provided below:

![](https://drive.google.com/uc?id=1jr4UgsCG5uRFuXsGbFhVUA0iamFPpYyW)

### Microservices are software components

Microservices make excellent software components because they are:

- **Encapsulated**: Microservices are individual processes which do not share internals by nature.
- **Reusable**: Microservices are network services that can be called by anyone.
- **Well-defined interfaces**: Microservice messages are well-defined interfaces by design.
- **Composable**: The network flow of messages can be manipulated by other microservices as desired.

## Chapter 3: Messages

### Messages are first class citizens

Traditionally, Object-Oriented practice taught us to extract nouns from business requirements to build objects, but
it's more intuitive to express business requirements as activities. Messages are intended to represent activities,
which is why they are treated like first class citizens.

#### Synchronous vs. asynchronous

|                          |                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Synchronous message**  | Originator of the message is blocked until a response is received. *Synchronous messages* are commands to do something. The response is an acknowledgment that something was done.                                        |
| **Asynchronous message** | Originator of the message isn't blocked, can wait for results, and handle scenarios where there are no results. *Asynchronous messages* are events. Subscribers to events are free to choose how they react to the event. |

### Pattern matching

A large part of complexity in a microservices system is message routing. *Pattern matching* attempts to
reduce this problem by allowing the network architecture to emerge dynamically from the properties of the messages.
Using *pattern matching*, message routing can be reduced to the following steps:

1. Represent the message as key-value pairs (regardless of the actual message data).
1. Map key-value pairs to microservices, using the simplest algorithm you can think of.

#### Case study: sales-tax rules

Suppose an online retailer begins work on calculating sales tax as one part of a general e-commerce solution. When
the user adds a product to their shopping cart, the cart will have an updated entry for the total sales tax due.

The retailer decides to model this business requirement with a synchronous `add-product` message that responds with
an updated cart and a synchronous `calculate-sales-tax` message that responds with the gross price.

The properties of the `calculate-sales-tax` make it hard to distinguish between other messages with similar
properties like the `add-product` message. Adding a label to the message, like `label:sales-tax`, utilizes pattern
matching to find messages.

*Pattern matching* is also a good way to deal with changing business requirements. For example, suppose a product falls
under one of two different sales tax categories: standard or reduced. A new microservice `sales-tax-reduced` can
handle the reduced sales tax category while `sales-tax` can handle the standard category. Using *pattern matching*, a
new key-value pair, `category:*` can be added to the `calculate-sales-tax` message and routed according to the table
below:

| Pattern                             | Microservice        |
| ----------------------------------- | ------------------- |
| `label:sales-tax`                   | `sales-tax`         |
| `label:sales-tax,category:standard` | `sales-tax`         |
| `label:sales-tax,category:reduced`  | `sales-tax-reduced` |

### Message patterns

> The patterns below are categorized using the form *m/n* where *m* is the number of message patterns and *n* is the
> number of microservices (not *instances*!).

#### 1/2: Request/response

![](https://drive.google.com/uc?id=1itnx6uqidWC4KGHhXbAxLnM3ASeA4Cng)

#### 1/2: Sidewinder

![](https://drive.google.com/uc?id=1Rt7AdI99__XQOo94tnmJjjIWzwq4y6Ga)

#### 1/2: Winner-take-all

![](https://drive.google.com/uc?id=1wRoqhD8Lbi339sMII3uaCuB7kT4I8Hw2)

#### 1/2: Fire-and-forget

![](https://drive.google.com/uc?id=1IjrezGbpMl2E0RVNgaIwjhH_F-9vFoIU)

#### 2/2: Request/react

Useful when the listener is expected to take a non-trivial amount of time to complete a request.

![](https://drive.google.com/uc?id=1h2O5nmoIFMWCCvp0JCxEvMAgjHZVM-dm)

#### 2/2: Batch progress reporter

Like request/react, but a series of reaction messages announce the state of the batch process to subscribing
microservices.

![](https://drive.google.com/uc?id=1ZJocJCkpztoh6jlKUiWG7uyX2qz70NpZ)

#### 1/n: Orchestration

Removes the need for a specialist network component.

![](https://drive.google.com/uc?id=1jPhuUOyqoGvhZzvfbAdzIxDKfNhLiiYL)

#### 1/n: Scatter/gather

Announces a need and collect results as they come in.

![](https://drive.google.com/uc?id=1kznU2EIh4TsCcro0evfYsDNSHPy-3WwH)

#### 1/n: Multiversion deployment

Duplicates traffic and compares output across versions of a microservice.

![](https://drive.google.com/uc?id=1YdeqyFoDHNfik_XLiljtJtF_ZjyrDwEY)

#### 1/n: Multi-implementation deployment

Useful for A/B testing features.

![](https://drive.google.com/uc?id=1U0H9pZmLrbpZTvUzBVaYs_1wJKyxHALx)

#### m/n: Choreography

Typical for actions that are gated by conditions before further work can be processed.

![](https://drive.google.com/uc?id=1kaZ57Hc4NKs9ZhCeanKGh3V463TSNJM1)

#### m/n: Tree

Typical for workflows with parallel choreography.

![](https://drive.google.com/uc?id=1HNhGpoCOniqmQx4yJFYph2-K_ZWO9Kwz)

### When messages go bad

| Problem                   | Interaction      | Description                                                           | Mitigation                                                                                                                  |
| ------------------------- | ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Slow downstream**       | request/response | B is slow to respond to messages from A.                              | Remove B from interaction when it performs below a throughput threshold, giving it time to recover or be replaced.          |
| **Upstream overload**     | request/response | A is generating too much work for B.                                  | Have B selectively drop messages from A once B is pushed beyond a load threshold.                                           |
| **Lost actions**          | sidewinder       | Changes to A's message content causes either B or listener C to fail. | Measure the system while performing updates of A in stages. If system health drops below a threshold, roll back and review. |
| **Poison messages**       | winner-take-all  | All *instances* of B crash on a particular message from A.            | Place message from A on a dead-letter queue. If A sends a duplicate message, consume and drop it before it gets to B.       |
| **Guaranteed delivery**   | winner-take-all  | Message fails to reach B, unbeknownst to A.                           | Prefer a at-least-once message delivery behavior and have a way to deal with duplicate messages.                            |
| **Emergent behavior**     | fire-and-forget  | System contains unexpected messages or message volume.                | Have each message contain metadata to identify messages to help trace the flow of messages for debugging.                   |
| **Catastrophic collapse** | fire-and-forget  | Emergent behavior with a feedback loop.                               | Progressively bring down parts of the system with the goal of breaking the feedback loop.                                   |  |

## Chapter 4: Data

|                 |                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data entity** | A single coherent data type from the perspective of a given system domain with an internal representation subject to constraints imposed by the database. |

### Data doesn't mean what you think it means

- **Data is heterogeneous, not homogeneous**: Some data is mission critical; other data is only useful. Constraints
  on each *data entity* in a system are different and can favor one data-storage solution over another.
- **Data can be private**: It's an anti-pattern to use the database as a communication mechanism between software
  components. Access to a *data entity* should be represented by messages rather than a database schema.
- **Data can be local**: Microservices can have their own private database. Local databases make early development
  smoother. A strategy to synchronize data with the rest of the system can be used as needed later on.
- **Data can be disposable**: Backing up hundreds of microservice database instances isn't necessary. Upgrade a
  database by deploying new instances, not modifying old ones. Important data can be stored on a system-of-record
  (SOR).
- **Data doesn't have to be correct**: Each *data entity* has different accuracy constraints. Don't waste time when
  the cost of improving accuracy outweighs its benefits.

### Data strategies for microservices

#### Using messages to expose data

Messages are designed for the sole purpose of preventing the coupling that a shared database creates. This unlocks
the ability to choose and change the database underneath a microservice without breaking other microservices.

####  Using composition to manipulate data

Representing data operations as messages gives you the ability to:

- Extend data operations with a well-defined component model. A good example is adding a caching microservice.
- Use alternative data-flow models like asynchronous write and synchronous read operations known as Command Query
  Responsibility Segregation (CQRS).
- Adopt a reactive approach to data operations. More than one microservice can listen to data-operation messages.
- Test microservices easily. You can mock up data operations in unit tests without overhead or dependencies.

#### Using the system configuration to control data

When data operations are represented as messages, you can scale databases by changing the way the messages are routed. 

For example, the diagram below details a typical deployment sequence for replacing a database shard with zero downtime.

![](https://drive.google.com/uc?id=1_OnNt5AXcHCR3JzXlcaIJ1UiapoTGQHc)

Similarly, you may also want to add to scale up or remove a shard to reduce complexity. The diagram below details the
deployment sequence for splitting a shard.

![](https://drive.google.com/uc?id=1cQsZrmXTNIPB7w95eC3pPWfErLiTHp_8)

#### Using weaker constraints to distribute data

Traditionally, duplicating data in a database is undesired. However, in a distributed system, duplicating data using
strategies such as *denormalization* can lead to significant performance increases.

|                     |                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Denormalization** | Keep a copy of local data entities. At a later time, propagate the local entities to the primary entities using methods such as batch process or change-announcement messages. This strategy trades data consistency for performance. |

### Rethinking traditional data patterns

#### Primary keys

- Synthetic keys are preferred because they can be permanent and avoid the need to change references.
- GUIDs aren't an automatic choice. Although eminently suited to distributed systems, they have negative effects on
  performance, especially with traditional database indexes.
- You can use integer keys. They can still be unique, but they're weaker than traditional autoincrementing database
  keys.

#### Foreign keys

In the world of distributed databases, JOIN is an operation that cannot be relied on because there's no guarantee
that any given data entities are stored in the same database. Alternatives to JOIN exist.

#### Transactions

Database transactions promise to meet the ACID (Atomicity, Consistency, Isolation, Durability) properties. While
these properties are nice to have, consider other options, such as reservations, which relax these properties for
performance gains.

#### Schemas
 
 Schemas build technical debt. As business requirements change, the original schema is extended so that it doesn't
 break other parts of the system, while other parts of the schema become legacy structures that must be handled in
 the code base.

The microservices architecture approaches this problem as a matter of configuration, directing messages that make old
assumptions to legacy microservices and new messages to new microservices.

## Chapter 5: Deployment

### A model for failure in software systems

- Failure is not an absolute binary condition, but a quantity that can be measured over many iterations. It's
  more useful to consider the *failure rate* and define some meaningful threshold that marks success or failure.
- A software system is not as unreliable as it's most unreliable component; it's *much more unreliable* because other
  dependent components can fail, too.
- Load balancing over many *instances* doesn't give you strong redundancy, it gives you capacity. Redundancy works
  for hardware because hardware eventually breaks. Redundancy does not work for software because software eventually
  works.
- Software systems are not static, they suffer from deployments where several components change simultaneously. This
  strategy is inherently risky and almost always fails. Resolving production issues is equivalent to trying another
  deployment.

### Continuous delivery

|                           |                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Continuous delivery**   | In the microservices context, create a specific version of a microservice and run one or more *instances* of that version in production, on demand. |
| **Primitive operation**   | Adding/removing a microservice *instance*.                                                                                                          |
| **Microservice artifact** | A microservice *artifact* can be a container, a virtual machine image or some other abstraction.                                                    |

A *continuous delivery* pipeline has a:

- **Version-controlled local development environment** for each service, supported by small and medium tests.
- **Staging environment** to test the microservice and reproducibly build an *artifact* for deployment. Tests are
  typically automated but some can be manual.
- **Management system** to execute combinations of *primitive operations* against staging and production.
- **Production environment** constructed from deployed *artifacts* to the fullest extent possible. It has an audit
  history of *primitive operation*s, a self-correcting mechanism for dealing with crashes, and a load balancing
  solution.
- **Monitoring and diagnostics system** that verifies the health of the production system after a *primitive operation*
  is performed and generates alerts when the system is unhealthy.

#### Pipelines

- Pipelines require tooling. Do not roll your own tooling; rely on the community first.
- Be able to trace all stages of a pipeline.
- Mark and tag the source code so that *artifact* generation can be *hermetic*.
- *Artifacts* are *immutable*.

#### Protection

Measure risk at each stage of production.

- In development, the key risk-measuring tools are code reviews and unit tests.
- In staging, measure risk by monitoring message flows.
- Continue to measure risk in production.

### Running a microservice system

#### Immutability

A microservice *artifact* is *immutable* if it can't be changed internally and it has only two active states: active
and inactive. This preserves the ability to act as *primitive operation*s.

#### Automation

Microservice systems in production contain too many parts to be managed manually.

To decide which task to automate next, divide the tasks into two categories:

- **Toil** - tasks where human effort grows with at least `O(n)`.
- **Win** - tasks where human effort grows with less than `O(n)`. 

`n` is the number of microservice *type*s. The next task to automate should be the task that most negatively
impacts business goals from the Toil category.

#### Validation

- Continuous validation is essential to risk reduction and value in a *continuous delivery* pipeline. 
- One valuable measurement is the ratio of one messages flow-rate to another messages flow-rate.
- Deliberately test failure capabilities as a form of insurance. Take small, frequent losses to avoid large,
  infrequent, losses that are fatal.

#### Discovery

When microservice A knows that microservice B will receive it's messages, A is *coupled* to B. Transport
independence hides the mechanism of transportation from A, *pattern matching* hides the identity of B, and together,
they decouple services.

Decoupled services need some way to discover each other. Some solutions include:

- **Intelligent load balancing:** Direct all traffic messages through load balancers that know where to find services.
- **Service registries:** Services register their location with a central registry, and other services look them up.
- **DNS:** Use the DNS protocol to resolve the location of a service.
- **Message bus:** Use a message bus to separate publishers from subscribers.
- **Gossip:** Use a peer-to-peer membership gossip protocol to share service locations.

#### Configuration

Configuration can live immutably with the *artifact* or dynamically on the network. A total solution for a system will
likely be a hybrid of the two.

Beware of two dangerous configuration anti-patterns:

- **Automation workarounds:** Using configuration to code around limitations to automation tooling.
- **Turing's revenge:**  Making a complex configuration language over the course of many extensions to the language.

#### Message security

- A common temptation is to share messages with the outside world. This is dangerous. Keep a separation between 
  internal messages and third-party clients. A *demilitarized zone* serves to sanitize input requests as they are 
  converted into messages.
- Internal messaging uses the network. Consider encrypting messages that are sensitive.

#### Staging

- Staging is the control system for the *continuous delivery* pipeline and is subject to large variance from
  organization to organization.
- Staging is home to the build server and more importantly, it's home to subsystems that test the product and collect
  statistics for measuring velocity and quality of code delivery over time.

#### Development

The development environment should allow developers to focus on one service at a time for unit-testing as well as small
subsets of the system for larger tests. This should all be local, without the help of the build/staging system. 

> If you need to run all, or most, of your services to get any development work done, you are no longer creating 
> microservices; you are creating a distributed *monolith*. Enough time and energy must be placed in the 
> messaging abstraction layer and message mocking strategies.

## Chapter 6: Measurement

As a system with many moving parts, measurement becomes more involved. Metrics such as system CPU load and query
response times are not as useful.

Measurement can help:

- Confirm the business requirements by demonstrating progress.
- Test and understand the technical function of the system by collecting metrics.
- Manage risk so you can move fast knowing you will have feedback should something break.

|                      |                                                                             |
| -------------------- | --------------------------------------------------------------------------- |
| **Service Instance** | Specific operating system process.                                          |
| **Service Type**     | Shorthand for a group of service *instance* that share something in common. |

### The limits of traditional monitoring

Time-series charts are a common form of measurement with *monolith*s. For example, it's easy to capture load at
regular intervals and make sense of the data. For a microservices system with many microservice *types* and many
*instances* of each microservice, time-series charts become noisy. A measurement approach for large numbers of
independent elements is needed.

#### Averages

Averages can be useful for eliminating noise because they can summarize data. Averages are most useful when you
can be sure that the distribution is not skewed.

For example, response times are not a good application for averages because skewed data can occur and become hidden
behind the average as seen in the image below. The average suggests that users are seeing lower response times after
the implementation of the cache. While that's true for the average user, the high response times are more important.

<table>
  <tr>
  <th>Response times</th>
  <th>Response times after caching introduced</th>
  </tr>
  <tr>
  <td>

  ![](https://drive.google.com/uc?id=1va71ogBhNZkjvGEtY8b4f2hARZ9gZa46)
  </td>
  <td>

  ![](https://drive.google.com/uc?id=1dgDim4fifRigKlNUPcte7ecXkb1b2SZ0)
  </td>
  </tr>
</table>

#### Percentile

Percentiles are slightly more powerful than averages because the percentile can be moved around to deal with skewed
data. 

For example, the 90th percentile, shown in the image below, correctly detects that cases of high response
times have become worse after the implementation of the cache, while the average did not.

<table>
  <tr>
  <th>Response times</th>
  <th>Response times after caching introduced</th>
  </tr>
  <tr>
  <td>

  ![](https://drive.google.com/uc?id=1j-UXVgK6plry1R5-MWXuMd3DBV_40lsT)
  </td>
  <td>

  ![](https://drive.google.com/uc?id=1MVRAK7CqYk7QzMh0f5Z2jKczStavjWtD)
  </td>
  </tr>
</table>

> Summary statistics hide information and can result in misleading data. A famous example is *Anscombe's quartet*.

#### Scatter plots

Scatter plots are useful for comparing two quantities at a given moment. Scatter plots shine when the
quantities are correlated.

For example, you could plot the 90th percentile of response times over the past 24 hours (historical) against the
response times over the past 10 minutes (current). Even If you have hundreds of microservices, it's still easy to
spot outliers.

![](https://drive.google.com/uc?id=1tVQsnY-nkJ6ZRs_QF7cWXuXu0EQQ_ImT)

> Investigate third-party measurement products. It's relatively easy to develop a powerful custom measurement system, 
> using open source analytics such and charting projects.

### Measurements for microservices

#### Business Requirements

Some aspects of business requirements are quantitative and lend themselves to measuring easily. Qualitative business 
requirements may seem un-intuitive to measure, but there's always a measurement that can be performed to reduce
uncertainty.

A business requirement like, "the system should be user-friendly" may seem like something that cannot be measured.
Instead, you can measure indirectly related things like the time it takes for the user to complete a related use case. 

#### Measuring messages

Below is a list of measurements that can be collected. For each of the counts, you may wish to tally total, pass, and
fail as separate counts.

- **Outbound**
  - Message counts
  - Response counts
  - Response time
- **Inbound**
  - Message counts
  - Message validation counts.
  - Response counts
  - Response time

Many useful plots can be derived from these measurements including

- Outbound message counts vs. Outbound response counts.
- Outbound response errors vs. Time.
- Current outbound response time vs. Historical outbound response time.
- Inbound response time vs. Outbound response time.

#### Measuring services

Categorical scatter plots are a way to track each microservice *instance* over a fixed time frame. To make the data
easier to visualize, you can add horizontal jitter. The figure below is a categorical scatter plot of response times.

![](https://drive.google.com/uc?id=1HIonD6XZoXc0F3MN3WGy9CaB76X-VfX8)

### The power of invariants

|               |                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invariant** | For any given configuration of message patterns, *invariants* are ratios of message-flow rates that remain the same despite changes to load, services, and network. |

*Invariants* typically come in the form of message chains where the traffic of one message causes traffic of other
messages.

![](https://drive.google.com/uc?id=1OMjbZcDdD0D8taQzsfgD0cjbOuqoxHQC)

It's possible to build sequence diagrams, like the one above, using a distributed tracking system that works by
tracking messages that share the same correlation identifier. The identifier is just a piece of metadata that added
to messages.

> Distributed tracking systems are expensive. They should only be used to track a small subset of all messages.

## Chapter 7: Migration

Start every project by asking these fundamental questions:

- What is the definition of success?
- What metrics prove success?
- What is the acceptable error rate?
- What are the hard constraints?

> Before diving into migration strategies, take note of these words of wisdom from the author:
> 
> - Success breeds success. Seek any low hanging fruit and achieve some early wins. Be sure to spread the word of your 
>   accomplishments.
> - While working with the *monolith*, coupling issues are common. Resist the urge to refactor since it will impede
>   feature delivery and is often irrelevant to the real work you will do later.
> - Resist the urge to rewrite everything from scratch using microservices. This is an underestimate of the business
> complexity of the *monolith* and will almost certainly be incapable of replacing the *monolith* without hitch or
> fail.

### The strangler tactic

Piece-by-piece, slowly replace the *monolith* with microservices. This is less risky then chopping the entire thing
down. The replacement process is achieved through *partial proxying* which produce microservices called *strangler
proxies*.

#### Partial proxying

- Install a basic web proxy that captures all external interactions. 
- Start re-implementing individual pages as microservices. The proxy can be slow and incomplete; focus on delivering
  early.
- New microservices need to handle legacy data interaction and talk to the legacy database at first. If the
  database communicates using database events, you will need to spend more time and resources to move
  away from this.

> Removing communication with the database can be tricky. Try isolating data used for communication in a separate
> integration database until the *monolith* has been further migrated.

### The greenfield tactic

To begin building microservices, spend time at the start of the project putting in place the correct infrastructure
to develop, deploy and run microservices in production before the completion of your first *strangler proxies*. This
includes an entire software-delivery pipeline from developer machines, through the *continuous delivery* system, all
the way to production.

While you are migrating, you still need to keep working on the old *monolith* to have the credibility of an organization
that can deliver software. This is especially true during the early days of the migration where no microservices have
reached production.

### The macroservice tactic

Once the greenfield environment for microservices is successfully completed, you can break the *monolith* into separate 
large pieces, called macroservices. Macroservices are not microservices, but they can partially be treated as such
because they can be subsumed into the microservice deployment pipeline.

Provided below are some tips to aid the extraction process:

- Extract only one macroservice at a time to reduce the risk of failure.
- Though it's advised to not waste time refactoring, refactoring for the sake of extracting a macroservice may be
  worthwhile.
- Extracting macroservices will heavily depend on the strangler proxy(s) to route inbound interactions to the right 
  macroservice.
- Dropping features is always a choice.
- *Transport independence* and *pattern matching* are important. You should introduce your message-abstraction layer
  into the macroservices and use it as the communication layer between them. 
- Avoid creating a separate communication mechanism between macroservices.

Once the macroservices are in place, dependencies of the macroservices should slowly start to shift to microservices
rather than other macroservices.

## Chapter 8: People

### Institutional politics

- **Accept hard constraints:** Find hard constraints and document them. Constraints can soften as you build trust
  and confidence. 
- **Find sponsors:** Network internally. Find your sponsors and meet them. Ask which format they prefer and feed them
  information.
- **Value-focused delivery:** Business value isn't an abstract concept; it's identification of the measurements that
  closely track the business goals your leadership cares about. Agree to measure, agree about the measurements. Doing so
  will keep everyone honest.
- **Acceptable error rates:** Agree to measure error and come up with measurements. Measure error from the first day of 
  the project, and use the deployment pipeline to manage risk and stay below the error rate.
- **Dropping features:** Find features that are both complex and offer little value and ask to remove them.
- **Stop abstracting:** Keep microservices small and default to implementing new features with new microservices. Use 
  *pattern matching* instead of extending data models.
- **Deprogramming:** Everybody in development suffers from unsubstantiated beliefs. Be upfront and clear that 
  microservices will break some established conventions.
- **Team solidarity:** Do not solve people problems with code. Instead, ask yourself how many code problems you can 
  solve by engaging people. Also, measure your team as a whole. Look for team happiness, level of recommendation, 
  and happiness with code quality.
- **Respect the organization:** Conway's Law states that, "Any organization that designs a system will produce a design
  whose structure is a copy of the organization's communication structure." Conway's law is a natural force that you can
  use or oppose; either response may be justified.

### Politics of microservices

- **Who owns what:** The best configuration is where any given team member can work on any given microservice. Each
  team member will tend to develop specialties; fight this by encouraging the team to work on code they don't
  understand as a matter of preference.
- **Shared libraries:** Libraries fall under two categories: utility and *business logic*. Shared *business logic* is 
  fatal to microservices. Shared *business logic* should go into a separate microservice and access via message flows.
- **Who's on-call?:** Adopting the DevOps mentality comes with adopting microservices. The development team will need
  to support the deployment pipeline and production system on an ongoing basis. One strategy is to rotate each
  developer in the team through an on-call iteration where that developer handles bugs, issues, support, meetings,
  keeps the deployment pipeline healthy, and acts as a point of contact outside the team.
- **Who decides what to code?:** Individual developers tend to Balkanize into antagonistic, isolated domains. 
  This natural tendency is undesirable because the team becomes less flexible and knowledge stop flowing. Here are some 
  tactics to prevent this from happening:
  - As a manager, keep an equilibrium between full automation and strict hierarchy.
  - Everybody should code. Seniors need time safe from interruptions where they can work on long-term work. Group 
    problem solving is more efficient because communication is easy. After all, politics originates from lack of shared
    understanding.
  - The languages of the code base should follow a power-law distribution; most code uses a dominant language with a
    tail of specialized oddities.
  - All developers should take part in understanding the big picture by having discussions about message flows.
  - Make sure the team is aware that their code is ephemeral and transient. Do A/B testing and business experiments
    by replacing entire microservices; they are small for this purpose.
  - Allow mistakes. Let team members learn from their mistakes and teach members about their mistakes without blame.
    Do not allow these mistakes to leak outside of the team; keep trust with the rest of organization.

## Chapter 9: Case study: Nodezoo.com

nodezoo.com is a search engine for [Node.js](https://nodejs.org/en/) modules. The system provides free-text search
over the full list of Node.js modules. Users can also view details about any given module, such as its author and
description. Also, the system should collect information from other sources, such as Github, and combine it all into
an information summary page for each module.

### Design

#### Requirements

Begin the project by talking to stakeholders and drafting up a set of business requirements:

- **BR1** - The result list for a search should return in at most one second, as should the information page.
- **BR2** - The module search should be free-text, and the results should be ordered by relevance.
- **BR3** - An information page will show information about a specific module, collected from various sources.
  - **BR3.1** - The first sources will be <http://npmjs.com> and <http://github.com>. More sources will be added later.
- **BR4** - The system should stay up to date as module updates are published to <http://npmjs.com>, but it doesn't
  need to be real-time and can be delayed for up to an hour.

At this point, you also need to be clear with stakeholders that delivery will be incremental and fall below production
standard.

Also, you also need to agree with stakeholders what the quantifiable definition of success is. In this case, the numbers
are used in the *business requirements*.

> With *business requirement's* that contain performance goals, it's easy to spend time worrying about efficiency.
> Now is not the right time to be thinking about that. Performance gains are about making trade-offs but only after
> they've shown that they can pay their way.

#### Messages

While resisting the temptation to convert nouns to classes, the next step is to convert the activities talked about in
the *business requirements* into messages.

*BR1* is all about performance; simply do not deploy something that does not meet this goal.

*BR2* will need a set of messages to describe the search activity. This includes querying a search index as well as
inserting results into the index.

``` javascript
{ 
  role: 'search',
  cmd: 'search',
  query: 'foo'
}

{
  role: 'search',
  cmd: 'insert',
  data: { ... }
}
```

`role` is used to create a namespace. `cmd` designates an action to be performed. The rest of the message is
data that does not need to be considered yet. Similarly, `role:search,cmd:search` is expected to return a response
containing search result data. Responses also do not need to be considered yet, they are second class citizens.

*BR3* talks about displaying the information of a module. We expect the information to have many parts, so the plan is
to asynchronously collect these parts and return the collection as a response to the `cmd:get`. 

``` javascript
{
  role: 'info',
  cmd: 'get',
  name: 'module'
}

{
  role: 'info',
  need: 'part',
  name: 'module'
}

{
  role: 'info',
  collect: 'part',
  name: 'module'
}
```

*BR3.1* implies a set of custom command messages to get information, and as an extension, query the third-party
service.

``` javascript
{
  role: 'npm',
  cmd: 'get',
  name: 'module'
}

{
  role: 'npm',
  cmd: 'query',
  name: 'module'
}
```

A duplicate set of messages with `role:github` can be used for the `github` service.

Finally, *BR4* adds a message to handle module updates. This messages is asynchronous and serves as an event message.

``` javascript
{
  role: 'info',
  event: 'change',
  name: 'module'
}
```

The final list of messages becomes

- `role:search,cmd:search`
- `role:search,cmd:insert`
- `role:info,cmd:get`
- `role:info,need:part`
- `role:info,collect:part`
- `role:info,event:change`
- `role:npm,cmd:get`
- `role:npm,cmd:query`
- `role:github,cmd:get`
- `role:github,cmd:query`

#### Services

- A `web` service displays the search page. When the user enters a search query from the UI, it sends a
  `role:search,cmd:search`.
- The `search` service sends back a list of search results.
- The index used by the `search` service is populated by asynchronous `role:search,cmd:insert` messages sent by the
  `npm` service. 
- `npm` integrates with <http:///npmjs.com>.

*BR2* is satisfied by the system in the diagram below:

![](https://drive.google.com/uc?id=1TjPRWeb8hhVigVUOtAzBvouQk9h2rVGn)

- The `web` service is also responsible for displaying module information contained in the response of the 
  `role:info,cmd:get` command in the UI. 
- Upon receipt of the `role:info,cmd:get` command, the `info` service will collect module information using the 
  scatter/gather approach by emitting the asynchronous `role:info,need:part` messages. 
- These messages are observed by the source integration-services `npm` and `github`, which trigger internal
  `role:npm/github,cmd:get` messages.
- `npm` and `github` will then emit a `role:info,collect:part` message once they have collected their contribution to
  the module information.
- `npm` and `github` will also listen for `role:info,event:change` events and trigger a `role:npm/github,cmd:query` 
  message.

> The `role:npm/github,cmd:get/query` messages exist as naturalistic internal messages to support decoupling. Part of
> the reason for doing so is the expectation that complexity will increase in this area later.

With the right performance results, the system is can now meet all *business requirement*s. The complete design is
provided in the diagram below:

![](https://drive.google.com/uc?id=1XjnsEwmt31seSUBzlc5q_5WBSb9fwtAj)

### Deliver

An implementation of the entire project can be viewed at <https://github.com/nodezoo>. Of particular note is the
hands-on workshop available at <https://github.com/nodezoo/nodezoo-workshop>.

#### Iteration 1: Local development

To build stakeholder trust, it's advisable to have something to prove ASAP. With that advice in mind, the game plan is:

1. Get a local development environment up and running.
1. Run a demonstration on a developer machine.
   - Consider a process manager. Manually managing services can be tedious.
   - Be able to manually test and unit-test any service alone by mocking dependencies.

Developments starts with the `web` service which displays web pages for the UI. Of particular concern is the messaging
layer that is *transport independent* and supports *pattern matching*.

To test the service, both manually and with a unit test framework, the `search` and `info` services will need to be 
mocked. `web` needs a mechanism to make reasonable canned messages on demand.

`search` wraps interactions with a free-text search server made available through a web API. If you are unable to run
the search server locally, you will need to make a mock response.

> A lifesaving feature is the ability to send a microservice message by hand. One such way is to create a network
> REPL (Read-Eval-Print Loop) that allows you to `telnet` into the service. This feature will be useful at all stages
> all the way through production.

`info` is the first service to interact with other services using *asynchronous messages*. Here, the *transport
independence* of the message abstraction layer is vital because it allows you to use a simple simulation model to get
things working in development and a more involved, quality-oriented model in production.

Of course, the `npm` and `github` services will be mocked as well.

The `npm` service will be the last service needed to complete a demonstration for the first iteration. On
reflection, you realize that not only do you need flexibility for the query integration with npmjs.org, but you also
need to have flexibility in how you extract JSON data from npm. A new internal `role:npm,cmd:extract` message is
added to the service.

Additionally, the npm data will be stored locally so that you don't need to query npm every time.

> Running all the services manually gets old fast. You can make a quick and dirty shell script or look up a process 
> management solution.

#### Iteration 2: Testing, staging, and risk measurement

Nodezoo will use a three-stage deployment process: development, staging, and production that follows the following
outline:

1. Create or update a service.
1. Verify message behavior with unit tests.
1. Build and deploy an *artifact* to the staging environment.
1. Verify the staged system still works, using integration and performance tests.
1. Build and deploy an *artifact* to production, but only if the risk of breakage is sufficiently low (measured with a
   scoring system).
1. Verify the production system remains healthy, using a progressive deployment.
1. Repeat many times a day.

The sole purpose of the staging system is to measure the risk of failure in production. Each version of each service
gets a score to inform a go/no-go decision on deployment. This means that the shortcuts taken in development now need
to be changed to something suitable for testing readiness for production. Namely,

- Hardcoded ports need to be replaced with a more flexible networking strategy with service-discovery such as DNS or 
  P2P.
- The simulated *asynchronous messaging* model needs to be replaced with something with a little more complexity.
- Staging scripts no longer need to worry about mocking or simulating message interactions.
- You need a lightweight system geared for ease of maintenance such as a container based infrastructure.

After the staging environment is up and the services are ready, the team focuses their efforts on the validation 
tests. Validation is performed by sending standard messages to each service. This is already something REPL can do,
it just needs to be extracted into its own service. This service will be invaluable in production too.

Besides the message tests, the two other test categories are unit tests and performance. The performance test 
is a 90th percentile response time for each desired endpoint. Test categories can be weighted according to taste.
 
- Unit tests - 0.3
- REPL tests - 0.4
- Performance tests - 0.3

In this case, the REPL tests more adversely affect risk. The final risk score is normalized so that it becomes a number 
between 0 and 100. Should the number ever fall below 95, the deployment of that service is rejected.

#### Iteration 3: The path to production

Production systems automate the delivery of validated *artifacts* produced by the staging system. Tooling plays a key
part here and many great tools exist to help you with production-management. Tooling is quite involved and
falls out of the scope of this book, but using whatever tools you choose, your production automation system should
adhere to these key principles:

- **Immutable units of deployment:** It shouldn’t be possible to change running units of deployment. You change the
  system by deploying or scaling, not by modifying.
- **Ephemeral units of deployment:** You must work under the assumption that you’ll have a high turnover of the units of
  deployment, and that this constant killing and launching won’t be under your control.
- **Scriptable via a well-defined API:** An essential part of automation.
- **Declarative system definition:** The entire system architecture, from networking to storage, from load balancing to
  monitoring, must be something you can describe in code.

#### Iteration 4: Enhancing and adapting

With the deployment workflow in place, we can begin to iterate on the *business requirements* to deliver value. 

A good place to start is by adding data sources such as <http://github.com>. The `github` service depends on the `npm`
service for it repository URL. Though it's possible to remove some of the coupling by introducing an abstract
service that `npm` and `github` can use, let's start simple and accept the coupling knowing that *pattern matching* can
bail us out in the future.

To deploy the service in production, simply follow the deployment workflow.

Next, let's add a new feature: search field autocomplete. As always, think about the messages first.

- `role:suggest,cmd:suggest`
- `role:suggest,cmd:add`

It's clear that the `web` service will send the `cmd:suggest` and it seems okay for the `search` service to send
the `cmd:add`. The `suggest` service will handle these messages.

The deployment strategy starts with the `web` service which will start asking a for search suggestions but can handle a 
complete lack of response. Next is the `search` service. `search` asynchronously emits search terms to the void. This 
changes quickly because the `suggest` service is deployed next.

As time passes, the system works great except the npm data is stale because it's not listening for module updates.
The npm API lets us listen to a stream of module updates from which a new `update` service can emit
`role:info,event:change` messages and let the other services (`npm`) do the hard work.

#### Iteration 5: Monitoring and debugging

Monitoring involves the measurement of several important aspects of the system including

- **Message flow rates** - Each time the user searches, a `role:search,cmd:search` is generated. This message can be
  used to measure the number of searches per second independent of the number of `web` or `search` service
  *instance*s.
- **System invariants** - Each time a user searches, a `role:suggest,cmd:add` message is also generated. The ratio of
  the two messages should be one.
- **Message response times** - The response time of the `role:search,cmd:search` message directly affects the user
  experience. A scatter plot of current vs. historical response times for this message and related messages can
  compare the relative performance impacts recent changes in behavior have on the system. Additionally, a tracing
  system can sample message flows as well.

While monitoring can help reveal that something is amiss in the system, it does not help debug the problem. For this, 
a logging solution and the REPL service are essential. The logging solution sends logs from every service to a central 
location for indexing and enables the team to search and review logs from the entire system easily. The REPL service 
allows the team to effortlessly send targeted messages to a service manually and review the results.

#### Iteration 6: Scaling and performance

As system load grows, message interactions and the scalability of individual services should be considered:

- **`web`** - It's important to keep the stateless nature of this service. Doing so allows the ability to handle
  higher loads by adding more *instance*s. As complexity grows the service could split into individual pages 
  and/or API endpoints.
- **`search`** - A stateless wrapper around third-party search.
- **`info`** - This service isn't stateless. It has an npm cache. It also continuously runs scatter/gather 
  interactions. During these interactions, everybody needs to talk to the same *instance* or data might end up in the
  wrong *instance*. It can be scaled vertically by increasing hardware memory. It can be scaled horizontally with
  *pattern matching* by adding a per-*instance* marker property to the scatter/gather messages.
- **`npm` and `github`** - These services are stateless, but they have ephemeral data. They can be scaled
  horizontally by adding more *instances*. Each *instance* needs to store all the data, increasing data volume. Data
  volume could then be traded for latency by using an external shared database or database shards with *pattern
  matching*.
- **`suggest`** - This service is stateless with in-memory data. If user feedback leans towards stronger
  autocompletion, the service can be swapped out with a stronger implementation.
- **Everything else** - Other than microservices, the system is composed of load balancers, database engines, 
  search engines, deployment and orchestration systems, log-aggregation and -analysis tools, monitoring and alerting, 
  and more. Choosing third-party software can help speed up development and outsource scaling problems.