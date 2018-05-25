---
tags: 
- architecture
- microservices
---

# The Tao of Microservices

##  Chapter 1: Brave new World

Software development is an art. It isn't predictable enough to be engineering. It isn't rigorous enough to be science.

Unlike art, software has to work.

### The technical debt crisis

<dl>
<dt>Business Logic</dt>
<dd>
Logic that is directly specific to the business goal at hand. It is the representation of your business using the structures of your programming language. The term is suggestive, not prescriptive.
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
Build the minimum set of features that lets you validate your assumptions about a market, and then iterate on those features and assumptions until the product fits the market.
</dd>
</dl>

Suppose a microblogging site has decided on a system that lets users post *entries*, or short pieces of text. The *MVP* includes the following *activities* and associated *messages*

* Posting and entry
	* `post:entry`
	* `info:entry`
* Listing previous entries
	* `store:list,kind:entry`
	* `store:load,kind:entry`
	* `store:save,kind:entry`
	* `store:remove,kind:entry`

> Instead of getting lost in implementation, focus on the messages first and think about interaction.

Once the messages have been fleshed out, they are grouped into sensible *services*. One such implementation is provided in the diagram below.

![](https://drive.google.com/uc?id=15or1k9CkpwEJadWjr9yW_T7tdN-CdLbT)


#### Iteration 1: A search index

In this iteration, a new activity and associated messages are added to the system

* Search through entries
	* `search:insert`
	* `search:query`

The search activity is added into the system as seen in the diagram below

![](https://drive.google.com/uc?id=1hrqvRUuu3rq3zI8_BQtXyINW7FmVPtk0)

> Notice the choice in implementation. *post* could have just as easily sent `search:insert` to *index*. However, doing so would couple *post* to *index*. Additionally, the decision for *index* to convert `info:entry` into `search:insert` messages can be made at runtime to maintain loose coupling.

*index* can be added without any effect to the system. Since a previous version of *front* is already in production, the principle of *additivity* can be applied. Deploy the new version of the *front* service alongside the older version. Since both versions provide the same legacy functionality, nothing is broken. Both versions can used according to taste as the old version is gradually swapped out.

#### Iteration 2: Simple composition

While monitoring the system, suppose *entry-store* exhibits high latency while talking to the database. One possible solution is to implement a cache in a new service, *entry-cache*.

The service captures messages intended for *entry-store*. One such way to capture messages is to add an extra property such as `cache:true` to `store:*` messages. *entry-cache* will take the place of *entry-store* and *entry-store* will act as a fallback only listening to messages with the added property `cache:true`.

*entry-cache* is trivial to introduce into the system but *entry-store* is a bit more complicated and will involve a transition phase. Using the process of *additivity* introduce the new version of *entry-cache* but with a runtime configuration that accepts both `store:*` and `store:*,cache:true` messages. Load-balancing would make it so some messages go strait to *entry-store* while others pass through *entry-cache* first. Once the new functionality proves itself, change the runtime configuration of *entry-store* to only accept `store:*,cache:true` messages.

The system now looks like the diagram below

![](https://drive.google.com/uc?id=1wr5tkpeh8kZFCrSp_nuE37hAC_-dY5pX)

#### Iteration 3: Timelines

Another core activity inside a microblogging framework is users following other users. Following the usual process, the first step is to come up with a set of messages representative of the activity,

* Follow user
	* `follow:user`
	* `follow:list,kind:followers|following`
	* `timeline:insert`
	* `timeline:list`

The naming of the messages suggest two new services, *follow* and *timeline*.

> By now a pattern should be forming, new functionality begets new services. This avoids technical debt by moving complexity into the message-routing configuration and out of the conditional code and intricate data structures.

Similar to the *index* service, we will have the new microservices react to `info:entry` with an orchestration of `follow:list,kind:followers` and `timeline:insert` messages. Instead of making complex routing and workflow rules, it is perfectly reasonable to make a service with the sole purpose of performing this orchestration. We will call this service *fanout*.

The system now looks like the diagram below

![](https://drive.google.com/uc?id=1N6ibwy6TL07WREyFm3WlvUgdD_HR_j0d)

#### Iteration 4: Scaling

The microservices are scaling fine, but the underlying database of *timeline* cannot handle the data volume, and must be split into multiple databases.

One such technique, called *sharding*, assigns each item to a separate database, based on key values in the data. Though sharding can work at the database level, the microservice level is a good choice because it maintains flexibility. The `timeline:*` messages will have added `shard` property.

Adding the new sharding *timeline* microservice to the system looks similar to the process in Iteration 1 by using the principle of additivity. However, the transition will take longer due to batch-transferring the old database into the new database shards.

With that, this case study comes to a close with the final system diagram pictured below

![](https://drive.google.com/uc?id=1mswOZtkR94i8atf_9TRcKL1i78a7B2Rr)

### How the monolith betrays the promise of components

<dl>
<dt>Monolith</dt>
<dd>
Large, object-oriented, body of code that executes in a single process. The Monolith is long-lived, undergoes constant modification and is essential to the health of the business.
</dd>
</dl>

Components in a monolith

* ** have lost encapsulation**: Boundaries between components are weak. Once breached, internals leak into other components.
* **don't deliver on reusability**: After loss of encapsulation, components become difficult to extract and reuse again.
* ** don't have well-defined interfaces**: Although strict, there are too many different ways to interact with an object.
* ** don't compose**: Baring special cases like inheritance and mixins, combining two objects does not create enhanced functionality.

In particular, composition is critical because it helps

* **manage complexity**: Elements of a composition are hidden and inaccessible.
* **minimize shared state**: Components communicate with each other using a stateless model.
* **promote additivity**: Adding functionality does not involve modifying existing components. Instead, new components are added.

### The microservice idea

Microservices are characterized by the following axioms

* **Small**: Components avoid accumulation of technical debt.
* **Distributed**: Components are not constrained to a single process or machine.
* **No privilege**: No components are privileged.
* **Uniform communication**: All components communicate homogeneously.
* **Composition**: Components can be composed from other components.

#### The core technical principles

<dl>
<dt>Transport independence</dt>
<dd>
The ability to move messages from one microservice to another without requiring microservices to know about each other or the underlying message sending infrastructure.
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
Microservices are web servers that offer small REST interfaces. Messages are synchronous HTTP requests and responses. Message content is JSON, XML, etc. Microservices communicate point-to-point or to a load-balancer.
</dd>
<dt>The asynchronous message architecture</dt>
<dd>
Microservices publish messages to one or more message queues and listening microservices retrieve them. Gathering responses is asynchronous. If a response is not produced in time, the application moves on without that content.
</dd>
</dl>

### Monolithic projects vs. microservice projects

#### Monolithic projects

* All members of the software development team must carefully coordinate so as to not block each other. There's only one code base.
* There are too many ways to create dependencies and gather technical debt rapidly.
* Deployment is all or nothing. Mitigating risk with techniques such as *blue-green* deployments costs infrastructure.

#### Microservice projects

* Development of a microservice can and should be completed by one person in one iteration.
* The small size of a microservices increases estimation accuracy.
* The small size of a microservice makes it easier to dispose without large impact on the company.
* Important microservices can be prioritized over less important microservices.
* It is easy to separate business logic from infrastructure.

### Case Study: The digital edition of a newspaper

#### Informal requirements

* The content consists of articles, each of which has its own separate page.
* There are also special article-listing pages, such as the front page, and special-interest sections.
* The website, tablet, and app versions should all use a common REST API, provided by the server side of the system.
* The website should deliver static versions of primary content for search engines to index, but it can load secondary content dynamically.
* The system needs to have a concept of *users* that includes both readers and authors, with appropriate rights for different levels of access.
* Content on pages needs to be targeted to the current user by matching content ot the user's profile using business rules or optimization algorithms.
* The site is under continuous development, because online newspapers are in fierce compitition, so new features need to be asdded quickly. These include special short-term mini apps, such as special interactive content for elections.

#### Functional breakdown

* Handle article data and have the expected read, write, and query operations
* Cnstruct content pages and provide a cache for scaling
* Handle user accounts: login, logout, profiles, and so on
* Deliver targeted content and map user indentities to appropriate articles

#### Requirements to messages to services

First, requirements are described by messages. The table below provides a mapping of requirements to messages 

| Requirement | Messages |
|--|--|
| Article pages | `build-article, get-article, article-view` |
| Article list pages | `build-article-list, list article` |
| REST API | `get-article, add-article, remove-article, list-article` |
| Static and dynamic content | `article-need, article-collect` |
| User management | `login, logout, register, get-profile` |
| Content targeting | `visitor-need, visitor-collect` |
| Special-purpose mini apps | App-specific |

> Though not necessary here, in large systems, some activities will inevitably share messages. Shared messages should be namespaced.

 Finally, messages are organized into services. A diagram of the system is provided below

![](https://drive.google.com/uc?id=1jr4UgsCG5uRFuXsGbFhVUA0iamFPpYyW)

### Microservices are software components

Microservices make excellent software components because they are

* **Encapsulated**: Microservices are individual processes which do not share internals by nature.
* **Reusable**: Microservices are network services that can be called by anyone.
* **Well-defined interfaces**: Microservice messages are well-defined interfaces by design.
* **Composable**: The network flow of messages can be manipulated by other microservices as desired.

## Chapter 3: Messages

### Messages are first class citizens

Traditionally, OO practice has taught us to extract nouns from business requirements to build objects but, it's more intuitive to express buisiness requirements as activities. Messages are intended to represent activities which is why they are first class citizens.

#### Synchronous vs. asynchronous

<dl>
<dt>Synchronous message</dt>
<dd>
Originator of the message is blocked until a response is received. Synchronous messages are commands to do something. The response is an acknowledgment that something was done.
</dd>
<dt>Asynchronous message</dt>
<dd>
Originator of the message isn't blocked, can wait for results, and handle scenarios where there are no results. Asynchronous messages are events. Subscribers to events are free to choose how they react to the event.
</dd>
</dl>

### Pattern matching

A large part of complexity in a microservices system is the routing of messages. Pattern matching attemps to aleviate hat problem by allowing the network architecture to emerge dynamically from the properties of the messages. Using patern matching, message routing is reduced to the following steps:

1. Represent the message as key-value pairs (regardless of the actual message data).
2. Map key-value pairs to microservices, using the simplest algorithm you can think of.

#### Case study: sales-tax rules

Suppose an online retailer begins work on calculating sales tax as one part of a general e-commerce solution. When the user adds a product to their shopping cart, the cart will have an update entry for the total sales tax due.

The retailer decides to model this business requirement with a synchronous `add-product` message that responds with an updated cart and a synchronous `calculate-sales-tax` message that responds with the gross price.

The properties of the `calculate-sales-tax` make it hard to distinguish between other messages with similar properties like the `add-product` message. Adding a label to the message (e.g. `label:sales-tax`) utilizes pattern matching to identify messages. 

Pattern matching is also a good way to deal with changing business requirements. For example, suppose a product falls under one of two different sales tax categories, standard or reduced. A new microservice `sales-tax-reduced` will handle the reduced sales tax category while `sales-tax` will handle the standard category. Using pattern matching, a new key-value pair, `category:*` is added to the `calculate-sales-tax` message and routed according to the table below.

| Pattern | Microservice |
|--|--|
| `label:sales-tax` | `sales-tax` |
| `label:sales-tax,category:standard` | `sales-tax` |
| `label:sales-tax,category:reduced` | `sales-tax-reduced` |

### Message patterns

> The patterns below are categorized using the form *m/n* where *m* is the number of message patterns and *n* is the number of microservices (not instances!).

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
Similar to request/react, but a series of reaction messages announce the state of the batch process to subscribing microservices.

![](https://drive.google.com/uc?id=1ZJocJCkpztoh6jlKUiWG7uyX2qz70NpZ)

</dd>
<dt>1/n: Orchestra</dt>
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

| Problem | Interaction | Description | Mitigation |
|--|--|--|--|
| **Slow downstream** | request/response | B is slow to respond to messages from A | Remove B from interaction when it performs below a throughput threshold, giving it time to recover or be replaced. |
| **Upstream overload** | request/response | A is generating too much work for B | Have B selectively drop messages from A once B is pushed beyond a load threshold |
| **Lost actions** | sidewinder | Changes to A's message content causes either B or listener C to fail | Measure the system while performing updates of A in stages.If system health drops below a threshold, roll back and review. |
| **Poison messages** | winner-take-all | All instances of B crash on a particular message from A | Place message from A on a dead-letter queue. If A sends a duplicate message, consume and drop it before it gets to B. |
| **Guaranteed delivery** | winner-take-all | Message fails to reach B, unbeknownst to A | Prefer a at-least-once message delivery behavior and have a way to deal with duplicate messages. |
| **Emergent behavior** | fire-and-forget | System contains unexpected messages or message volume | Have each message contain metadata to identify messages to help trace the flow of messages for debugging. |
| **Catastrophic colapse** | fire-and-forget | Emergent behavior with a feedback loop | Progressively bring down parts of the system with a goal of breaking the feedback loop. |    

## Chapter 4: Data

<dl>
<dt>Data entity</dt>
<dd>
A single coherent data type from the perspective of a given system domain with a internal representation subject to constraints imposed by the database
</dd>
</dl>

### Data doesn't mean what you think it means

* **Data is heterogenous, not homogeneous**: Some data is mission critical; other data is useful. Constraints on each data entity in a system are different and can favor one data-storage solution over another.
* **Data can be private**: It is an anti-pattern to use the database as a communication mechanism between software components. Access to a data entity should be represented by messages rather than a database schema.
* **Data can be local**: Microservices can have their own private database. Local databases make initial development smoother. A strategy to synchronize data with the rest of the system can be used as needed later on.
* **Data can be disposable**: Backing up hundreds of microservice database instances isn't necessary. Upgrade a database by deploying new instances, not modifying old ones. Important data can be stored on a system of record (SOR).
* **Data doesn't have to be accurate**: Different data has different accuracy constraints. Don't waste time when the cost of improving accuracy outweighs it't benefits. 

### Data strategies for microservices

#### Using messages to expose data

Messages are designed for the sole purpose of preventing the coupling that a shared database creates. This unlocks the ability to choose and change the database underneath a microservice without breaking other microservices.

####  Using composition to manipulate data

Representing data operations as messages gives you the ability to:
	
*   Extend data operations with a well-defined component model. A good example is adding a caching microservice.
* Use alternative data-flow models like asynchronous write and syncronous read operations known as Command Query Responsibility Segregation (CQRS).
* Adopt a reactive approach to data operations. More than one microservice can listen to data-operation messages.
* Test microservices easily. You can mock up data operations in unit tests without overhead or dependencies.

#### Using the system configuration to control data

When data operations are represented as messages, yo can scale databases by changing the way the messages are routed. 

For example, the diagram below details a typical deployment sequence for replacing a database shard with zero downtime.

![](https://drive.google.com/uc?id=1_OnNt5AXcHCR3JzXlcaIJ1UiapoTGQHc)

Similarly, you may also want to add to scale up or remove a shard to reduce complexity. The diagram below details the deployment sequence for spliting a shard.

![](https://drive.google.com/uc?id=1cQsZrmXTNIPB7w95eC3pPWfErLiTHp_8)

#### Using weaker constraints to distribute data

Traditionaly, duplicating data in a database is undesired. In a distributed system, duplicating data using strategies such as *denormalization* can lead to significant performance increases. 

<dl>
<dt>Denormalization</dt>
<dd>
Keep a copy of local data entities. At a later time, propagate the local entities to the primary entities using methods such as batch process or change-announcement messages. This strategy trades data consistency for performance.
</dd>

### Rethinking traditional data patterns

#### Primary keys

* Synthetic keys are preferred, because they can be permanent and avoid the need to modify references.
* GUIDs aren't an automatic choice. Although eminently suited to distributed systems, they have negative effects on performance, especially in relation to traditional database indexes.
* You can use integer keys. They can still be unique, but they're weaker than traditional autoincrementing database keys.

#### Foreign keys

In the world of distributed databases, JOIN is an operation that cannot be relied on because there is no guarentee that any given data entities are stored in the same database. There are alturnative to JOIN.

#### Transactions

Database transactions promise to satisfy the ACID (Atomicity, Consistency, Isolation, Durability) properties. While these properties are nice to have, consider other options such as reservations, which relax these properties for performance gains.

#### Schemas
 
 Schemas build technical debt. As business requirements change, the original schema is extended so that it doesn't break other parts of the system, while other parts of the schema become legacy structures that must be handled in the code base.

The microservices architecture approaches this problem as a matter of configuration, directing messages that make old assumtions to legacy microservices and new messages to new microservices.

## Chapter 5: Deployment

### A model for failure in software systems

* Failure is not an absolute binary condition, but a quantity that can be measured over many iterations. Therefore, it is more useful to consider the *failure rate* and define some meaningful threshold that marks success or failure.
* A software system is not as unreliable as it's most unreliable component - it's *much more unreliable*, because other dependent components can fail, too.
* Load balancing over multiple instances doesn't give you strong redundancy, it gives you capacity. Redundancy works for hardware because hardware eventually breaks. Redundancy does not work for software because software eventually works.
* Software systems are not static, they suffer from deployments where several components change simultaneously. This strategy is inherently risky and almost always fails. Resolving production issues is equivalent to making another deployment attempt.

### Continuous delivery

<dl>
<dt>Continuous delivery</dt>
<dd>
In the microservices context, create a specific version of a microservice and run one or more instances of that version in production, on demand.
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

* **Version-controlled local development environment** for each service, supported by small and medium tests.
* **Staging environment** to validate the microservice and build, reproducibly, an artifact for deployment. Validation is automated but can be manual.
* **Management system** to execute combinations of primitive operations against staging and production.
* **Production environment** constructed from deployed artifacts to the fullest extent possible. It contains a audit history of primitive operations, a self-correcting mechanism for dealing with crashes, and a load balancing solution.
* **Monitoring and diagnostics system** that verifies the health of the production system after a primitive operation is performed and generates alerts when the system is unhealthy.

#### Pipeline

* The pipeline requires tooling. Do not roll your own tooling; rely on the community first.
* Be able trace all stages of the pipeline.
* Mark and tag the source code so that artifact generation can be *hermetic*.
* Artifacts are *immutable*.

#### Protection

Measure risk at each stage of production.

* In development, the key risk-measuring tools are code reviews and unit tests.
* In staging, measure risk by monitoring message flows.
* Continue to measure risk in production.

### Running a microservice system

#### Immutability

A microservice artifact is *immutible* if it can't be changed internally and it has only two active states: active and inactive. This preserves the ability to act as primitive operations.

#### Automation

Microservice systems in production contain too many parts to be managed manually.

To determine which task to automate next, divide the tasks into two categories:  
* *Toil* - tasks where human effort grows with at least O(n).  
* *Win* - tasks where human effort grows with less than O(n) 

where n is the number of microservice types. The next task to automate should be the task that most negatively impacts business goals from the *Toil* category.

#### Validation

Continuous validation is essential to risk reduction and value in a CD pipeline. One valuable measurement is the ratio of one messages flow-rate to another messages flow-rate.

Deliberately test failure capabilities as a form of insurance. Take small, frequent losses to avoid large, infrequent, losses that are fatal.

#### Discovery

When microservice A knows that microservice B will receive it's messages, then A is *coupled* to B. Transport independence hides the mechanism of transportation from A, pattern matching hides the identity of B, and together, they decouple services.

Decoupled services need some way to discover each other. Some solutions include

* **Intelligent load balancing:** Direct all traffic messages through load balancers that know where to find services.
* **Service registries:** Services register their location with a central registry, and other services look them up.
* **DNS:** Use the DNS protocol to resolve the location of a service.
* **Message bus:** Use a message bus to separate publishers from subscribers.
* **Gossip:** Use a peer-to-peer membership gossip protocol to share service locations.

#### Configuration

Configuration can live immutably with the artifact or dynamically on the network. A total solution for a system will likely be a hybrid of the two.

Beware two dangerous configuration anti-patterns:

* **Automation workarounds:** Using configuration to code around limitations to automation tooling.
* **Turing's revenge:**  Making a complex configuration language over the course of many extensions to the language.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE0MzIzNjA0MzUsLTE2NjIzODA5NTcsLT
U3MjA1Njg4MiwtNzU5MDAwNjUsLTE2NTc2NjE4MTIsLTI2NTQz
NzczLC0yMjgxNDUwNCwtMTg4MzQ4MzMyLC0xMDgxODQ3ODQwLD
EzMzg2NTU0NywxMTA3MDgyMDMzLDEwNzQzMjc2ODAsLTE3MDU0
NTM4MjQsMjExNjIzNDQwMywtMTcxMTQyNDUzNSwtMjAyMTgwNj
U5NCwxMzI1MzA4NjcyLC0yMDIzMjYyMDAxLC0xMTIzNDgyMjIw
LDEyMTgyNjkyMzVdfQ==
-->