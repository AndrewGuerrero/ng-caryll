# The Tao of Microservices

*2018 Richard Rodger*

##  Chapter 1: Brave new World

Software development is an art. It isn't predictable enough to be engineering. It isn't rigorous enough to be science.
Unlike art, software has to work.

### The technical debt crisis

<dl>
  <dt>Business Logic</dt>
  <dd>
  Logic that is directly specific to the business goal at hand. It is the representation of your business using the
  structures of your programming language. The term is suggestive, not prescriptive.
  </dd>
  <dt>Composition</dt>
  <dd>
  Making big things out of small things in an additive process.
  </dd>
</dl>

### Case study: A microblogging startup

#### Iteration 0: Posting entries

<dl>
  <dt>Minimum Viable Product</dt>
  <dd>
  Build the minimum set of features that lets you validate your assumptions about a market, and then iterate on those
  features and assumptions until the product fits the market.
  </dd>
</dl>

Suppose a microblogging site has decided on a system that lets users post *entries*, or short pieces of text. The
*MVP* includes the following *activities* and associated *messages*

- Posting and entry
  - `post:entry`
  - `info:entry`
- Listing previous entries
  - `store:list,kind:entry`
  - `store:load,kind:entry`
  - `store:save,kind:entry`
  - `store:remove,kind:entry`

> Instead of getting lost in implementation, focus on the messages first and think about interaction.

Once the messages have been fleshed out, they are grouped into sensible *services*. One such implementation is
provided in the diagram below.

