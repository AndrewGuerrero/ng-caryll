# Building Evolutionary Architectures

*2017 Neal Ford, Rebecca Parsons, Patrick Kua*

Read the book [here](http://shop.oreilly.com/product/0636920080237.do).

## Software Architecture

|                               |                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| **Evolutionary Architecture** | Software architecture that supports guided, incremental change across multiple *dimension*s. |

### Guided Change

|                      |                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fitness Function** | An objective integrity assessment of some architectural characteristics.                                                                                      |
| **Dimension**        | Perspectives of an architecture. Often, only the technical perspective of architecture is considered. However, architecture is complex and multi-dimensional. |
| **Requirement**      | Abstract nouns that are considered core to a project such as security, agility, flexibility, scalability, etc.                                                |

### Many Architectural Dimensions
 
Architecture is not a single concept. It's composed of *requirements* and *dimensions*
protected by *fitness functions*. Common categories for *dimension*s found in modern software architectures
include:

- **Technical** - The implementation parts of the architecture such as frameworks, dependent libraries, and
  implementation languages.
- **Data** - Database schema, table layouts, optimization planning, etc. The database administrator generally
  handles this style of architecture.
- **Security** - Security policies, guidelines, and specifies tools to help uncover deficiencies.
- **Operational/System** - Concerns how the architecture maps to existing physical and/or virtual
  infrastructure. Examples include servers, machine clusters, switches, cloud resources, etc.


### Conway's Law

> Organizations which design systems... are constrained to produce designs which are copies of the communication
> structures of these organizations.  *--Melvin Conway* 

In other words, it's hard for a person to change something if that thing is owned by someone else. 

> Structure teams to look like your target architecture.

## Orthogonality

*Dimensions* are not always orthogonal; it's likely impossible to fully optimize an architecture; the 
architect will be forced to make a trade-off. In these situations, it's necessary to consider *system-wide 
fitness function*s.

|                                  |                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **System-wide Fitness Function** | A set of guidelines comparing a collection of *fitness function*s against one another. |

### Categories

|                     |                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------- |
| **Atomic**          | Run against a singular context and exercises one particular *dimension* of the architecture. |
| **Holistic**        | Run against a shared context and exercises a combination of architectural *dimension*s.      |
| **Triggered**       | Run based on a particular event.                                                             |
| **Continual**       | Run constantly.                                                                              |
| **Temporal**        | Run on a scheduled basis.                                                                    |
| **Static**          | Result relies on a fixed enumeration.                                                        |
| **Dynamic**         | Result relies on a shifting definition based on extra content.                               |
| **Automated**       | Run without reliance on human interaction.                                                   |
| **Manual**          | Run with reliance on human interaction.                                                      |
| **Intentional**     | Created during project inception.                                                            |
| **Emergent**        | Created during project development.                                                          |
| **Domain-specific** | Created as a unique consequence of business requirements.                                    |

### Find Fitness Functions Early

*Dimensions* can be classified into three simple categories to distinguish priority:

- **Key**: *dimension*s that are critical in making technology or design choices.
- **Relevant**: *dimension*s that are considered at the feature level but are unlikely to guide architecture 
  choices.
- **Not relevant**: Design and technology choices that are not affected by these *dimension*s.

Teams that have not found their *fitness function*s face the following risks:

- Making the wrong design choices that ultimately lead to building software that fails in it's environment.
- Making design choices that cost time and/or money, but are unnecessary.
- Not being able to evolve the system easily in the future when the environment changes.

### Review Fitness Functions

*Fitness functions* must evolve with the architecture. Key events in a lifetime of a business should trigger a 
review.

A review should include:

- Reviewing existing *fitness function*s.
- Checking the relevance of the current *fitness function*s.
- Determining the change in scale or size of each *fitness function*.
- Deciding on better approaches for measuring or testing the system's *fitness function*s.
- Discovering new *fitness function*s that the system might need to support.

> Review your *fitness function*s at least once a year.

## Engineering Incremental Change

*Incremental change* can be categorized into two aspects:

- **Development**: How developers build software.
- **Operation**: How teams deploy software.

### Development

We live in a 4D world. When an architect models an architecture in 2D using boxes and arrows, that architect is only
taking the first step. Once the design proves itself in a real environment using real software, the model becomes 3D.
Finally, once the architecture withstands upgrade and inevitable change, the model becomes 4D.

> Architecture is abstract until it produces a product and becomes a living thing.

#### Testability

Prefer building tests and metrics to catch architecture violations by using strict development guidelines (and 
bureaucratic scolding).

> Dependency analysis tools like [JDepend](https://github.com/clarkware/jdepend) can help control the coupling 
> between components.

### Operation

|                         |                                                                                                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deployment Pipeline** | Continuous integration is a well-known agile practice that encourages developers to integrate as early as possible. A *deployment pipeline* broadens the scope of this practice to verify production readiness including the application of *fitness function*s. |

> Open source tools like [GoCD](https://www.go.cd) help build *deployment pipeline*s.
> 
> A typical *deployment pipeline* builds the deployment environment in a container like 
> [Docker](https://www.docker.com) or a bespoke environment generated by a tool like 
> [Puppet](https://puppet.com) or [Chef](https://www.chef.io/chef).

#### Conflicting goals

Less effort is required to fix a problem if the developer can detect them sooner. One of the side effects of broadly
considering all the *dimension*s in software architecture is the early identification of goals that conflict across
*dimension*s.

Using architectural *dimension*s as a technique for identifying portions of concern in architecture, and *fitness 
function*s to test them, allows an apples-to-apples comparison, making the prioritization exercise more 
informed.

#### Hypothesis and Data-Driven Development

|                                   |                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data-driven development**       | Allow data to drive change and focus efforts on technical change.                                                                                                                          |
| **Hypothesis-driven development** | Use the scientific method on features. Describe a feature as a hypothesis, run experiments via A/B testing, and measure user decisions to inform whether the feature is beneficial or not. |

Agile development software methodologies incorporate nested feedback loops such as testing, continuous 
integration, iterations, etc. Yet, feedback loops that incorporate the ultimate users of the application continue to
elude teams. *Hypothesis-driven development* is a way to silently collect important feature-driving data without
annoying users with surveys.

#### Case Studies

- [GitHub: Move Fast and Fix Things](http://githubengineering.com/move-fast/) - GitHub has long used a shell 
  script wrapped around command-line Git to handle merges. To increase scalability, GitHub replaced the script with
  ``libgit2``. GitHub also open-sourced [Scientist](https://github.com/github/scientist):
  a framework that provides *holistic, continual* testing to vet changes to the code.
- [Facebook: The Trust Engineers](http://www.radiolab.org/story/trust-engineers/) - In the week between Christmas
  2013 and New Year's Day 2014 more than a million photos were flagged as offensive. Needless to say, Facebook was 
  severely understaffed. To solve the issue, Facebook ran experiments on users to find out why so many 
  photos were flagged as offensive. Facebook found that many offensive photos were false positives due to quirks 
  of human psychology.
- [mobile.de: Hypothesis-driven UX design](http://bit.ly/hypothesis-driven-ux-design) - A success case of 
  *hypothesis-driven development*, mobile.de created three distinct user interfaces and let the customers decide which
  design to go with.

## Architectural Coupling

|               |                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **Module**    | A logical grouping.                                                                                 |
| **Component** | A physical partition.                                                                               |
| **Quantum**   | The smallest deployable unit that includes all the facilities required to function, including data. |

![](https://drive.google.com/uc?id=1ZZTuZPNES8vdvtG-UhN57lA7A4jCMrEl)

### Evolvability of Architectural Styles

#### Big Ball of Mud

- Architecture that has degenerated into an *antipattern*.
- Change is difficult and expensive because every part depends on every other part.

#### Unstructured Monolith

![](https://drive.google.com/uc?id=1FmlNio4Wy_lPjr5hqP5wFNTtsNSYV3SG)

- Lack of structure means that it's only a matter of time before this architecture degenerates into a Big Ball of
Mud.

#### Layered Monolith

![](https://drive.google.com/uc?id=16jqIG2QXQ4AVVmmxyxd3o8Va1oQeBGjR)

- Layers offer *isolation* and *separation of concerns*. 
- Low coupling between layers makes each layer easier to test in isolation.
- High coupling exists between *component*s within the layer.

#### Modular Monolith

![](https://drive.google.com/uc?id=1uK9SIvJTzS7azyOAtLP21V1Fch4UlXcz)

- Requires good discipline on coupling to prevent degeneration into a Big Ball of Mud. 
- The degree of deployability of the *component*s determines the rate of incremental change.

#### Microkernel Monolith

![](https://drive.google.com/uc?id=1lD6qEkiHCE0iLuWXM5RZT6obGG0TNNzC)

- The core is stable so that future development comes in the form of plugins. 
- Semantic coupling between plugins and the core can become challenging evolve. 
- If plugins become dependent on other plugins, coupling becomes even more challenging. 
- *Holistic fitness function*s should be used to make sure contracts and messages are consistent.

#### Broker Event-Driven

![](https://drive.google.com/uc?id=10L0xh4Xx3aGSiJ9ZJDBG-XBuUclIdO-_)

- Provides low coupling between *module*s. 
- *Atomic fitness function*s are easier to develop while *holistic fitness function*s are harder to develop.

#### Mediator Event-Driven

![](https://drive.google.com/uc?id=1c6X3LPCe8nMl8eSqAaW7T3Il604SgO2M)

- Compared to the Broker, the mediator makes creating *holistic fitness function*s easier at the expense of reduced 
coupling.

#### ESB-driven SOA

![](https://drive.google.com/uc?id=1hE0fcinLZgxO6Rg5T-kT5kfEOYVgFCe2)

- Unsuitable for evolution.
- Encourages *code reuse abuse*. 
- Common changes need large amounts or coordination. 
- *Atomic fitness function*s are almost impossible to create, forcing all testing to be *holistic*. 

#### Microservices SOA

![](https://drive.google.com/uc?id=1ytCc5bpBcucJZx_QS4r_Y73JXSKgBZa1)

- Each service is physically separate allowing for maximal decoupling and evolution potential. 
- *Atomic* and *holistic fitness function*s are easy to create and critical to the success of the architecture. 
- Recent advancements in the *deployment pipeline* make this architecture possible.

#### Serverless Service-Based

![](https://drive.google.com/uc?id=1ByRYxxwBdYyAC-vkucALgSK8aoJyOy5x)

- Shares many evolutionary similarities with the Microservices architecture. 
- Serverless architectures are capable of eliminating entire *dimension*s away from concern. 
- *Holistic fitness functions* are critical to maintaining consistency between services.

> Make sure your architecture matches the problem domain. Don't try to force fit an unsuitable architecture.
 
> The smaller your architectural *quanta*, the more evolvable your architecture will be.

## Evolutionary Data

The key to evolving database design lies in evolving schemas alongside the code.

### Shared Database Integration

When many applications share the same relational database, it's easy to make breaking change. The *expand/contract
pattern* is a common technique to deal with this problem.

|                             |                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expand/contract pattern** | Support both schemas for a period of time while all dependent applications migrate to the new schema. When ready, remove support for the old schema. |

### Inappropriate Data Coupling

While systems typically cannot avoid database transactions, architects should try to limit transactional contexts
as much as possible because they form a tight coupling knot with the code.

> Database transactions act as a strong nuclear force, binding *quanta* together.

### Age and Quality of Data

Keeping legacy data around encourages poor structuring which becomes increasingly difficult to refactor as the 
codebase continues to evolve.

> Refusing to refactor schemas or drop old data couples your architecture to the past.

## Building Evolvable Architectures

*Evolutionary architecture* can be realized in three steps:

1. **Find Dimensions Affected by Evolution**: Be sure to involve all interested teams within the organization.
   Keep a living document (such as a wiki) as documentation on which *dimension*s deserve ongoing attention.
1. **Define Fitness Function(s) for Each Dimension**: For each *dimension*, decide what parts may show 
   undesirable behavior while evolving. Define *fitness function*s for these parts. This step requires ingenuity.
1. **Use Deployment Pipelines to Automate Fitness Functions**: Define stages in the pipeline to apply *fitness 
   function*s and deployment practices. Keep an eye on *Cycle Time* since it's proportional to the velocity of 
   new generations appearing in an architecture.

### Retrofitting Existing Architecture

#### Proper Coupling and Cohesion

*Component* coupling largely determines the evolvability of an architecture. In contrast, functional cohesion
determines the ultimate granularity of restructured *component*s; taking decoupling to the
extreme will jeopardize cohesion.

> Understand the business problem before choosing an architectural style.

#### Engineering Practices

- Continuous delivery and continuous integration are essential for evolution. 
- *Manual* stages in the pipeline are perfectly okay. Incrementally work towards automating them as needed.
- The largest common impediment to building *evolutionary architecture* is intractable operations.

#### Fitness Functions

*Fitness function*s allow equal treatment for formerly disparate concerns; any architectural verification is 
considered a *fitness function*.

### Migrating Architectures

#### Migration steps

A common direction of migration is from monolithic to service-based architectures. When decomposing a monolithic 
architecture, finding service granularity that maximizes cohesion is key.

> Don't build an architecture just because it will be fun meta-work.

#### Evolving Module Interactions

For monolithic architectures, it's common for a collection of *module*s to share another *module*.

![](https://drive.google.com/uc?id=1LHkyVWLFmXtpjCgREjNF1XZeGh6DEJ31)

When migrating to a service-based architecture sharing *module*s introduces a kind of coupling that is strongly
discouraged. If the developer is lucky, the *module* can be cleanly split down the middle.

![](https://drive.google.com/uc?id=1q-LEY5GaMLOY-Sn3bxEAD1PlhLVH_VAU)

Otherwise, the *module* should be duplicated.

![](https://drive.google.com/uc?id=1nynBFLMiYKljef0oWnj9AUiFtwD88I-M)

### Guidelines for Building Evolutionary Architectures

- **Remove needless variability** - Keep unknowns under as much control as possible by making dynamic parts 
  constants; a parts constants can be tweaked by replacing or re-configuring the entire part.
- **Make decisions reversible** - One aspect of evolvability is dealing with the unknown. Be able to go back should a
  failure occur.
- **Prefer evolvable over predictable** - Evolvability, and the underlying agile processes it entails, come from the
  need to recover from unknown unknowns.
- **Build anticorruption layers** - Offer a layer of insulation around *component*s not under your control. This 
  means wrapping a third-party library in an abstraction layer. When the time comes, it should be easy to abandon 
  the third party library, possibly swapping it out for another.
- **Build sacrificial architectures** - Growth, a side-effect of success, empirically dictates an inevitable need 
  to throw away perfectly functioning code. Building sacrificial architecture means employing good engineering 
  practices, like *anticorruption layers*, to mitigate the pains of migrating.
- **Mitigate external change** - Set up an internal version-control repository to act as a third-party *component*
  store, and treat changes from the outside world as pull requests to that repository. For each request, 
  the *deployment pipeline* performs a build and then smoke tests the affected applications. Upon success, the 
  change can be allowed into the ecosystem.
- **Updating libraries versus frameworks** - Frameworks call your code; your code calls a library. Due to 
  these differences in coupling, strive to update framework dependencies aggressively and update libraries 
  passively.
- **Prefer continuous delivery to snapshots** - Developers should introduce two designations for external 
  dependencies: *fluid* and *guarded*. *Fluid* dependencies should always try to automatically update themselves.
  If the *deployment pipeline* encounters a problem, the dependency is flagged as *guarded* meaning it cannot be 
  updated further. Once a developer determines and fixes the problem, the dependency goes back to *fluid*.
- **Version services internally** - Severely limit the number of supported versions. More versions means more 
  engineering burden. Strive to support only two versions at a time, and only temporarily.

### Case Studies

- [Trash Your Servers and Burn Your Code: Immutable Infrastructure and Disposable Components](http://chadfowler.com/2013/06/23/immutable-deployments.html) -
  Reliance on handcrafted DevOps infrastructure is a good example of *needless variability*. The solution in this
  article, coined immutable infrastructure, sounds like the opposite of evolvable. In fact, the opposite is true. It's 
  the act of removing needless variables.
- [Knightmare: A DevOps Cautionary Tale](http://dougseven.com/2014/04/17/knightmare-a-devops-cautionary-tale) - 
  Another example of *removing needless variability* applied to the *deployment pipeline* in an automation scenario
  where a toggle feature didn't completely toggle.
- [Sacrificial Architecture](https://martinfowler.com/bliki/SacrificialArchitecture.html) - Formal definition of 
  *sacrificial architecture* formulated from studying the actions of eBay and Google.

## Evolutionary Architecture Pitfalls and Antipatterns

|                 |                                                                     |
| --------------- | ------------------------------------------------------------------- |
| **Antipattern** | Looks like a good idea, but in hindsight turns out to be a mistake. |
| **Pitfall**     | Looks like a good idea, but immediately turns out to be a mistake.  |

### Antipatterns

|                              |                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vendor King**              | An architecture built around a vendor product that pathologically couples the organization to a tool. Avoid *vendor king*s. If unavoidable, treat the *vendor king* as an integration point, making it easy to dethrone the king.                                                                            |
| **Last 10% Trap**            | A tool, framework, or specialized language that while easy to use, only takes you 90% of the way to the providing solutions to all of the client's needs. General purpose languages don't suffer from this *antipattern*.                                                                                    |
| **Code Reuse Abuse**         | Code reuse introduces more coupling to the code as it gets reused. Once the coupling points conflict with the  goals of the architecture, code reuse becomes a liability. At that time, break the coupling with forking or duplication. *Fitness function*s should be able to evaluate when that time comes. |
| **Inappropriate Governance** | A governance model that values a single technology stack which is overly complex and tries to solve all the problems. Instead, split the problems up and use a technology stack that is most suitable for solving each problem individually.                                                                 |
| **Reporting**                | A good example of inadvertent coupling is when architects want to use the same database schema for both system-of-record and *reporting*. They encounter problems because the design for both is optimized for neither. To avoid conflicting business goals, keep *reporting* as isolated as possible.       |

### Pitfalls

|                               |                                                                                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Leaky Abstractions**        | A breaking abstraction at a low level causes unexpected havoc. This is a side effect of increasing complexity in the technology stack. Understand fragile places within your complex technology stack and automate protections via *fitness function*s.     |
| **Resume-Driven Development** | Utilizing every framework and library possible to tout that knowledge on a resume. Remember, you are trying to solve a problem, not play with shiny new toys.                                                                                               |
| **Lack of Speed to Release**  | The velocity of a company is proportional to it's cycle time. Developers cannot evolve the system any faster than the projects cycle time. Good engineering, deployment, and release practices are critical to success with an *evolutionary architecture*. |
| **Product Customization**     | Customized software comes at a cost. Though not to be discouraged, customization does impede evolvability so it's important to realistically assess the associated costs.                                                                                   |
| **Planning Horizons**         | The more time and/or effort put into something, the harder it becomes to abandon it. Beware of long planning cycles that force architects into irreversible decisions.                                                                                      |

### Case Study

- [IBM's San Francisco Project](http://www.drdobbs.com/ibms-san-francisco-project/184415597) - An example of the 
  *last 10% trap* in action where inherent instincts to categorize and taxonomize everything results in an 
  infinite regress problem.

## Putting Evolutionary Architecture into Practice

### Organizational Factors

- Teams should be focused around a business capability, not a job title. 
- Projects should be viewed as products in the sense that a product's lifespan is forever. The developer should 
  approach a project like they are caring for his/her child.
- Keep teams small. Each team should be small enough to please with two pizzas.
- Each team member should be able to work on any part/role of the project.
- Keep the number of people a team member needs to communicate with, both inside and outside the team, as small as
  possible.

### Where Do You Start?

#### Low-Hanging Fruit

- Choose the easiest problem that highlights the evolutionary approach. 
- Demonstrations are greater than discussion.
- Favor minimizing risk at the expense of value.

#### Highest-Value

- Choosing a part with the highest value indicates commitment.
- Gives a good long-term view of what *evolutionary architecture* can do.
- Gives quick feedback on whether to continue on to other parts or go back.

#### Testing

- Add coarse-grained tests around behavior before restructuring code allowing verification that behavior has not
  changed.
- Coarse-grained tests serve as a precursor to *fitness function*s.