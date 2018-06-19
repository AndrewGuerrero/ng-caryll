# Building Evolutionary Architectures

*2017 Neal Ford, Rebecca Parsons, Patrick Kua*

## Software Architecture

<dl>
  <dt>Evolutionary Architecture</dt>
  <dd>
  Software architecture that supports guided, incremental change across multiple dimensions.
  </dd>
</dl>

### Guided Change

<dl>
  <dt>Fitness Function</dt>
  <dd>
  An objective integrity assessment of some architectural characteristics.
  </dd>
  <dt>Dimensions</dt>
  <dd>
  Perspectives of an architecture. Often, only the technical perspective of architecture is considered. However, 
  architecture is complex and multi-dimensional.
  </dd>
  <dt>Requirements</dt>
  <dd>
  Abstract nouns that are considered core to a project such as: security, agility, flexibility, scalability, etc.
  </dd>
</dl>

### Multiple Architectural Dimensions
 
Rather than a single concept, architecture is formed from both *requirements* and *dimensions*, each
protected by *fitness functions*. Common categories for dimensions found in modern software architectures
include:

- **Technical:** The implementation parts of the architecture: the frameworks, dependent libraries, and
  implementation languages.
- **Data:** Database schema, table layouts, optimization planning, etc. The database administrator generally
  handles this type of architecture.
- **Security:** Defines security policies, guidelines, and specifies tools to help uncover deficiencies.
- **Operational/System:** Concerns how the architecture maps to existing physical and/or virtual
  infrastructure: servers, machine clusters, switches, cloud resources, and so on.


### Conway's Law

> Organizations which design systems... are constrained to produce designs which are copies of the communication
> structures of these organizations.  *--Melvin Conway* 

In other words, its hard for a person to change something if that thing is owned by someone else. 

> Structure teams to look like your target architecture, and it will be easier to achieve it.

## Orthogonality

*Dimensions* are not always orthogonal. It is likely impossible to fully optimize an architecture and the 
architect will be forced to make a trade-off. In these situations it is necessary to consider *system-wide 
fitness function*s.

<dl>
  <dt>System-wide Fitness Function</dt>
  <dd>
  A set of guidelines used to compare a collection of <i>fitness function</i>s against one another.
  </dd>
</dl>

### Categories

<dl>
  <dt>Atomic</dt>
  <dd>
  Run against a singular context and exercise one particular dimension of the architecture.
  </dd>
  <dt>Holistic</dt>
  <dd>
  Run against a shared context and exercise a combination of architectural dimensions.
  </dd>
  <dt>Triggered</dt>
  <dd>
  Run based on a particular event.
  </dd>
  <dt>Continual</dt>
  <dd>
  Run constantly.
  </dd>
  <dt>Temporal</dt>
  <dd>
  Run on a scheduled basis.
  </dd>
  <dt>Static</dt>
  <dd>
  Result relies on a fixed enumeration.
  </dd>
  <dt>Dynamic</dt>
  <dd>
  Result relies on a shifting definition based on extra content.
  </dd>
  <dt>Automated</dt>
  <dd>
  Run without reliance on human interaction.
  </dd>
  <dt>Manual</dt>
  <dd>
  Run with reliance on human interaction.
  </dd>
  <dt>Intentional</dt>
  <dd>
  Created during project inception.
  </dd>
  <dt>Emergent</dt>
  <dd>
  Created during project development.
  </dd>
  <dt>Domain-specific</dt>
  <dd>
  Created because your project is a special snowflake.
  </dd>
</dl>

### Identify Fitness Functions Early

*Dimensions* can be classified into three simple categories to distinguish priority:

- **Key**: These dimensions are critical in making technology or design choices.
- **Relevant**: These dimensions are considered at the feature level, but are unlikely to guide architecture 
  choices.
- **Not relevant**: Design and technology choices are not impacted by these dimensions.

Teams that do not identify their *fitness function*s face the following risks:

- Making the wrong design choices that ultimately lead to building software that fails in its environment.
- Making design choices that cost time and/or money but are unnecessary.
- Not being able to evolve the system easily in the future when the environment changes.

### Review Fitness Functions

*Fitness functions* must evolve with the architecture. Key events in a lifetime of a business should warrant a 
review.

A review should include:

- Reviewing existing *fitness function*s
- Checking the relevancy of the current *fitness function*s
- Determining change in scale or magnitude of each *fitness function* 
- Deciding if there are better approaches for measuring or testing the system's *fitness function*s
- Discovering new *fitness function*s that the system might need to support