![](https://drive.google.com/uc?id=15or1k9CkpwEJadWjr9yW_T7tdN-CdLbT)

#### Iteration 1: A search index

In this iteration, a new activity and associated messages are added to the system

- Search through entries
  - `search:insert`
  - `search:query`

The search activity is added into the system as seen in the diagram below

![](https://drive.google.com/uc?id=1hrqvRUuu3rq3zI8_BQtXyINW7FmVPtk0)

> Notice the choice in implementation. *post* could have just as easily sent `search:insert` to *index*. However,
> doing so would couple *post* to *index*. Additionally, the decision for *index* to convert `info:entry` into
> `search:insert` messages can be made at runtime to maintain loose coupling.

*index* can be added without any effect to the system. Since a previous version of *front* is already in production,
the principle of *additivity* can be applied. Deploy the new version of the *front* service alongside the older
version. Since both versions provide the same legacy functionality, nothing is broken. Both versions can used
according to taste as the old version is gradually swapped out.

#### Iteration 2: Simple composition

While monitoring the system, suppose *entry-store* exhibits high latency while talking to the database. One possible
solution is to implement a cache in a new service, *entry-cache*.

The service captures messages intended for *entry-store*. One such way to capture messages is to add an extra
property such as `cache:true` to `store:*` messages. *entry-cache* will take the place of *entry-store* and
entry-store* will act as a fallback only listening to messages with the added property `cache:true`.

*entry-cache* is trivial to introduce into the system but *entry-store* is a bit more complicated and will involve a
transition phase. Using the process of *additivity* introduce the new version of *entry-cache* but with a runtime
configuration that accepts both `store:*` and `store:*,cache:true` messages. Load-balancing would make it so some
messages go strait to *entry-store* while others pass through *entry-cache* first. Once the new functionality proves
itself, change the runtime configuration of *entry-store* to only accept `store:*,cache:true` messages.

The system now looks like the diagram below

![](https://drive.google.com/uc?id=1wr5tkpeh8kZFCrSp_nuE37hAC_-dY5pX)

#### Iteration 3: Timelines

Another core activity inside a microblogging framework is users following other users. Following the usual process,
the first step is to come up with a set of messages representative of the activity,

- Follow user
  - `follow:user`
  - `follow:list,kind:followers|following`
  - `timeline:insert`
  - `timeline:list`

The naming of the messages suggest two new services, *follow* and *timeline*.

> By now a pattern should be forming, new functionality begets new services. This avoids technical debt by moving
> complexity into the message-routing configuration and out of the conditional code and intricate data structures.

Similar to the *index* service, we will have the new microservices react to `info:entry` with an orchestration of
`follow:list,kind:followers` and `timeline:insert` messages. Instead of making complex routing and workflow rules, it
is perfectly reasonable to make a service with the sole purpose of performing this orchestration. We will call this
service *fanout*.

The system now looks like the diagram below

![](https://drive.google.com/uc?id=1N6ibwy6TL07WREyFm3WlvUgdD_HR_j0d)

#### Iteration 4: Scaling

The microservices are scaling fine, but the underlying database of *timeline* cannot handle the data volume, and must
be split into multiple databases.

One such technique, called *sharding*, assigns each item to a separate database, based on key values in the data.
Though sharding can work at the database level, the microservice level is a good choice because it maintains
flexibility. The `timeline:*` messages will have added `shard` property.

Adding the new sharding *timeline* microservice to the system looks similar to the process in Iteration 1 by using
the principle of additivity. However, the transition will take longer due to batch-transferring the old database into
the new database shards.

With that, this case study comes to a close with the final system diagram pictured below

![](https://drive.google.com/uc?id=1mswOZtkR94i8atf_9TRcKL1i78a7B2Rr)

### How the monolith betrays the promise of components

<dl>
  <dt>Monolith</dt>
  <dd>
  Large, object-oriented, body of code that executes in a single process. The Monolith is long-lived, undergoes
  constant modification and is essential to the health of the business.
  </dd>
</dl>

Components in a monolith

- **Have lost encapsulation**: Boundaries between components are weak. Once breached, internals leak into other
  components.
- **Don't deliver on reusability**: After loss of encapsulation, components become difficult to extract and reuse again.
- **Don't have well-defined interfaces**: Although strict, there are too many different ways to interact with an
  object.
- **Don't compose**: Baring special cases like inheritance and mixins, combining two objects does not create enhanced
  functionality.

In particular, composition is critical because it helps

- **Manage complexity**: Elements of a composition are hidden and inaccessible.
- **Minimize shared state**: Components communicate with each other using a stateless model.
- **Promote additivity**: Adding functionality does not involve modifying existing components. Instead, new components
  are added.

### The microservice idea

Microservices are characterized by the following axioms

- **Small**: Components avoid accumulation of technical debt.
- **Distributed**: Components are not constrained to a single process or machine.
- **No privilege**: No components are privileged.
- **Uniform communication**: All components communicate homogeneously.
- **Composition**: Components can be composed from other components.

#### The core technical principles

<dl>
  <dt>Transport independence</dt>
  <dd>
  The ability to move messages from one microservice to another without requiring microservices to know about each
  other or the underlying message sending infrastructure.
  </dd>
  <dt>Pattern matching</dt>
  <dd>
  The ability to route messages based on the data inside the message.
  </dd>
  <dt>Additivity</dt>
  <dd>
  The ability to change a system by adding new parts.
  </dd>
</dl>

### Practical implementations

#### Specification

Take informal business requirements, determine the behaviors of the system, and map the behaviors to messages.

> Move from general to specific. Focus on simple problems that provide high value first. 

#### Deployment

Deployment of microservices is complex enough to make automation a requirement.

#### Security

External entry points to the system shouldn't be presented in the same way as internally gen

## Chapter 2: Services

### Microservice architectures

<dl>
  <dt>The mini web servers architecture</dt>
  <dd>
  Microservices are web servers that offer small REST interfaces. Messages are synchronous HTTP requests and
  responses. Message content is JSON, XML, etc. Microservices communicate point-to-point or to a load-balancer.
  </dd>
  <dt>The asynchronous message architecture</dt>
  <dd>
  Microservices publish messages to one or more message queues and listening microservices retrieve them. Gathering
  responses is asynchronous. If a response is not produced in time, the application moves on without that content.
  </dd>
</dl>

### Monolithic projects vs. microservice projects

#### Monolithic projects

- All members of the software development team must carefully coordinate so as to not block each other. There's only
  one code base.
- There are too many ways to create dependencies and gather technical debt rapidly.
- Deployment is all or nothing. Mitigating risk with techniques such as *blue-green* deployments costs infrastructure.

#### Microservice projects

- Development of a microservice can and should be completed by one person in one iteration.
- The small size of a microservices increases estimation accuracy.
- The small size of a microservice makes it easier to dispose without large impact on the company.
- Important microservices can be prioritized over less important microservices.
- It is easy to separate business logic from infrastructure.

### Case Study: The digital edition of a newspaper

#### Informal requirements

- The content consists of articles, each of which has its own separate page.
- There are also special article-listing pages, such as the front page, and special-interest sections.
- The website, tablet, and app versions should all use a common REST API, provided by the server side of the system.
- The website should deliver static versions of primary content for search engines to index, but it can load secondary
  content dynamically.
- The system needs to have a concept of *users* that includes both readers and authors, with appropriate rights for
  different levels of access.
- Content on pages needs to be targeted to the current user by matching content ot the user's profile using business
  rules or optimization algorithms.
- The site is under continuous development, because online newspapers are in fierce competition, so new features need
  to be added quickly. These include special short-term mini apps, such as special interactive content for elections.

#### Functional breakdown

- Handle article data and have the expected read, write, and query operations
- Construct content pages and provide a cache for scaling
- Handle user accounts: login, logout, profiles, and so on
- Deliver targeted content and map user identities to appropriate articles

#### Requirements to messages to services

First, requirements are described by messages. The table below provides a mapping of requirements to messages 

| Requirement                | Messages                                                 |
|--                          |--                                                        |
| Article pages              | `build-article, get-article, article-view`               |
| Article list pages         | `build-article-list, list article`                       |
| REST API                   | `get-article, add-article, remove-article, list-article` |
| Static and dynamic content | `article-need, article-collect`                          |
| User management            | `login, logout, register, get-profile`                   |
| Content targeting          | `visitor-need, visitor-collect`                          |
| Special-purpose mini apps  | App-specific                                             |

> Though not necessary here, in large systems, some activities will inevitably share messages. Shared messages should
> be namespaced.

 Finally, messages are organized into services. A diagram of the system is provided below

![](https://drive.google.com/uc?id=1jr4UgsCG5uRFuXsGbFhVUA0iamFPpYyW)

### Microservices are software components

Microservices make excellent software components because they are

- **Encapsulated**: Microservices are individual processes which do not share internals by nature.
- **Reusable**: Microservices are network services that can be called by anyone.
- **Well-defined interfaces**: Microservice messages are well-defined interfaces by design.
- **Composable**: The network flow of messages can be manipulated by other microservices as desired.

## Chapter 3: Messages

### Messages are first class citizens

Traditionally, OO practice has taught us to extract nouns from business requirements to build objects but, it's more
intuitive to express business requirements as activities. Messages are intended to represent activities which is why
they are first class citizens.

#### Synchronous vs. asynchronous

<dl>
  <dt>Synchronous message</dt>
  <dd>
  Originator of the message is blocked until a response is received. Synchronous messages are commands to do something.
  The response is an acknowledgment that something was done.
  </dd>
  <dt>Asynchronous message</dt>
  <dd>
  Originator of the message isn't blocked, can wait for results, and handle scenarios where there are no results.
  Asynchronous messages are events. Subscribers to events are free to choose how they react to the event.
  </dd>
</dl>

### Pattern matching

A large part of complexity in a microservices system is the routing of messages. Pattern matching attempts to
alleviate hat problem by allowing the network architecture to emerge dynamically from the properties of the messages.
Using pattern matching, message routing is reduced to the following steps:

1. Represent the message as key-value pairs (regardless of the actual message data).
1. Map key-value pairs to microservices, using the simplest algorithm you can think of.

#### Case study: sales-tax rules

Suppose an online retailer begins work on calculating sales tax as one part of a general e-commerce solution. When
the user adds a product to their shopping cart, the cart will have an update entry for the total sales tax due.

The retailer decides to model this business requirement with a synchronous `add-product` message that responds with
an updated cart and a synchronous `calculate-sales-tax` message that responds with the gross price.

The properties of the `calculate-sales-tax` make it hard to distinguish between other messages with similar
properties like the `add-product` message. Adding a label to the message (e.g. `label:sales-tax`) utilizes pattern
matching to identify messages.

Pattern matching is also a good way to deal with changing business requirements. For example, suppose a product falls
under one of two different sales tax categories, standard or reduced. A new microservice `sales-tax-reduced` will
handle the reduced sales tax category while `sales-tax` will handle the standard category. Using pattern matching, a
new key-value pair, `category:*` is added to the `calculate-sales-tax` message and routed according to the table
below.

| Pattern | Microservice |
|--|--|
| `label:sales-tax` | `sales-tax` |
| `label:sales-tax,category:standard` | `sales-tax` |
| `label:sales-tax,category:reduced` | `sales-tax-reduced` |

### Message patterns

> The patterns below are categorized using the form *m/n* where *m* is the number of message patterns and *n* is the
> number of microservices (not instances!).

<dl>
<dt>1/2: Request/response</dt>
<dd>

![](https://drive.google.com/uc?id=1itnx6uqidWC4KGHhXbAxLnM3ASeA4Cng)

</dd>
<dt>1/2: Sidewinder</dt>
<dd>

![](https://drive.google.com/uc?id=1Rt7AdI99__XQOo94tnmJjjIWzwq4y6Ga)

</dd>
<dt>1/2: Winner-take-all</dt>
<dd>

![](https://drive.google.com/uc?id=1wRoqhD8Lbi339sMII3uaCuB7kT4I8Hw2)

</dd>
<dt>1/2: Fire-and-forget</dt>
<dd>

![](https://drive.google.com/uc?id=1IjrezGbpMl2E0RVNgaIwjhH_F-9vFoIU)

</dd>
<dt> 2/2: Request/react</dt>
<dd>
Useful when the listener is expected to take a nontrivial amount of time to complete a request.

![](https://drive.google.com/uc?id=1h2O5nmoIFMWCCvp0JCxEvMAgjHZVM-dm)

</dd>
<dt>2/2: Batch progress reporter</dt>
<dd>
Similar to request/react, but a series of reaction messages announce the state of the batch process to subscribing
microservices.

![](https://drive.google.com/uc?id=1ZJocJCkpztoh6jlKUiWG7uyX2qz70NpZ)

</dd>
<dt>1/n: Orchestration</dt>
<dd>
Orchestration microservices can remove the need for a specialist network component to perform this role.

![](https://drive.google.com/uc?id=1jPhuUOyqoGvhZzvfbAdzIxDKfNhLiiYL)

<dt>1/n: Scatter/gather
<dd>
Announce a need and collect results as they come in.

![](https://drive.google.com/uc?id=1kznU2EIh4TsCcro0evfYsDNSHPy-3WwH)

<dt>1/n: Multiversion deployment
<dd>
Duplicate traffic and compare output across versions of a microservice.

![](https://drive.google.com/uc?id=1YdeqyFoDHNfik_XLiljtJtF_ZjyrDwEY)

<dt>1/n: Multi-implementation deployment</dt>
<dd>
Useful for A/B testing features.

![](https://drive.google.com/uc?id=1U0H9pZmLrbpZTvUzBVaYs_1wJKyxHALx)

</dd>
<dt>m/n: Choreography</dt>
<dd>
Typical for actions that are gated by conditions that must be met before further work can be processed.

![](https://drive.google.com/uc?id=1kaZ57Hc4NKs9ZhCeanKGh3V463TSNJM1)

<dt>m/n: Tree</dt>
<dd>
Typical for workflows with parallel choreography.

![](https://drive.google.com/uc?id=1HNhGpoCOniqmQx4yJFYph2-K_ZWO9Kwz)

</dd>
</dl>

### When messages go bad

| Problem                   | Interaction      | Description                                                          | Mitigation                                                                                                                  |
| --                        | --               | --                                                                   | --                                                                                                                          |
| **Slow downstream**       | request/response | B is slow to respond to messages from A                              | Remove B from interaction when it performs below a throughput threshold, giving it time to recover or be replaced.          |
| **Upstream overload**     | request/response | A is generating too much work for B                                  | Have B selectively drop messages from A once B is pushed beyond a load threshold                                            |
| **Lost actions**          | sidewinder       | Changes to A's message content causes either B or listener C to fail | Measure the system while performing updates of A in stages.If system health drops below a threshold, roll back and review.  |
| **Poison messages**       | winner-take-all  | All instances of B crash on a particular message from A              | Place message from A on a dead-letter queue. If A sends a duplicate message, consume and drop it before it gets to B.       |
| **Guaranteed delivery**   | winner-take-all  | Message fails to reach B, unbeknownst to A                           | Prefer a at-least-once message delivery behavior and have a way to deal with duplicate messages.                            |
| **Emergent behavior**     | fire-and-forget  | System contains unexpected messages or message volume                | Have each message contain metadata to identify messages to help trace the flow of messages for debugging.                   |
| **Catastrophic collapse** | fire-and-forget  | Emergent behavior with a feedback loop                               | Progressively bring down parts of the system with a goal of breaking the feedback loop.                                     | 

## Chapter 4: Data

<dl>
  <dt>Data entity</dt>
  <dd>
  A single coherent data type from the perspective of a given system domain with a internal representation subject to
  constraints imposed by the database
  </dd>
</dl>

### Data doesn't mean what you think it means

- **Data is heterogenous, not homogeneous**: Some data is mission critical; other data is useful. Constraints on each
  data entity in a system are different and can favor one data-storage solution over another.
- **Data can be private**: It is an anti-pattern to use the database as a communication mechanism between software
  components. Access to a data entity should be represented by messages rather than a database schema.
- **Data can be local**: Microservices can have their own private database. Local databases make initial development
  smoother. A strategy to synchronize data with the rest of the system can be used as needed later on.
- **Data can be disposable**: Backing up hundreds of microservice database instances isn't necessary. Upgrade a
  database by deploying new instances, not modifying old ones. Important data can be stored on a system of record
  (SOR).
- **Data doesn't have to be accurate**: Different data has different accuracy constraints. Don't waste time when the
  cost of improving accuracy outweighs it's benefits.

### Data strategies for microservices

#### Using messages to expose data

Messages are designed for the sole purpose of preventing the coupling that a shared database creates. This unlocks
the ability to choose and change the database underneath a microservice without breaking other microservices.

####  Using composition to manipulate data

Representing data operations as messages gives you the ability to:
  
- Extend data operations with a well-defined component model. A good example is adding a caching microservice.
- Use alternative data-flow models like asynchronous write and syncronous read operations known as Command Query
  Responsibility Segregation (CQRS).
- Adopt a reactive approach to data operations. More than one microservice can listen to data-operation messages.
- Test microservices easily. You can mock up data operations in unit tests without overhead or dependencies.

#### Using the system configuration to control data

When data operations are represented as messages, yo can scale databases by changing the way the messages are routed. 

For example, the diagram below details a typical deployment sequence for replacing a database shard with zero downtime.

![](https://drive.google.com/uc?id=1_OnNt5AXcHCR3JzXlcaIJ1UiapoTGQHc)

Similarly, you may also want to add to scale up or remove a shard to reduce complexity. The diagram below details the
deployment sequence for splitting a shard.

![](https://drive.google.com/uc?id=1cQsZrmXTNIPB7w95eC3pPWfErLiTHp_8)

#### Using weaker constraints to distribute data

Traditionally, duplicating data in a database is undesired. In a distributed system, duplicating data using
strategies such as *denormalization* can lead to significant performance increases.

<dl>
  <dt>Denormalization</dt>
  <dd>
  Keep a copy of local data entities. At a later time, propagate the local entities to the primary entities using
  methods such as batch process or change-announcement messages. This strategy trades data consistency for
  performance.
  </dd>
</dl>

### Rethinking traditional data patterns

#### Primary keys

- Synthetic keys are preferred, because they can be permanent and avoid the need to modify references.
- GUIDs aren't an automatic choice. Although eminently suited to distributed systems, they have negative effects on
  performance, especially in relation to traditional database indexes.
- You can use integer keys. They can still be unique, but they're weaker than traditional autoincrementing database
  keys.

#### Foreign keys

In the world of distributed databases, JOIN is an operation that cannot be relied on because there is no guarantee
that any given data entities are stored in the same database. There are alternatives to JOIN.

#### Transactions

Database transactions promise to satisfy the ACID (Atomicity, Consistency, Isolation, Durability) properties. While
these properties are nice to have, consider other options such as reservations, which relax these properties for
performance gains.

#### Schemas
 
 Schemas build technical debt. As business requirements change, the original schema is extended so that it doesn't
 break other parts of the system, while other parts of the schema become legacy structures that must be handled in
 the code base.

The microservices architecture approaches this problem as a matter of configuration, directing messages that make old
assumptions to legacy microservices and new messages to new microservices.

## Chapter 5: Deployment

### A model for failure in software systems

- Failure is not an absolute binary condition, but a quantity that can be measured over many iterations. Therefore, it
  is more useful to consider the *failure rate* and define some meaningful threshold that marks success or failure.
- A software system is not as unreliable as it's most unreliable component - it's *much more unreliable*, because other
  dependent components can fail, too.
- Load balancing over multiple instances doesn't give you strong redundancy, it gives you capacity. Redundancy works
  for hardware because hardware eventually breaks. Redundancy does not work for software because software eventually
  works.
- Software systems are not static, they suffer from deployments where several components change simultaneously. This
  strategy is inherently risky and almost always fails. Resolving production issues is equivalent to making another
  deployment attempt.

### Continuous delivery

<dl>
  <dt>Continuous delivery</dt>
  <dd>
  In the microservices context, create a specific version of a microservice and run one or more instances of that
  version in production, on demand.
  </dd>
  <dt>Primitive operation</dt>
  <dd>
  Adding/removing a microservice instance.
  </dd>
  <dt>Microservice artifact</dt>
  <dd>
  A microservice artifact can be a container, a virtual machine image or some other abstraction.
  </dd>
</dl>

A continuous delivery pipeline contains a

- **Version-controlled local development environment** for each service, supported by small and medium tests.
- **Staging environment** to validate the microservice and build, reproducibly, an artifact for deployment. Validation
  is automated but can be manual.
- **Management system** to execute combinations of primitive operations against staging and production.
- **Production environment** constructed from deployed artifacts to the fullest extent possible. It contains a audit
  history of primitive operations, a self-correcting mechanism for dealing with crashes, and a load balancing solution.
- **Monitoring and diagnostics system** that verifies the health of the production system after a primitive operation
  is performed and generates alerts when the system is unhealthy.

#### Pipeline

- The pipeline requires tooling. Do not roll your own tooling; rely on the community first.
- Be able trace all stages of the pipeline.
- Mark and tag the source code so that artifact generation can be *hermetic*.
- Artifacts are *immutable*.

#### Protection

Measure risk at each stage of production.

- In development, the key risk-measuring tools are code reviews and unit tests.
- In staging, measure risk by monitoring message flows.
- Continue to measure risk in production.

### Running a microservice system

#### Immutability

A microservice artifact is *immutable* if it can't be changed internally and it has only two active states: active
and inactive. This preserves the ability to act as primitive operations.

#### Automation

Microservice systems in production contain too many parts to be managed manually.

To determine which task to automate next, divide the tasks into two categories:  

- *Toil* - tasks where human effort grows with at least O(n).  
- *Win* - tasks where human effort grows with less than O(n) 

where n is the number of microservice types. The next task to automate should be the task that most negatively
impacts business goals from the *Toil* category.

#### Validation

Continuous validation is essential to risk reduction and value in a CD pipeline. One valuable measurement is the
ratio of one messages flow-rate to another messages flow-rate.

Deliberately test failure capabilities as a form of insurance. Take small, frequent losses to avoid large,
infrequent, losses that are fatal.

#### Discovery

When microservice A knows that microservice B will receive it's messages, then A is *coupled* to B. Transport
independence hides the mechanism of transportation from A, pattern matching hides the identity of B, and together,
they decouple services.

Decoupled services need some way to discover each other. Some solutions include

- **Intelligent load balancing:** Direct all traffic messages through load balancers that know where to find services.
- **Service registries:** Services register their location with a central registry, and other services look them up.
- **DNS:** Use the DNS protocol to resolve the location of a service.
- **Message bus:** Use a message bus to separate publishers from subscribers.
- **Gossip:** Use a peer-to-peer membership gossip protocol to share service locations.

#### Configuration

Configuration can live immutably with the artifact or dynamically on the network. A total solution for a system will
likely be a hybrid of the two.

Beware two dangerous configuration anti-patterns:

- **Automation workarounds:** Using configuration to code around limitations to automation tooling.
- **Turing's revenge:**  Making a complex configuration language over the course of many extensions to the language.

#### Message security

A common temptation is to to share messages with the outside world; this is dangerous. Keep a separation between 
internal messages and third-party clients. A *demilitarized zone* serves to sanitize input requests as they are 
converted into messages.

Internal messaging uses the network. Consider encrypting messages that are meant to be kept secret.

#### Staging

Staging is the control system for the CD pipeline and is subject to large variance from organization to organization.

Staging is home to the build server and more importantly it is home to subsystems that test the product and collect
statistics for measuring velocity and quality of code delivery over time.

#### Development

The development environment should allow developers to focus on one service at a time for unit-testing as well as small
subsets of the system for larger tests. This should all be done locally, without the help of the build/staging system. 

> If you need to run all, or most, of your services to get any development work done, your are no longer creating 
> microservices; you are creating a distributed monolith. Sufficient time and energy needs to be placed in the 
> messaging abstraction layer and message mocking strategies.

## Chapter 6: Measurement

As a system with many moving parts, measurement becomes more involved. Metrics such as system CPU load and query
response times are not as useful.

Measurement can help

- Validate the business requirements by demonstrating progress.
- Verify and understand the technical function of the system by collecting metrics.
- Manage risk so you can move fast knowing you will have feedback should something break.

<dl>
  <dt>Service Instance</dt>
  <dd>
  Specific operating system process.
  </dd>
  <dt>Service Type</dt>
  <dd>
  Shorthand for a group of service instance that share something in common.
  </dd>
</dl>

### The limits of traditional monitoring

Time-series charts are a common form of measurement for monoliths. For example, it is very easy to capture load at
regular intervals and make sense of the data. For a microservices system with many microservice types and many
instances of each microservice type, time-series charts become noisy. A measurement approach for large numbers of
independent elements is needed.

#### Averages

Averages can be very useful for eliminating noise because they can summarize data. Averages are most useful when you
can be sure that the distribution is not skewed.

For example, response times are not a good application for averages because skewed data can occur and become hidden
behind the average as seen in the image below. The average suggests that users are seeing lower response times after
the implementation of the cache. While it is true for the average user, there are still cases of high response times 
which is likely the cause for complaint.

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

For example, the 90th percentile as shown in the image below is able to correctly detect that cases of high response  
times have only gotten worse after the implementation of the cache while the average did not.

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

#### Scatterplots

Scatter plots are an useful for comparing two quantities at a given point in time. Scatterplots shine when the
quantities are correlated.

For example, you could plot the 90th percentile of response times over the past 24 hours (historical) against the
response times over the past 10 minutes (current). Even If you have hundreds of microservices, it is still easy to
spot outliers.

![](https://drive.google.com/uc?id=1tVQsnY-nkJ6ZRs_QF7cWXuXu0EQQ_ImT)

> Investigate third-party measurement products. It is relatively easy to develop a powerful custom measurement system, 
> using open source analytics such and charting projects.

### Measurements for microservices

#### Business Requirements

Some aspects of business requirements are quantitative and lend them selves to measuring easily. Qualitative business 
requirements may seem un-intuitive to measure but there is generally always a measurement that can be performed to
reduce uncertainty.

A business requirement like "The system should be user-friendly" seems like something that cannot be measured.
However, you can measure indirectly related things like the time it takes for the user to perform
use various use cases. 

#### Measuring messages

Below is a list of measurements that can be collected. For each of the counts, you may wish to tally total, pass, and
fail as separate counts.

- Outbound
  - Message counts
  - Response counts
  - Response time
- Inbound
  - Message counts
  - Message validation counts
  - Response counts
  - Response time

Many useful plots can be derived from these measurements including

- Outbound message counts vs. Outbound response counts
- Outbound response errors vs. Time
- Current outbound response time vs. Historical outbound response time
- Inbound response time vs. Outbound response time

#### Measuring services

Categorical scatter plots are a way to monitor each microservice instance over a fixed time frame; the horizontal
axis represents service instances. To make the data easier to visualize, you can add horizontal jitter. The figure
below is a categorical scatter plot of response times.

![](https://drive.google.com/uc?id=1HIonD6XZoXc0F3MN3WGy9CaB76X-VfX8)

### The power of invariants

<dl>
  <dt>Invariant</dt>
  <dd>
  For any given configuration of message patterns, invariants are ratios of message-flow rates that remain
  the same despite changes to load, services, and network.
  </dd>
</dl>

Invariants typically come in the form of message chains where the traffic of one message is known to cause traffic of
other messages typical of a UML sequence diagram.

![](https://drive.google.com/uc?id=1OMjbZcDdD0D8taQzsfgD0cjbOuqoxHQC)

It is possible to build such sequence diagrams using a distributed tracking system that works by tracking messages
that share the same correlation identifier, a piece of metadata that can be added to messages.

> Distributed tracking systems are expensive. They should only be used to track a small subset of all messages.

## Chapter 7: Migration

Start every project by asking these fundamental questions:

- What is the definition of success?
- What metrics demonstrate success?
- What is the acceptable error rate?
- What are the hard constraints?

> Before diving into migration strategies, take note of the words of wisdom from the author.
> 
> - Success breeds success. Seek any low hanging fruit and achieve some early wins. Be sure to spread word of your 
>   accomplishments.
> - While working with the monolith, you are bound to experience coupling issues. Resist the urge to refactor since it
>   will impede feature delivery and is often irrelevant to the real work you will do later.
> - Resist the urge to rewrite everything from scratch using microservices. This is an underestimate of the business
>   complexity of the monolith and will almost certainly be incapable of replacing the monolith without hitch or fail.

### The strangler tactic

Piece-by-piece, slowly replace the monolith with microservices. This is less risky then chopping the entire thing down.
The replacement process is achieved through *partial proxying* and the result are microservices called 
*strangler proxies*.

#### Partial proxying

1. Install a basic web proxy that captures all external interactions. Start re-implementing individual pages as
   microservices. The proxy can be slow and incomplete with the goal of delivering early.
1. The new microservices need to handle legacy data interaction and talk to the legacy database at first. If you use
   the database as a means of communication with database events, you will need to spend additional time and
   resources to move away from this.

> Removing communication with the database can be very tricky. You may need to isolate data used for communication in a
> separate integration database until the monolith has been further migrated.

### The greenfield tactic

To begin building microservices, you need to spend time at the start of the project putting in place the correct 
infrastructure to develop, deploy and run microservices in production before the completion of your first *strangler 
proxies*. This includes a entire software-delivery pipeline from developer's machines the the continuous delivery 
system, all the way to production.

Wile you are migrating, you still need to keep working on the old monolith to maintain credibility as someone who
can deliver software, especially during the early days of the migration where no microservices have reached production.

### The macroservice tactic

Once the greenfield environment for microservices is successfully completed, you can break the monolith in to seperate 
large pieces. The large pieces are not microservices but they can partially be treated as such because you can subsume 
them in your microservice deployment pipeline.

Provided below are some tips to aid the extraction process:

- Extract only one macroservice at a time to reduce risk of failure.
- Though it was previously advised to not waste time refactoring, refactoring for the purpose of pulling out 
  macroservices is a worthwhile endeavor.
- Extracting macroservices will heavily depend on the strangler proxy(s) to route inbound interactions to the right 
  macroservice.
- Dropping features is always an option.
- Transport independence and pattern matching are important. You should introduce your message-abstraction layer into 
  the macroservices an use it a s the communication layer between them. 
- Avoid creating a separate communication mechanism between macroservices.

Once the macroservices are in place, dependencies of the macroservices should slowly start to shift to microservices
rather than other macroservices.

## Chapter 8: People

### Institutional politics

- **Accept hard constraints:** Identify hard constraints, document them. Constraints can soften when you build trust
  and confidence. 
- **Find sponsors:** Network internally. Find your sponsors and meet them. Ask which format they prefer and feed them
  information.
- **Value-focused delivery:** Business value isn't an abstract concept; it is identification of the measurements that
  closely track the business goals your leadership cares about. Agree to measure, agree about the measurements. Doing so
  will keep everyone honest.
- **Acceptable error rates:** Agree to measure error and come up with measurements. Measure error from the first day of 
  the project, and use the deployment pipeline to manage risk and stay below the error rate.
- **Dropping features:** Identify features that are both complex and offer little value and propose that it be removed.
- **Stop abstracting:** Keep microservices small and default to implementing new features with new microservices. Use 
  pattern matching instead of extending data models.
- **Deprogramming:** Everybody in development suffers from unsubstantiated beliefs. Bu up front and clear that 
  microservices will break some established conventions.
- **Team solidarity:** Do not solve people problems with code. Instead, ask yourself how many code problems you can 
  solve by engaging people. Also measure your team as a whole. Look out for overall happiness, level of recommendation, 
  and happiness with code quality.
- **Respect the organization:** Conway's Law states that, "Any organization that designs a system will produce a design
  whose structure is a copy of the organizations communication structure." Conway's law is a natural force that you can
  use or oppose. Either response may be appropriate.

### Politics of microservices

- **Who owns what:** The best configuration is where any given team member can work on any given microservice. Each
  team member will tend to develop specialties; fight this by encouraging the team to work on code they don't
  understand as a matter of preference.
- **Shared libraries:** There are two types of shared libraries, utility and business logic. Shared business logic is 
  fatal to microservices. Shared business logic should go into a separate microservice and access via message flows.
- **Who's on-call?:** Adopting the DevOps mentality comes with adopting microservices. The development team will need
  to maintain the deployment pipeline and production system on an ongoing basis. One strategy is to rotate each
  develop in the team through an on-call iteration where that developer handles bugs, issues, support, meetings,
  keeps the deployment pipeline healthy, and acts as a point of contact outside the team.
- **Who decides what to code?:** Teams an individual developers tend to Balkanize into antagonistic, isolated domains. 
  This natural tendency is undesirable because the team becomes less flexible and knowledge stop flowing. Here are some 
  tactics to prevent this from happening:
  - Maintain an equilibrium between full automation an strict hierarchy.
  - Everybody codes. Seniors need a time period safe from interruptions where they can work on longer-term work. Group 
    problem solving is more efficient because communication is easy. Politics are fed by lack of shared understanding.
  - Use a power-law distribution where most microservices are written in a dominant language with a long tail of 
    specialized oddities.
  - All developers should participate in understanding the big picture by having discussions about message flows.
  - Make sure the team is aware that their code is ephemeral and transient. Perform A/B testing and business
    experiments by replacing entire microservices; they are small for this purpose.
  - Allow mistakes. Let team members learn from their mistakes an teach members about their mistakes blame free. Do not 
    allow these mistakes to leak outside of the team; maintain trust with the rest of organization.

## Chapter 9: Case study: Nodezoo.com

nodezoo.com is a search engine for Node.js modules. The system provides free text search over the full list of Node.js
modules. The user can also view details about any given module, such as its author and description. The system should
also collect information from other sources, such as Github, and combine it all into an information summary page for
each module.

### Design

#### Requirements

Begin the project ay talking to stakeholders and drafting up a set of business requirements

- *BR1* - The result list for a search should return in at most 1 second, as should the information page.
- *BR2* - The module search should be free text, and the results should be ordered in terms of relevance.
- *BR3* - An information page will show information about a specific module, collected from various sources.
  - *BR3.1* - The initial sources will be <http://npmjs.com> and <http://github.com>. More sources will be added later.
- *BR4* - The system should stay up to date as module updates are published to <http://npmjs.com>, but it doesn't
  need to be real-time and can be delayed up to an hour.

At this point you also need to be clear with stakeholders that delivery will be incremental and fall below production
standard.

Also, you also need to agree with stakeholders what the quantifiable definition of success is. In this case the numbers
are used in the *BR*s.

> With *BR's that contain performance goals, it is easy to spend time worrying about efficiency. Now is not the right 
> time to be thinking about that. Performance gains are about making trade-offs but only after they've shown that they 
> can pay their way.

#### Messages

While resisting the temptation to convert nouns to classes, the next step is to convert the activities talked about in
the *BR*s into messages.

*BR1* is all about performance. To meet this goal, simply do not deploy something that does not meet this goal.

To satisfy *BR2*, we will need a set of messages to describe the search activity. This includes querying a search index
as well as inserting results into the index.

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

`role` is used for the purpose of establishing a namespace and `cmd` designates an action to be performed. The rest of 
of the messages are data that does not need to be fully fleshed out yet. Similarly, `role:search,cmd:search` is
expected to return a response containing search result data. Responses too, are second class and do not need to be
considered at this stage.

*BR3* is about displaying information about a modules. The information contains multiple parts, so we can asynchronously
collect these parts and return the aggregate as a response to a get command. 

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

*BR3.1* implies a set of custom command messages to get information and as a extension, query the third-party service.

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

A duplicate set of messages with `role:github` can be used for the github service.

Finally, *BR4* adds a message to handle module updates. This messages is asynchronous and serves as a event message.

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

- `role:search,cmd:search` is sent when the user enters a search query from the UI. You will need a `web` service to 
  display the search page and send the message. 
- As a response, the receiving `search` service will send back a list of search results.
- The index used by the `search` service is populated by asynchronous `role:search,cmd:insert` messages sent by the `npm`
  service which integrates with <http:///npmjs.com>.

With *search* requirement in *BR2* is satisfied by the system in the diagram below

![](https://drive.google.com/uc?id=1TjPRWeb8hhVigVUOtAzBvouQk9h2rVGn)

- The `web` service is also responsible for displaying module information contained in the response of the 
  `role:info,cmd:get` command in the UI. 
- Upon receipt of the `role:info,cmd:get` command, the `info` service, will collect module information using the 
  scatter/gather approach by emitting the asynchronous `role:info,need:part` message. This message is observed by the
  source integration-services `npm` and `github` which triggers an internal `role:npm/github,cmd:get` message.
- `npm` and `github` will then subsequently emit with the `role:info,collect:part` message once they have collected
  their contribution to the module information.
- `npm` and `github` will also listen for `role:info,event:change` events and trigger a `role:npm/github,cmd:query` 
  message.

> The `role:npm/github,cmd:get/query` messages exist as naturalistic internal messages to support decoupling. Part of
> the reason for doing so is the expectation that complexity will increase in this area later.

With the right performance results, the system is can now satisfy all *BR*s. The complete design is provided in the 
diagram below.

![](https://drive.google.com/uc?id=1XjnsEwmt31seSUBzlc5q_5WBSb9fwtAj)

### Deliver

A implementation of the entire project can be viewed at <https://github.com/nodezoo>. Of particular note is the hands-on
workshop available at <https://github.com/nodezoo/nodezoo-workshop>.

#### Iteration 1: Local development

To build stakeholder trust, it is advisable to have something to demonstrate ASAP. To that end, the game plan is:

1. Get a local development environment up and running.
1. Run a demonstration on a developer machine.
   - Consider a process manager as manually managing services can be tedious.
   - Be able to manual/unit-test any service alone by mocking dependencies.

Developments starts with the `web` service which displays web pages for the UI. Of particular concern is the messaging
layer that is transport independent and supports pattern matching.

To test the service, both manually and with a unit test framework, the `search` and `info` services will need to be 
mocked. This means that the `web` service needs a mechanism to provide it reasonable, canned messages on demand.

The `search` service wraps interactions with a free text search server made available through a web API. If you are 
unable to run the search server locally, you will need to provide a mock response. 

> A lifesaving feature is the ability to send a microservice messages by hand. One such way is to implement a network
> REPL (Read-Eval-Print Loop) that allows you to `telnet` into the service. This feature will be useful in all stages
> all the way through production.

The `info` service is the first service to interact with other services using asynchronous messages. Here, the
transport independence of the message abstraction layer is vital because it allows you to to use a simple simulation
model to get things working in development and a more involved, quality-oriented model in production.

Of course, the `npm` and `github` services will be mocked. You already knew that.

The `npm` service will be the last service needed to provide a demonstration and end the first iteration. On
reflection, you realize that not only do you need flexibility for the query integration with npmjs.org, but you also
need to have flexibility in how you extract JSON data from npm. A new internal `role:npm,cmd:extract` message is
added to the service.

Additionally, the npm data will be stored locally so that you dont need to query npm every time.

> Running all the services manually gets old fast. You can make a quick and dirty shell script or look up a process 
> manager solution.

#### Iteration 2: Testing, staging, and risk measurement

Nodezoo will use a three-stage deployment process: development, staging, and production that follows the following
outline:

1. Create or update a service.
1. Verify message behavior with unit tests.
1. Build and deploy and artifact to the staging environment.
1. Verify that the staged system still works, using integration and performance tests.
1. Build and deploy an artifact to production, but only if the risk of breakage is sufficiently low (measured with a
   scoring system).
1. Verify that the production remains healthy, using a progressive deployment.
1. Repeat multiple times each day.

The sole purpose of the staging system is to measure risk of failure in production. Each version of each service gets a
score to inform a go/no-go decision on deployment. This means that the shortcuts taken in development now need to be 
changed to something suitable for testing readiness for production. Namely,

- Hardcoded ports need to be replaced with a more flexible networking strategies with service-discovery such as DNS or 
  P2P.
- The simulated asynchronous messaging model needs to be replaced with something with a little more complexity.
- Staging scripts no longer need to worry about mocking or simulating message interactions.
- You need a lightweight system geared for ease of maintenance such as a container based infrastructure.

After the staging environment is set up and the services are ready, the team focus's their efforts on the validation 
tests. Validation is performed by sending standard messages to each service. This is already something REPL can do,
it just needs to be extracted into its own service. This service will be invaluable in production too.

In addition to REPL message tests, the two other test categories are unit tests and performance. The performance test 
is a 90th percentile response time for each desired endpoint. Test categories can be weighted according to taste.
 
- Unit tests - 0.3
- REPL tests - 0.4
- Performance tests - 0.3

In this case the REPL tests more adversely affect risk. The final risk score is normalized so that it becomes a number 
between 0 and 100. Should the number ever fall below 95, the deployment of that service is rejected.

#### Iteration 3: The path to production

Production systems automate the delivery of validated artifacts produced by the staging system. Tooling plays a key
part here and many great tools exist to help assist you with production-management. Tooling is quite involved and
falls out of the scope of this book, but using whatever tools you choose, your production automation system should
adhere to these key principles:

- **Immutable units of deployment:** It shouldn’t be possible to modify running units of deployment. You change the
  system by deploying or scaling, not by modifying.
- **Ephemeral units of deployment:** You must work under the assumption that you’ll have high turnover of the units of
  deployment, and that this constant killing and launching won’t be under your control.
- **Scriptable via a well-defined API:** An essential part of automation.
- **Declarative system definition:** The entire system architecture, from networking to storage, from load balancing to
  monitoring, must be something you can describe in code.

#### Iteration 4: Enhancing and adapting

With the deployment workflow in place, we can begin to iterate on the *BR*s to deliver value. 

A good place to start is by adding data sources such as <http://github.com>. The `github` service depends on the `npm`
service for it repository URL. Though it is possible to remove some of the coupling by introducing an abstract
service that `npm` and `github` can use, lets start simple and accept the coupling knowing that pattern matching can
bail us out in the future.

To deploy the service in production, follow the deployment workflow.

Next, lets add a new feature: search field autocomplete. As always, think about the messages first.

- `role:suggest,cmd:suggest` - Responds with a list of suggestions
- `role:suggest,cmd:add` - Adds a search term

Its clear that the `web` service will send the suggest command and it seems appropriate for the `search` service to send
the add command. The `suggest` service will handle these messages.

The deployment strategy starts with the `web` service which will start asking a for search suggestions but can handle a 
complete lack of response. Next is the `search` service. `search` asynchronously emits search terms to the void. This 
changes quickly because the `suggest` service is deployed next.

The system works great except the npm data is stale because it is not listening for module updates. The npm API lets us
listen to a stream of module updates from which a new `update` service can emit a `role:info,event:change` messages
and let the other services (`npm`) do the hard work.

#### Iteration 5: Monitoring and debugging

Monitoring involves the measurement of sever important aspects of the system including

- *Message flow rates* - Each time the user searches, a `role:search,cmd:search` is generated. This message can be used
 to measure the number of searches per second independent of the number of `web` or `search` service instances. 
- *System invariants* - Each time a user searches, a `role:suggest,cmd:add` message is also generated. The ratio of the
  two messages should be 1.
- *Message response times* - The response time of the `role:search,cmd:search` message directly effects the user
  experience. A scatterplot of current vs. historical response times for this message and related messages can
  compare the relative performance impacts recent changes in behavior have on the system. Additionally, a tracing
  system can sample message flows as well.

While monitoring can help reveal that something is amiss in the system, it does not help debug the problem. For this, 
a logging solution and the REPL service are essential. The logging soltion sends logs from every service to a central 
location for indexing and enables the team to search and review logs from the entire system easily. The REPL service 
allows the team to effortlessly send targeted messages to a service manually and review the results.

#### Iteration 6: Scaling and performance

As system load grows, message interactions and the scalability of individual services should be considered:

- **`web`** - It is important to maintain the stateless nature of this service. Doing so allows the ability to handle
  higher loads by adding more instances. As complexity grows the service could be broken down into individual pages 
  and/or API endpoints.
- **`search`** - Stateless wrapper around third-party search.
- **`info`** - This service isn't stateless. It contains a npm cache. It also continuously runs scatter/gather 
  interactions for which everybody needs to talk to the same service or data might end up at the wrong instance. It can
  be scaled vertically by increasing hardware memory. It can be scaled horizontally with pattern matching by adding a 
  per-instance marker property to the scatter/gather messages.
- **`npm` and `github`** - Stateless but have ephemeral data. They can be scaled horizontally by adding more instances.
  Each instance needs to store all the data, increasing data volume. Data volume could then be traded for latency by
  using a external shared database or database shards with pattern matching.
- **`suggest`** - Stateless with in-memory data. If user feedback leans towards stronger autocompletion, the service can
  be swapped out with a stronger implementation.
- **Everything else** - Other than microservices, the system is composed of load balancers, database engines, 
- search engines, deployment and orchestration systems, log-aggregation and -analysis tools, monitoring and alerting, 
- and more. Choosing third-party software can help accelerate development and outsource scaling problems.