> Review your *fitness function*s at least once a year

## Engineering Incremental Change

*Incremental change* can be bifurcated into two aspects:

- **Development**: How developers build software.
- **Operation**: How teams deploy software.

### Development

We live in a 4D world. Thus, when an architect models an architecture in 2D using boxes and arrows, that 
architect is only merely taking the first step. Once the design is proven in a real environment using real 
software, the model becomes 3D. Finally, once the architecture withstands upgrade and inevitable change, the 
model becomes 4D.

> Architecture is abstract until operationalized, when it becomes a living thing.

#### Testablility

Prefer building tests and metrics to catch architecture violations over using strict development guidelines (and 
bureaucratic scolding).

> Dependency analysis tools like [JDepend](https://github.com/clarkware/jdepend) can help control the coupling 
> between components.

### Operation

<dl>
  <dt>Deployment Pipeline</dt>
  <dd>
  Continuous integration is a well-known agile practice that encourages developers to integrate as early as 
  possible. A deployment pipeline broadens the scope of this practice to verify production readiness including
  the application of <em>fitness function</em>s.
  </dd>
</dl>

> Open source tools like [GoCD](https://www.go.cd) facilitate building deployment pipelines.
> 
> A typical deployment pipeline builds the deployment environment in a container like 
> [Docker](https://www.docker.com) or a bespoke environment generated by a tool like 
> [Puppet](https://puppet.com) or [Chef](https://www.chef.io/chef).

#### Conflicting goals

The sooner a developer can detect problems, the less effort is 
required to fix them. One of the side effects of broadly considering all the dimensions in software architecture 
is the early identification of goals that conflict across dimensions.

Using architecture dimensions as a technique for identifying portions of concern in architecture (plus fitness 
functions to evaluate them) allows an apples-to-apples comparison, making the prioritization exercise more 
informed.

#### Hypothesis- and Data-Driven Development

<dl>
  <dt>Data-driven development</dt>
  <dd>
  Allow data to drive change and focus efforts on technical change.
  </dd>
  <dt>Hypothesis-driven development</dt>
  <dd>
  Use the scientific method on features. State a feature as a hypothesis, run experiments via A/B testing and 
  measure user decisions to inform whether the feature is beneficial or not.
  </dd>
</dl>

Agile development software methodologies incorperate nested feedback loops such as testing, continuous 
integration, iterations, etc. Yet, feedback loops that incorporate the ultimate users of the application have 
eluded teams. Hypothesis-Driven Development is a way to silently collect important feature-driving data without 
annoying users with surveys.

#### Case Studies

- [Github: Move Fast and Fix Things](http://githubengineering.com/move-fast/) - Github has long used a shell 
  script wrapped around command-line Git to handle merges. To address scalability, the script was replaced with
  ``libgit2``. To address technical debt, GitHub open sourced [Scientist](https://github.com/github/scientist),
  a framework that provides holistic, continual testing to vet changes to code.
- [Facebook: The Trust Engineers](http://www.radiolab.org/story/trust-engineers/) - In the week between Christmas
  2013 and New Year's Day 2014 more than a million photos were flagged as offensive. There was not enough staff to
  review the photos. To solve the issue, Facebook had to perform experiments on users to determine why so many 
  photos were flagged as offensive. Turns out, a lot of the offensive photos were false positives due to quirks 
  of human psychology.
- [mobile.de: Hypothesis driven UX design](http://bit.ly/hypothesis-driven-ux-design) - mobile.de created three 
  distinct user interfaces and let the customers decide which design to go with.

## Architectural Coupling

<dl>
  <dt>Module</dt>
  <dd>
  Logical grouping
  </dd>
  <dt>Component</dt>
  <dd>
  Physical partition
  </dd>
  <dt>Quantum</dt>
  <dd>
  Smallest deployable unit that includes all the facilities required to function, including data.
</dl>

![](https://drive.google.com/uc?id=1ZZTuZPNES8vdvtG-UhN57lA7A4jCMrEl)

### Evolvability of Architectural Styles

#### Big Ball of Mud

Anti-pattern. Change is difficult and expensive because every part depends on every other part.

#### Unstructured Monolith

![](https://drive.google.com/uc?id=1FmlNio4Wy_lPjr5hqP5wFNTtsNSYV3SG)

Lack of structure means that its only a matter of time before this architecture degenerates into a Big Ball of
Mud.

#### Layered Monolith

![](https://drive.google.com/uc?id=16jqIG2QXQ4AVVmmxyxd3o8Va1oQeBGjR)

Layers provide *isolation* and *separation of concerns*. Low coupling between layers makes each layer easier to 
test in isolation.
High coupling exists between components within the layer.

#### Modular Monolith

![](https://drive.google.com/uc?id=1uK9SIvJTzS7azyOAtLP21V1Fch4UlXcz)

Requires good discipline regarding coupling to prevent degeneration into a Big Ball of Mud. The degree of 
deployability of the components determines the rate of incremental change.

#### Microkernel Monolith

![](https://drive.google.com/uc?id=1lD6qEkiHCE0iLuWXM5RZT6obGG0TNNzC)

Core is stable so that future development comes in the form of plugins. Semantic coupling between plugins and the
core can become challenging evolve. If plugins become dependent on other plugins, coupling becomes even more
challenging. Holistic fitness functions should be used to ensure contract and message consistency.

#### Broker Event-Driven

![](https://drive.google.com/uc?id=10L0xh4Xx3aGSiJ9ZJDBG-XBuUclIdO-_)

Provides very low coupling between modules. This makes atomic *fitness function*s easy to develop but, in 
exchange, holistic *fitness function*s become harder to develop. 

#### Mediator Event-Driven

![](https://drive.google.com/uc?id=1c6X3LPCe8nMl8eSqAaW7T3Il604SgO2M)

Compared to the Broker, the mediator makes creating holistic *fitness function*s easier at the expense of reduced 
coupling.

#### ESB-driven SOA

![](https://drive.google.com/uc?id=1hE0fcinLZgxO6Rg5T-kT5kfEOYVgFCe2)

ESB-driven SOA takes code reuse to the point of abuse. Common changes require large amounts or coordination. 
Atomic *fitness function*s are almost impossible to create, forcing all testing to be holistic. ESB-driven SOA 
is unsuitable for evolution.

#### Microservices SOA

![](https://drive.google.com/uc?id=1ytCc5bpBcucJZx_QS4r_Y73JXSKgBZa1)

Each service is physically separate allowing for maximal decoupling and evolution potential. Atomic and holistic
*fitness function*s are easy to create and critical to the success of the architecture. Recent advancements in 
the deployment pipeline make this architecture possible.

#### Serverless Service-Based

![](https://drive.google.com/uc?id=1ByRYxxwBdYyAC-vkucALgSK8aoJyOy5x)

Shares many evolutionary similarities with the Microservices architecture. Serverless architectures are capable 
of eliminating entire dimensions away from concern. Holistic *fitness function* are critical to maintaining 
consistency between services.

> Make sure your architecture matches the problem domain. Don't try to force fit an unsuitable architecture.
 
> The smaller your architectural quanta, the more evolvable your architecture will be.

## Evolutionary Data

The key to evolving database design lies in evolving schemas alongside code.

### Shared Database Integration

When multiple applications share the same relational database, it becomes tougher to evolve the database due to
breaking changes. The *expand/contract pattern* is a common technique to avoid timing problems.

<dl>
  <dt>Expand/contract pattern</dt>
  <dd>
  Support both schemas for a period of time while all dependent applications migrate to the new schema. when 
  ready, remove support for the old schema.
  </dd>
</dl>

### Inappropriate Data Coupling

While systems typically cannot avoid database transactions, architects should try to limit transactional contexts
as much as possible because they form a tight coupling knot with the code.

> Database transactions act as a strong nuclear force, binding quanta together.

### Age and Quality of data

Keeping legacy data around encourages poor structuring which becomes increasing difficult to refactor as the 
codebase continues to evolve.

> Refusing to refactor schemas or eliminate old data couples your architecture to the past.

## Building Evolvable Architectures

Evolutionary architecture can be realized in three steps:

1. **Identify Dimensions Affected by Evolution**: Be sure to involve all interested teams within the organization.
   Keep a living document (such as a wiki) as documentation on which dimensions deserve ongoing attention.
1. **Define Fitness Function(s) for Each Dimension**: For each dimension, decide what parts may exhibit 
   undesirable behavior when evolving, eventually defining *fitness function*s. Ingenuity is necessary.
1. **Use Deployment Pipelines to Automate Fitness Functions**: Define stages in the pipeline to apply *fitness 
   function*s and deployment practices. Keep an eye on *Cycle Time* since it is proportional to the velocity of 
   new generations appearing in an architecture.

### Retrofitting Existing Architecture

#### Appropriate Coupling and Cohesion

Component coupling largely determines the evolvability of an architecture. 

Functional cohesion determines the ultimate granularity of restructured components. Taking decoupling to the 
extreme will jeopardize cohesion.

> Understand the business problem before choosing an architecture.

#### Engineering Practices

- Continuous delivery and continuous integration are essential for evolution. 
- Manual stages in the pipeline are perfectly okay. Incrementally work towards automating them as needed.
- The biggest common impediment to building evolutionary architecture is intractable operations.

#### Fitness Functions

Fitness functions allow equal treatment for formerly disparate concerns; any architectural verification is 
considered a fitness function.

### Migrating Architectures

#### Migration steps

A common direction of migration is from monolithic to service-based architectures. When decomposing a monolithic 
architecture, finding service granularity that maximizes cohesion is key.

> Don't build an architecture just because it will be fun meta-work.

#### Evolving Module Interactions

For monolithic architectures, its common for a collection of modules to share another module.

![](https://drive.google.com/uc?id=1LHkyVWLFmXtpjCgREjNF1XZeGh6DEJ31)

When migrating to a service-based architecture sharing modules introduces a kind of coupling that is strongly
discouraged. If the developer is lucky, the module can be cleanly split down the middle.

![](https://drive.google.com/uc?id=1q-LEY5GaMLOY-Sn3bxEAD1PlhLVH_VAU)

Otherwise, the module should be duplicated.

![](https://drive.google.com/uc?id=1nynBFLMiYKljef0oWnj9AUiFtwD88I-M)

### Guidelines for Building Evolutionary Architectures

- **Remove needless variability:** Keep unknowns under as much control as possible by making changeable parts 
  constants that can be changed by your will.
- **Make decisions reversible:** Evolvability involves dealing with the unknown. Wherever possible, be able to go 
  back should failure occur.
- **Prefer evolvable over predictable:** Evolvability and the underlying agile processes it entails were born 
  from the need to recover from unknown unknowns.
- **Build anticorruption layers:** Provide a layer of insulation around components not under your control. This 
  means wrapping a third party library in an abstraction layer. When the time comes, it should be easy to abandon 
  the third party library, possibly swapping it out for another.
- **Build sacrificial architectures:** Growth, a side-effect of success, empirically dictates an inevitable need 
  to throw away perfectly functioning code. Building sacrificial architecture means employing good engineering 
  practices, like *anticorruption layers*, to mitigate the pains of migrating.
- **Mitigate external change:** Set up an internal version-control repository to act as a third-party component
  store, and treat changes from the outside world as pull requests to that repository. For each pull request, 
  the deployment pipeline performs a build and smoke test on the affected applications. Upon success, the 
  change can be allowed into the ecosystem.
- **Updating libraries versus frameworks:** Frameworks call you code whereas your code calls a library. Due to 
  these differences in coupling, strive to update framework dependencies aggressively and update libraries 
  passively.
- **Prefer continuous delivery to snapshots:** Developers should introduce two designations for external 
  dependencies: *fluid* and *guarded*. *Fluid* dependencies should always try to automatically update themselves.
  If the deployment pipeline encounters a problem, the dependency is updated to *guarded* meaning it cannot be 
  updated further. Once a developer determines and fixes the problem, the dependency goes back to *fluid*.
- **Version services internally:** Severely limit the number of supported versions. The more versions, the 
  engineering burden. Strive to support only two versions at a time, and only temporarily.

### Case Studies

- [Trash Your Servers and Burn Your Code: Immutable Infrastructure and Disposable Components](http://chadfowler.com/2013/06/23/immutable-deployments.html) -
  Reliance on handcrafted DevOps infrastructure is a good example of *needless variability*. The solution in this
  article, coined immutable infrastructure, sounds like the opposite of evolvable. That's because its a needless
  variable.
- [Knightmare: A DevOps Cautionary Tale](http://dougseven.com/2014/04/17/knightmare-a-devops-cautionary-tale) - 
  Another example of *removing needless variability* applied to the deployment pipeline in a automation scenario
  where a toggle feature didn't completely toggle.
- [Sacrifical Architecture](https://martinfowler.com/bliki/SacrificialArchitecture.html) - Formal definition of 
  *sacrificial architecture* formulated from studying the actions of eBay and Google.

## Evolutionary Architecture Pitfalls and Antipatterns

<dl>
  <dt>Antipattern</dt>
  <dd>
  Looks like a good idea, but in hindsight turns out to be a mistake.
  </dd>
  <dt>Pitfall</dt>
  <dd>
  Looks like a good idea, but immediately turns out to be a mistake.
  </dd>
</dl>

### Antipatterns

<dl>
  <dt>Vendor King</dt>
  <dd>
  An architecture built around a vendor product that pathologically couples the organization to a tool. Avoid 
  vendor kings. If unavoidable, treat the vendor king as an integration point, making it easy to dethrone the 
  king.
  </dd>
  <dt>Last 10% Trap</dt>
  <dd>
  A tool, framework, or specialized language that while easy to use, only takes you 90% of the way to the 
  providing all solutions to all of the clients needs. General purpose languages don't suffer from this 
  antipattern.
  </dd>
  <dt>Code Reuse Abuse</dt>
  <dd>
  Code reuse introduces more coupling to the code as it gets reused. Once the coupling points conflict with the 
  goals of the architecture, code reuse becomes a liability. At that time, break the coupling by forking or 
  duplication. Fitness function should be able to evaluate when that time comes.
  </dd>
  <dt>Inappropriate Governance</dt>
  <dd>
  A governance model that values a single technology stack that is overly complex because it tries to solve all 
  the problems. Instead, split the problems up and use a technology stack that is most suitable for solving each 
  problem.
  </dd>
  <dt>Reporting</dt>
  <dd>
  A good example of inadvertent coupling is when architects want to use the same database schema for both system
  of record and reporting, but encounter problems because a design for both is optimized for neither. To avoid 
  conflicting business goals, keep reporting as isolated as possible.
  </dd>
</dl>

### Pitfalls

<dl>
  <dt>Leaky Abstractions</dt>
  <dd>
  A breaking abstraction at a low level causes unexpected havoc. This is a side effect of increasing complexity
  in the technology stack. Understand the fragile places within your complex technology stack and automate 
  protections via fitness functions.
  </dd>
  <dt>Resume-Driven Development</dt>
  <dd>
  Utilizing every framework and library possible to tout that knowledge on a resume. Remember, you are trying to 
  solve a problem, not play with shiny new toys.
  </dd>
  <dt>Lack of Speed to Release</dt>
  <dd>
  The velocity of a company is proportional to its cycle time. Developers cannot evolve the system any faster
  than the projects cycle time. Good engineering, deployment, and release practices are critical to success with
  an evolutionary architecture.
  </dd>
  <dt>Product Customization</dt>
  <dd>
  Customization software comes at a cost. Thought not to be discouraged, customization does impede evolvability so
  it is important to realistically assess the associated costs.
  </dd>
  <dt>Planning Horizons</dt>
  <dd>
  The more time and/or effort put into something, the harder it becomes to abandon it. Beware of long planning
  cycles that force architects into irreversible decisions.
</dl>

### Case Study

- [IBM's San Francisco Project](http://www.drdobbs.com/ibms-san-francisco-project/184415597) - An example of the 
  *last 10% trap* in action where inherent instincts to categorize and taxonomize everything result in an 
  infinite regress problem.

## Putting Evolutionary Architecture into Practice

### Organizational Factors

- Teams should be focused around a business capability, not a job title. 
- Projects should be viewed as products in the sense that a products lifespan is forever. Developer should 
  approach a project like they will be caring for it for the rest of their life
- Each team should be small enough to be fed with two pizzas.
- Each team member should be able to work on any part/role of the project.
- Keep the number of people a team member needs to communicate with, both inside and outside the team, as small as
  possible.

### Where Do You Start?

#### Low-Hanging Fruit

- Choose the easiest problem that highlights the evolutionary approach. 
- Demonstration defeats discussion.
- Favor minimizing risk at the expense of value.

#### Highest-Value

- Choosing the highest value portion indicates commitment.
- Gives a good long-term view of what evolutionary architecture can do.
- Quick feedback on whether to proceed to other parts or go back.

#### Testing

- Add coarse-grained tests around behavior before restructuring code allowing verification that the overall 
  behavior has not changed.
- Coarse-grained tests serve as a precursor to fitness functions.