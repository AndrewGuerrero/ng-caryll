# Accelerate: The Science of Lean Software and DevOps

*2018 Nicole Forsgren, Jez Humble, Gene Kim*

Read the book [here](https://itrevolution.com/book/accelerate/).

## Part 1: What We Found

### Chapter 1: Accelerate

To stay competitive and excel in the market, organizations must accelerate. At the heart of acceleration is software.

#### Focus on Capabilities, Not Maturity

| Maturity Model                                                                  | Capability Model                                                                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Focus on arriving at a state that can be declared as "mature".                  | Focus on continuous improvement, never satisfied or finished.                                                             |
| Use a prescribed formula of technologies, tooling or capabilities across teams. | Use customized approach unique to each teams context, systems, goals and constraints.                                     |
| Measurements are not tied to outcomes or business impacts.                      | Measure how capabilities drive improvement in outcomes, knowing that improvement goals and capabilities change with time. |
| Technological, process, and organizational abilities remain static.             | Develop skills and capabilities necessary to remain competitive as industry changes.                                      |

#### The Value of Adopting DevOps

Compared to low-performers, high-performers have:

- 46 times more frequent code deployments.
- 440 times faster lead time from commit to deploy.
- 170 times faster mean time to recover from downtime.
- 5 times lower change failure rate (1/5 as likely for a change to fail).

### Chapter 2: Measuring Performance

Successful delivery performance measures focus on:

- Outcome, not output.
- Global outcome, not comparisons.

For example, poor delivery performance measurements include:

- Lines of code
- Velocity
- Utilization

We decided to measure:

- Delivery lead time
- Deployment frequency
- Time to restore service
- Change failure rates

Lead time measurement has two parts described in the table below:

| Product Design and Development                                                                                              | Product Delivery (Build, Test, Deploy)                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Create new products and services that solve customer problems using hypothesis-driven delivery, modern UX, design thinking. | Enable fast flow from development to production and reliable releases by standardizing work, and reducing variability and batch sizes. |
| Feature design and implementation require work that has never been performed before.                                        | Integration, test, and deployment must be performed continuously as quickly as possible.                                               |
| Estimates are highly uncertain.                                                                                             | Cycle times should be well-known and predictable.                                                                                      |
| Outcomes are highly variable.                                                                                               | Outcomes have low variability.                                                                                                         |
#### Measuring Software Delivery Performance

Using a technique called *cluster analysis*, we grouped measurement data into high, medium, and low performers.

|                      |                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cluster Analysis** | Technique in statistical data analysis to group data in such a way that data in the same group is similar and data from other groups is not. |

In the tables below are measurements of software delivery performance collected in 2016 and 2017, respectively.

| 2016                        | High Performance                     | Medium Performance                       | Low Performance                                  |
| --------------------------- | ------------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| **Deployment Frequency**    | On demand (multiple deploys per day) | Between once per week and once per month | Between once per month and once every six months |
| **Lead Time for Changes**   | Less than one hour                   | Between one week and one month           | Between one month and six months                 |
| **Time to Restore Service** | Less than one hour                   | Less than one day                        | Less than one day                                |
| **Change Failure Rate**     | 0-15%                                | 31-45%                                   | 16-30%                                           |

| 2017                        | High Performance                     | Medium Performance                       | Low Performance                          |
| --------------------------- | ------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| **Deployment Frequency**    | On demand (multiple deploys per day) | Between once per week and once per month | Between once per week and once per month |
| **Lead Time for Changes**   | Less than one hour                   | Between one week and one month           | Between one week and one month           |
| **Time to Restore Service** | Less than one hour                   | Less than one day                        | Between one day and one week             |
| **Change Failure Rate**     | 0-15%                                | 0-15%                                    | 31-45%                                   |

The data suggests high performers have been able to find a delivery process that does not make a tradeoff between
performance and quality. Over the course of a year, low performers made a tradeoff between performance and quality,
and medium performers increased quality without sacrificing performance.

#### The Impact of Delivery Performance on Organizational Performance

We found that high performers were twice as likely to exceed objectives in quantity of goods and services, operating
efficiency, customer satisfaction, quality of products or services, and achieving organizational or mission goals.

![](https://drive.google.com/uc?id=1NhbKpDoLtGVknG8M9HBYWDiV-Iy2UNp0)

> The figures in this book represent measured *constructs* that go beyond correlation into prediction (see 
> [Chapter 12](accelerate#chapter-12-the-science-behind-this-book)). Arrows can be interpreted as "drives", "predicts",
> "affects". or "impacts". All relationships are positive unless otherwise noted.

### Chapter 3: Measuring and Changing Culture

#### The Westrum Culture Model

Organizational culture can exist at three levels in organizations from least to most visible:

1. **Basic assumptions** - Things we just "know," and may find difficult to articulate after spending long enough in a
  team.
1. **Values** - Collective values and norms that can be discussed and debated.
1. **Artifacts** - Written mission statements and creeds, technology, formal procedures, or even heroes and rituals.

At the second level - the level most would imagine when thinking of culture - Westrum developed a typology of
organizational cultures:

- **Pathological (power-oriented)** - Organizations are characterized by large amounts of fear and threat. People often 
hoard information or withhold it for political reasons, or distort it to make themselves look better.
- **Bureaucratic (rule-oriented)** - Organizations protect departments. Those in the department want to guard their
"turf," insist on their rules, and generally do things by the book - *their* book.
- **Generative (performance-oriented)** - Organizations focus on goals. Everything is subordinated to good performance.

#### Measuring Culture

Westrum culture typologies form a continuum which makes it easy to measure the culture of an organization.
Participants were asked to rate the following statements against their organization:

- Information is actively sought.
- Messengers are not punished when they deliver news of failures or other bad news.
- Responsibilities are shared.
- Cross-functional collaboration is encouraged and rewarded.
- Failure causes inquiry.
- New ideas are welcomed.
- Failures are treated primarily as opportunities to improve the system.

Higher ratings suggest a generative culture while, at the other end of the continuum, the lowest ratings suggest a
pathological culture.

> Responses to surveys are measurements that need to be analysed for validity and reliability. If analysis using
> several statistical tests confirm these properties, the measurement becomes a *construct* (see 
> [Chapter 13](accelerate#chapter-13-introduction-to-psychometrics)), and the measurement can be used in further 
> research. 

#### Westrum Culture Impacts

- Culture impacts both software delivery and organizational performance, as well as higher levels of job satisfaction.
- Lean and Agile practices, as well as other technical practices such as *continuous delivery* impact culture. 

![](https://drive.google.com/uc?id=1zz7livIT1YTsX4IUZZ1i6gxo2y-WXIut)

### Chapter 4: Technical Practices

#### What is Continuous Delivery?

|                         |                                                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Continuous Delivery** | A set of capabilities that enable us to get changes of all kinds - features, configuration, changes, bug fixes, experiments - into production or into the hands of users *safely*, *quickly*, and *sustainably*. |

Five key principles form the heart of *continuous delivery*:

- **Build quality in** - Detect issues quickly, so that they can be fixed early when they are cheap to detect and
  resolve.
- **Work in small batches** - Though working in small chunks adds some overhead, quickly receiving feedback for course
  correction is essential.
- **Computers do repetitive tasks; people solve problems** - Repetitive work that takes a long time such as 
  regression testing and software deployments should be automated, freeing people to work on higher-value problem 
  solving.
- **Relentlessly pursue continuous improvement** - High-performing teams are never satisfied. Improvement is a part of 
  everybody's daily work.
- **Everyone is responsible** - Everyone is involved in the software delivery process.

*Continuous delivery* depends on the following foundations:

- **Comprehensive configuration management** - It should be possible to provision, build, test and deploy software in a
  fully automated fashion purely from information stored in version control.
- **Continuous integration (CI)** - Teams keep branches short-lived (less than one days work) and integrate them into
  trunk/master often. Each change triggers a build process that includes running unit-tests.
- **Continuous testing** - Testing should be occurring all the time including throughout the development process.
  Automated tests should run against every commit to version control and testers should do exploratory testing 
  against the latest builds that come out of CI.

#### Continuous Delivery Practices

- **Version control** - Keep system and application configuration, not just application code, in version control.
- **Test automation** 
  - Keep tests that are reliable: When tests pass, software is releasable; when tests fail, it 
    indicates a real defect. Quarantine or remove tests that are not reliable.
  - When developers write their own tests, it forces the developer to use testable design and become invested in the 
    quality of their code.
  - Testers are essential for exploratory, usability, and acceptance testing. Testers also work with developers to 
    create and evolve test suites.
- **Test data management** - Always have adequate test data for automated testing. Be able to acquire more test
  data on demand.
- **Trunk-based development** - Develop off trunk/master instead of creating long-lived feature branches. Branches 
  should be short lived (less than a day) before being merged back into trunk and never have "code freeze" or
  stabilization periods.
- **Information security** - Infosec personnel should provide feedback throughout the software delivery life-cycle and 
  integrate security concerns in a way that does not affect the daily work of teams.
- **Architecture** - Adopting *continuous delivery* requires a heavy investment. A loosely coupled, well-encapsulated 
  architecture is one such requirement (see [Chapter 5](accelerate#chapter-5-architecture)).
- **Empowered teams** - Teams should be able to choose their own tools based on what is best for the users of those 
  tools.

#### Impact of Continuous Delivery

Teams that did well at *continuous delivery* achieved the following outcomes:

- Strong identification with the organization you worked for (see 
  [Chapter 10](accelerate#chapter-10-employee-satisfaction-identity-and-engagement)).
- Higher levels of software delivery performance (lead time, deployment frequency, time to restore service, lower
  change fail rates).
- A generative, performance-oriented culture (see [Chapter 3](accelerate#chapter-3-measuring-and-changing-culture)).
- Lower levels of deployment pain.
- Reduced team *burnout* (see [Chapter 9](accelerate#chapter-9-making-work-sustainable)).

![](https://drive.google.com/uc?id=1o2m3wfpx4EZ6WpEmOWcs-7Lw666REEaQ)

### Chapter 5: Architecture

#### Types of Systems and Delivery Performance

Of the following types of systems:

- Greenfield (new systems that have not yet been released)
- Systems of engagement (used directly by end users)
- Systems of record (used to store business-critical information where data consistency and integrity is critical)
- Custom software developed by another company
- Custom software developed in-house.
- Packaged, commercial off-the-shelf software
- Embedded software that runs on a manufactured hardware device
- Software with a user-installed component (including mobile apps)
- Non-mainframe software that runs on servers operated by another company
- Non-mainframe software that runs on our own servers
- Mainframe software

Only custom software that was developed by another company and mainframe systems showed significant correlation with
low performers. All other system types did not show any correlation with performance.

#### Focus on Deployability and Scalability

Instead of the type of system, we found performance depends on two architectural *characteristics*:

- **Testability** - Most of the testing doesn't need an integrated environment.
- **Deployability** - Applications are be deployed independently of other applications/services it depends on.

To achieve these *characteristics*, a loosely coupled, well-encapsulated architecure is necessary. The largest 
contributor to *continuous delivery* - larger even than test and deployment automation - is whether teams can:

- Make large-scale changes to the design of their system without permission of somebody outside of the team.
- Make large-scale changes to the design of their system without depending on other teams to make changes in their
  systems or creating significant work for other teams.
- Complete their work without communicating and coordinating with people outside their team.
- Deploy and release their product or service on demand, regardless of other services it depends on.
- Do most of their testing on demand, without requiring and integrated test environment.
- Deploy during normal business hours with negligible downtime.

This research does not suggest that teams shouldn't work together. Rather, communication bandwidth is best used for 
high-level shared goals instead of frequent fine-grained decision-making at the implementation level.

> The connection between communication bandwidth and systems architecture was first discussed by Melvin Conway in 
> what's dubbed Conway's Law. This research supports the "Inverse Conway Maneuver", which advocates an architecure
> that allows teams to get work done without high bandwidth communication between teams.

#### A Loosely Coupled Architecture Enables Scaling

Productivity can be measured as the number of deploys per developer per day. Below is a graph of productivity
categorized into performance groups of respondents who deploy at least once per day:

![](https://drive.google.com/uc?id=1qJM_4oD7hRjqPiHJHHbhBv3uSU4C8iKa)

#### Allow Teams to Choose Their Own Tools

Keeping an approved list of tools and frameworks has several benefits such as:

- Reducing the complexity of the environment.
- Ensuring the necessary skills are in place to manage the technology throughout its life cycle.
- Increasing purchasing power with vendors.
- Ensuring all technologies are correctly licensed.

There's some downsides too. It prevents teams from:

- Choosing technologies that will be the most suitable for their particular needs.
- Experimenting with new approaches. 

Despite the many benefits, we found that the cons outweigh the pros. This does not mean that standardization doesn't
have a place in other areas *around* architecture and configuration of infrastructure. In fact, it's likely necessary
to do so.

#### Architects Should Focus on Engineers and Outcomes, Not Tools or Technologies

Tools and technologies are irrelevant if the people who must use them hate using them, or if they don't achieve the
outcomes and enable the behaviors people care about. 

> Architect shouldn't choose tools or technologies. The most important responsibility of the architect is to
> enable teams to make changes to their products or services without depending on other teams or systems.

### Chapter 6: Integrating Infosec Into the Delivery Cycle

#### Shifting Left of Security

"Shifting left" means shifting from information security teams doing the security reviews themselves to providing
tools, training, and support to make it easy for developers to build security in as a part of their daily work. 

By building security into their daily work, as apposed to retrofitting security concerns at the end, infosec experts 
spend significantly less time addressing security issues. We found high performers spend 50% less time
remedying security issues than low performers.

### Chapter 7: Management Practices for Software

#### Lean Management Practices

We modeled Lean management applied to software delivery with three components:

1. **Limiting work in progress (WIP)**, and using these limits to drive process improvement and increase throughput.
1. **Creating and maintaining visual displays** showing key quality and productivity metrics and current status of
   work (including defects), making these visual displays available to both engineers and leaders, and aligning these
   metrics with operational goals.
1. **Using data from application performance and infrastructure monitoring tools** to make business decisions on a
   daily basis.

These three components predict delivery performance. Yet, WIP limits alone do not predict delivery performance
unless joined with visual displays. Lean management also has positive effects on team culture and performance,
decreasing *burnout*, and promoting a generative Westrum culture.

![](https://drive.google.com/uc?id=1ebk22ID_uVICs8R0DdgTEtNaLN8Sl89o)

#### Implement a Lightweight Change Management Process

In our investigation of how different change approval processes impact software delivery performance, we
considered the following choices:

1. All production changes must be approved by an external body, such as a manager or a change advisory board (CAB).
1. Only high-risk changes, such as database changes need approval.
1. We rely on peer review to manage changes.
1. We have no change approval process.

Interestingly, we found:

- Teams that required approval by an external body achieved lower performance. 
- Approval for high-risk changes only had no correlation to performance
- No approval process or peer review processes achieved higher performance.

Based on these findings, we suggest a lightweight peer review process, such as pair programming or intrateam code
review, with a deployment pipeline to detect and reject bad changes.

### Chapter 8: Product Development

#### Lean Product Development Practices

Our model of a Lean approach to product developments has four capabilities:

1. The extent to which teams slice up products and features into small batches that can be completed in less than a week
   and released often, including minimum viable products (MVPs).
1. Whether teams have a good understanding of the the flow of work from the business all the way through to customers,
   and whether they have visibility into this flow, including the status of products and features.
1. Whether organizations actively and regularly seek customer feedback and incorporate this feedback into the design
   of their products.
1. Whether development teams have the authority to create and change specifications as part of the development process
   without requiring approval.

#### Effective Product Development Drives Performance

Performance in these capabilities predicted higher software delivery performance and organizational performance, as well
as improving organizational culture and decreasing *burnout*. Conversely, software delivery performance predicts Lean
product development practices, creating whats known as a virtuous cycle.

![](https://drive.google.com/uc?id=13DIV3MMCThG6UTKmeQa1TI8oHGebJyoP)

#### Working in Small Batches

Working in small batches can be applied to both the feature and product level. Features can be decomposed and MVPs
contain just enough features to enable validated learning about the product and its business model.

The ability to work and deliver in small batches is especially important because it enable teams to integrate user
research back into product development and delivery. This experimental approach is highly correlated with the technical
practices that contribute to *continuous delivery*. Small batches enable short lead times and faster feedback loops.

### Chapter 9: Making Work Sustainable

#### Deployment Pain

Most deployment problems are caused by a complex, brittle deployment process:

- Software is not written with deployability in mind.
- Manual changes made to the production environment are a part of the deployment process.
- Deployments need multiple handoffs between teams.

To reduce deployment pain:

- Build systems that are designed to be deployed easily in multiple environments, can detect and tolerate failures in 
  their environments, and can have various components of the system updated independently.
- Make the state of production systems reproducible (except for production data) in an automated fashion from the
  information in version control.
- Build intelligence into the application and the platform so that the deployment process can be a simple as possible.

#### Common Problems That Can Lead to Burnout

|             |                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Burnout** | Physical, mental, or emotional exhaustion caused by overwork or stress. Burnout can make the things we once loved about our work and life seem insignificant and dull. It often manifests itself as a feeling of helplessness, and is correlated with pathological cultures and unproductive, wasteful work. |

In her research, Christina Maslach found six organizational risk factors that predict *burnout*:

1. **Work overload** - Job demands exceed human limits.
1. **Lack of control** - Inability to influence decisions that affect your job.
1. **Insufficient rewards** - Insufficient financial, institutional, or social rewards.
1. **Breakdown of community** - Unsupportive workplace environment.
1. **Absence of fairness** - Lack of fairness in decision-making processes.
1. **Value conflicts** - Mismatch in organizational values and individuals values.

Maslach found that most organizations try to fix the person and ignore the work environment. Yet, her research showed
the latter had a higher likelihood of success.

#### How to Reduce or Fight Burnout

Managers can reduce employee *burnout* by:

- Fostering a respectful, supportive work environment that emphasizes learning from failures rather than blaming.
- Communicating a strong sense of purpose.
- Investing in employee development.
- Asking employees what is preventing them from achieving their objectives and then fixing those things.
- Giving employees time, space, and resources to experiment and learn.
- Giving employees authority to make decisions that effect their work and their jobs, particularly in area where they
  are responsible for the outcomes.

> Value alignment between the organization and the individual plays an important role in *burnout*.

To measure *burnout*, we asked respondents:

- If they felt burned out or exhausted.
- If they felt indifferent or cynical about their work, or if they felt ineffective.
- If their work was having a negative effect on their life.

The five most highly correlated factors are:

1. Organizational culture
1. Deployment pain
1. Effectiveness of leaders
1. Organizational investments in DevOps
1. Organizational performance

![](https://drive.google.com/uc?id=1LBdQDBoaZQtiV6S8kE-b09MC-MREecyY)

### Chapter 10: Employee Satisfaction, Identity, and Engagement

#### Employee Loyalty

Employee loyalty can be measured with a widely used benchmark called Net Promoter Scale (NPS). NPS is calculated from
answers to a single question: On a scale of 0-10, how likely would you recommend our company/product/service to a
friend or colleague?

NPS is significantly correlated with the following *constructs*:

- The extent to which the organization collects customer feedback and uses it to inform the design of products and
  features.
- The ability of teams to visualize and understand the flow of products or features through development all the way to
  the customer.
- The extent to which employees identify with their organizations values and goals, and the effort they are willing
  to put in to make the organization successful.

In our survey, we had two NPS(s): one for recommending the participant's organization, and another for their team.
Comparing high-performers with low-performers, we found that high-performers were:

- 2.2 times more likely to recommend their organization, and 
- 1.8 times more likely to recommend their team.

#### Changing Organizational Culture and Identity

We measured identity by asking participants to rate the following statements on a *Likert-type scale*:

- I am glad to work for this organization rather than another company.
- I talk of this organization to my friends as a great company to work for.
- I am willing to put in a great deal of effort beyond what is normally expected to help my organization be successful.
- I find that my values and my organization's values are similar.
- In general, the people employed by my organization are working toward the same goal.
- I feel that my organization cares about me.

Teams using *continuous delivery* and effective management practices feel connected to their organization improving
productivity and performance.

#### How Does Job Satisfaction Impact Organizational Performance

Having the right tools to automate menial tasks is strongly correlated with job satisfaction.
People like to focus on tasks that apply their skills, thinking through problems, and making decisions.

![](https://drive.google.com/uc?id=1kqBKFZCu7lIwtX0q-zVOetLcV8vim0Az)

#### Diversity in Tech

Research shows that teams with more diversity (gender and underrepresented minorities) are smarter, achieve better 
team performance, and achieve better business outcomes. 

We recommend making a conscious effort to recruit more women and underrepresented minorities. But, recruiting is not 
enough. Diversity must also be retained by being an inclusive organization where all members feel welcome and valued.

### Chapter 11: Leaders and Managers

#### Transformational Leadership

|                                 |                                                                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transformational Leadership** | Leadership in which followers are inspired and motivated to achieve higher performance by appealing to their sense of purpose, facilitating wide-scale organizational change. |

We believe *transformational leadership* is essential for:

- Establishing and supporting generative and high-trust cultural norms.
- Creating technologies that enable developer productivity, reducing code deployment lead times and supporting more 
  reliable infrastructures.
- Supporting team experimentation and innovation, and creating and implementing better products faster.
- Working across organizational silos to achieve strategic alignment.

To capture *transformational leadership*, we created a model with five characteristics:

- **Vision** - Has a clear understanding of where the organization is going and where it should be in five years.
- **Inspirational communication** - Communicates in a way that inspires and motivates, even in an uncertain or 
  changing environment.
- **Intellectual stimulation** - Challenges followers to think about problems in new ways.
- **Supportive leadership** - Demonstrates care and consideration of followers' personal needs and feelings.
- **Personal recognition** - Praises and acknowledges achievement of goals and improvements in work quality;
  personally compliments others when they do outstanding work.

The model was used to create a survey that measures *transformatonal leadership*:

My leader or manager:

- **Vision**
  - Has a clear understanding of where we are going.
  - Has a clear sense of where he/she wants our team to be in five years.
  - Has a clear idea of where the organization is going.
- **Inspirational communication**
  - Says things that make employees proud to be a part of this organization.
  - Says positive things about the work unit.
  - Encourages people to see changing environment as situations full or opportunities.
- **Intellectual stimulation**
  - Challenges me to think about old problems in new ways.
  - Has ideas that have forced me to rethink some things that I have never questioned before.
  - Has challenged me to rethink some of my basic assumptions about my work.
- **Supportive leadership**
  - Considers my personal feelings before acting.
  - Behaves in a manner which is thoughtful of my personal needs.
  - Sees that the interests of employees are considered.
- **Personal recognition**
  - Commends me when I do a better than average job.
  - Acknowledges improvements in my quality of work.
  - Personally compliments me when I do outstanding work.

We found a high correlation between *transformational leadership* and delivery performance. Teams that report
leadership in the bottom one-third of *transformational leadership* were only half as likely to be high performers.
*transformational leadership* also had a strong correlation with the Net Promoter Scale (see 
[Chapter 10](accelerate#chapter-10-employee-satisfaction-identity-and-engagement)), our metric for loyalty.

Yet, leaders cannot achieve goals on their own. The top 10% of teams with the strongest leadership we equally or
even less likely to be high performers than the rest of the population.

In summary, *transformational leadership* is necessary for high performance because it enables practices that correlate
with high performance, but its not enough.

![](https://drive.google.com/uc?id=1RLEx7YqowpuuuOumGRdxcYKqfu93Ptxk)

#### The Role of Managers

- Make sure that existing resources are available and accessible to everyone in the organization. Create space and
  opportunities for learning and improving.
- Allocate a dedicated training budget and make sure people know about it. Also, give your staff the latitude to 
  choose training that interests them. This training budget may include dedicated time during the day to make use of
  resources that already exist in the organization.
- Encourage staff to attend technical conferences at least once a year and summarize what the learned for the entire
  team.
- Set up internal hack days, where cross-functional teams can get together to work on a project.
- Encourage teams to organize internal "yak days," where teams get together to work on technical debt. These are great
  events because technical debt is so rarely prioritized.
- Hold regular internal DevOps mini-conferences. We've seen organizations achieve success using the classic DevOpsDays
  format, which combines pre-prepared talks with "open spaces" where participants self-organize to propose and 
  facilitate their own sessions.
- Give staff dedicated time, such as 20% time or several days after a release, to experiment with new tools and 
  technologies. Allocate budget and infrastructure for special projects.

#### Tips to Improve Culture and Support Your Teams

Increase cross-functional collaboration by:

- **Building trust with your counterparts on other teams** - Keep promises, open communication, and behave predictably
  even in stressful situations.
- **Encouraging practitioners to move between departments** - As people build skills, they may become interested in a
  different department. Lateral movement is a great way to share information and increase community across teams.
- **Actively seeking, encouraging, and rewarding work that facilitates collaboration** - Pay attention to latent 
  factors that make collaboration easier.

Help create a climate of learning by:

- **Creating a training budget and advocating for it internally** - Dedicating resources towards education shows that
  you value a climate of learning.
- **Ensuring that your team has the resources to engage in informal learning and the space to explore ideas** - 
  Learning often happens informally. Some companies have famously set aside a percentage of time for focused
  free-thinking and exploration.
- **Making it safe to fail** - If failure is punished, people will not try out new things.
- **Creating opportunities and spaces to share information** - Create events like weekly lightning-talks, monthly
  lunch-and-learns, or other opportunities for employees to share knowledge.
- **Encourage sharing and innovation by having demo days and forums** - Allow teams to share, celebrate, and learn from
  each others work.

Make effective use of tools by:

- **Ensuring your team can choose their tools** - If teams can build infrastructure and applications the way they want,
  they're much more likely to be invested in their work.
- **Make monitoring a priority** - Refine your infrastructure and application monitoring system, and make sure you
  are putting that information to good use.

## Part 2: The Research

### Chapter 12: The Science Behind this Book

#### Primary and Secondary Research

Secondary research is based upon data the already exists; primary research requires collecting new data. This
book and the State of DevOps reports are based on primary data.

Qualitative research uses data that isn't numerical in form. Answers to survey questions are qualitative. Yet,
qualitative data can be difficult to reason with, so its often transformed into quantitative data. The research 
presented in the book is quantitative because it was collected using the *Likert-type scale*.

|                       |                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Likert-type scale** | Records responses and assigns them a numerical value. For example "Strongly disagree" = 1, "Neutral" = 4, "Strongly agree" = 7. |

#### Types of Analysis

Data can be analysed at six different levels in order of increasing complexity:

1. **Descriptive** - Data is summarized and reported. Examples include demographic information about our survey
   participants and the organizations they work in.
1. **Exploratory** - Data is searched for relationships among sets of data. Examples include correlations reported in
   this book.
1. **Inferential predictive** - Data is used to confirm a hypothesis. Examples include the diagrams in this book where
   *constructs* "predict" or "impact" other *constructs*.
1. **Predictive** - Data is used to forecast future events based on prior events.
1. **Causal** - Data is collected from randomized studies.
1. **Mechanical** - Data is used for calculation of exact behavior resulting from the controlled change of a
  variable in laboratory conditions.

This book goes as far as the first three types of analysis.

#### Classification Analysis

Another type of analysis, classification analysis, falls under the exploratory, predictive, or even causal analysis. At
a high level, classification variables are entered into a *clustering algorithm* (we used hierarchical clustering) and
significant groups are identified. We used this type of analysis to talk about high-, medium-, and low-performance 
software delivery teams.

### Chapter 13: Introduction to Psychometrics

A worthwhile question to ask is: how can we trust the data that we have collected? After all, its possible to write
bad surveys containing common weaknesses like:

- Leading questions
- Loaded questions
- Multiple questions in one
- Unclear language

#### Trusting Data with Latent Constructs

|                      |                                                                                                                                                                                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Psychometrics**    | When a *construct* passes statistical validity and reliability tests, the *construct* has good psychometric properties.                                                                                                                                                                       |
| **Latent construct** | A latent construct is a way to measure something that can't be measured directly, often because its too complex to be measured directly. Latent constructs use several measures (called manifest variables) to capture the underlying concept, shielding against bad measures and bad actors. |

*Latent constructs* shield against bad measures and bad actors because they:

- **Help us think carefully about what we're measuring** - To build a *construct*, it first needs to be defined. Coming
  up with a formal definition forces thought about what the *construct* is.
- **Give us several views into our data** - Having several manifest variables allows us to run several statistical
  tests such as:
  - **Discriminant validity** - Measures that are not supposed to be related are unrelated.
  - **Convergent validity** - Measures that are supposed to be related are related.
  - **Reliability** - Measures read and are interpreted similarly by those who take the survey.
- **Help safeguard against rouge data** - Its good to reassess these tests periodically to make sure the system or
  environment has not changed.
- **Can be used for system data** - Measures are proxies. They represent an idea that we acknowledge consciously or
  otherwise. Having several measurements to represent an idea lets us to look for patterns, allowing changes in
  data to become easier to detect.

### Chapter 14: Why Use a Survey

- **Surveys allow you to collect and analyze data quickly** - The data in this book was collected four times. Each time,
  data was collected from thousands of participants from around the world over a four-to-six week period. Collecting 
  system data in a similar manner would be impossible and would take a huge amount of time to clean and analyse.
  Additionally differences in terminology would be more prevalent then in a carefully worded survey.
- **Measuring the full stack with system data is difficult** - Even if a system is reporting good and useful data, its
  rarely exhaustive. Asking people is a better way to understand the bottlenecks and constraints in your system.
  Surveying everyone on the team can help avoid overly positive and overly negative responses.
- **Measuring completely with system data is difficult** - Systems only know things happening within their boundaries.
  People know what happens in and around the system.
- **You can trust survey data** - Comparing surveys and system data, most people (especially engineers) would find
  system data more trustworthy. Yet, system data quality can be influenced by bad actors that slipped past code
  review and/or tests. For survey data that used *latent constructs* and *psychometrics* (see 
  [Chapter 13](accelerate#chapter-13-introduction-to-psychometrics)), it becomes difficult for a large enough group
  of people to lie in such an organized and coordinated way.
- **Some things can only be measured through surveys** - The only way to know how people feel, or why they behave the 
  way they do, is to ask them.

### Chapter 15: The Data for the Project

To improve the quality of our research, we targeted a specific audience:

- Participants need to be interested in reading an email or social media post with the word "DevOps" in it.
- We discarded data from participants that were not familiar with things like configuration management,
  infrastructure-as-code, and continuous integration. Participants had their knowledge tested with targeted
  questions to guard against bias.
- We took special care to send survey invitations to underrepresented groups and minorities.
- We invited participants to refer other participants (known as referral sampling or snowball sampling). This type of
  sampling is more effective with a large starting set of invitations.
- We actively take part in the community, consult with our colleagues, and seek help from external experts to make
  sure we have no blind spots and our findings are relevant in the industry.

## Part 3: The Transformation

### Chapter 16: High-performance Leadership and Management

The tables below contain practices for evolving a high-performance, generative culture. Practices marked with an
asterisk show correlation with high performance:

#### Culture

| Team Practices                                      | Management Practices                                    | Leadership Practices                                    |
| --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| *Foster generative culture                          | *Foster generative culture                              | *Foster generative culture                              |
| *Build quality in, continuously measure and monitor | *Focus on quality, protect teams to ensure quality      | *Focus on quality, protect teams to ensure quality      |
| Focus on promoting organization learning            | Focus on promoting organizational learning              | Focus on promoting organizational learning              |
|                                                     | *Provide teams with time for improvement and innovation | *Provide teams with time for improvement and innovation |

#### Organizational Structure

| Team Practices | Management Practices                                                                                                                | Leadership Practices                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
|                |                                                                                                                                     | *Align, Measure, and Manage to Flow (matrixed, cross-functional value stream organization structure)        |
|                | Establish small, cross-functional, multi-skilled teams; support bridging structures so teams can easily communicate and collaborate | Enable and support cross-skilling to reduce expert-dependent bottlenecks, and form communities of expertise |
|                |                                                                                                                                     | Establish and support internal coaches and the appropriate infrastructure to scale ans sustain them         |

#### Direct Learning and Alignment to Value

| Team Practices                                   | Management Practices                                                                                               | Leadership Practices                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| *Engage, learn from, and validate with customers | *Engage with and  learn from customers and teams                                                                   | *Engage and learn from customers, teams, supply chain partners, and other stakeholders |
|                                                  | *Understand & visualize customer value, identify measurable targets for quality.                                   | *Understand & visualize customer value, identify measurable targets for quality        | *Understand & visualize customer value, identify measurable targets for quality |
| *Practice creativity as part of the overall work | *Practice creativity as par of the overall work, encourage team members to utilize this time to learn and innovate | *Budget for and allocate time for creativity (i.e Google's 20% target)                 |

#### Strategy Deployment

| Team Practices                                                                              | Management Practices                                                                                     | Leadership Practices                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Visualize team goals and targets, understand how these targets advance enterprise strategy | Help Teams to set and visualize goals and targets, understand and communicate how these advance strategy | Practice strategy deployment, visualize all goals, and near-term targets, communicate this clearly to manager and help them set appropriate targets and initiatives |
| *Actively monitor and visualize performance to goals/targets                                | *Actively monitor and visualize performance to goals/targets                                             | *Actively monitor and visualize performance to goals/targets                                                                                                        |
|                                                                                             |                                                                                                          | Eliminate unnecessary controls, invest instead in process quality, and team autonomy and capability                                                                 |

#### Improve Flow Through Analysis and Disciplined Problem Solving

| Team Practices                                                                                                                                                   | Management Practices                                                                                                                                             | Leadership Practices                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visualize & analyze work flow, identify obstacles to flow; *Understand the connection between the work they do and its positive impact on customers              | Visualize and analyze work flow, identify obstacles to flow, help teams understand how they support larger value stream                                          | Visualize and analyze overall value stream flows, identify systemic obstacles to flow, prioritize and support mapping and analysis of lower level supporting flows |
| Prioritize obstacles to customers value and experience, and team targets and goals                                                                               | Prioritize obstacles to customers value and experience, and team targets and goals                                                                               | Prioritize systemic obstacles to flow                                                                                                                              |
| Apply disciplined problem solving to prioritized problems, analyze to identify root causes                                                                       | Apply disciplined problem solving to prioritized problems, analyze to identify root causes                                                                       | Apply disciplined problem solving to complex systemic issues to identify strategic improvement themes and targets, apply learning to update standard work          |
| Escalate cross-functional and systemic problems                                                                                                                  | Coordinate cross-functional problem solving, solve or escalate systemic problems                                                                                 | Cascade prioritized problem solving targets to the appropriate stakeholders through PDCA                                                                           |
| Form hypothesis about root causes, design and conduct controlled experiments, measure results, communicate learnings, repeat if needed, incorporate improvements | Form hypothesis about root causes, design and conduct controlled experiments, measure results, communicate learnings, repeat if needed, incorporate improvements | Learn from organization-wide PDCA cycles, and repeat learning/improvements cycles                                                                                  |

#### Way of Work, Rhythm, & Routine

| Team Practices                                                                                         | Management Practices                                                                                      | Leadership Practices                                                                                          |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| *Visualize, measure and monitor work flow, monitor for deviations, respond to deviations appropriately | *Visualize, measure and monitor work flow, monitor for deviations, respond to deviations appropriately    | *Visualize, measure and monitor work flow, monitor for deviations, respond to deviations appropriately        |
| *Break demand into small elements (MVPs) and release regularly and often                               |                                                                                                           |                                                                                                               |
| *Visualize Demand, WIP, and "Done"                                                                     | *Visualize Demand, WIP, and "Done"                                                                        | *Visualize Demand, WIP, and "Done"                                                                            |
| *Minimize and visualize WIP                                                                            | *Minimize and visualize WIP                                                                               | *Minimize and visualize WIP                                                                                   |
| Prioritize demand to goals and targets                                                                 | Prioritize demand to goals and targets                                                                    | Prioritize demand to goals and targets                                                                        |
| Develop & practice team standard work (rhythm & routine)                                               | Develop & practice team standard work (rhythm & routine)                                                  | Develop & practice team standard work (rhythm & routine)                                                      |
| Conduct daily stand-ups with standard routine, escalate obstacles as needed                            | Conduct daily stand-ups with team leads, standard routine, resolve or bridge/escalate obstacles as needed | Conduct stand-ups with direct reports with standard routine on a regular cadence, resolve escalated obstacles |
| Support team and peer learning                                                                         | Coach team members; support team learning                                                                 | Coach managers, have your own coach                                                                           |
| Conduct regular cadence of retrospectives (work, and way of work)                                      | Conduct regular cadence of retrospectives (work, and way of work)                                         | Conduct regular cadence of retrospectives (work, and way of work)                                             |

> - **Develop and keep the right mindset** - Create an environment for shared organizational learning.
> - **Make it your own** - Dont copy others. Learn from them, experiment, and adapt to what works best. 
> - **Lead by example** - Demonstrate, don't delegate.

## Appendices

### Appendix A: Capabilities to Drive Improvement

#### Continuous Delivery Capabilities

1. **Use version control for all production artifacts** - Including application code, application configuration,
   system configuration, and scripts for automating build and configuration of the environment.
1. **Automate your deployment process** - Strive to remove any manual intervention.
1. **Implement continuous integration** - As the first step to *continuous delivery*, the CI process creates
   canonical builds and packages that are ultimately deployed and released.
1. **Use trunk-based development methods** - Characterized by fewer than three active branches in the code
   repository, branches that have short lifetimes (less than a day) before being merged back into master, and no
   code-lock, code-freeze, or stabilization phases.
1. **Implement test automation** - Automated tests should be reliable. When they pass, the build is releasable; When
   they fail, they find real failures. Developers are responsible for creation and maintenance of test suites.
1. **Support test data management** - Have adequate data to run test suites, the ability to collect more data on
   demand, and the ability to condition test data. Test data should never limit the amount of testing performed.
1. **Shift left on security** - Integrate security reviews in the design and demo process for applications, preapprove
   security libraries and packages, and test security features as part of the automated test suite.
1. **Implement continuous delivery** - Focus on the keeping software in a deployable state over working on new
   features. Feedback on the quality and deployability of the system should be available to all team members. Artifacts
   can be deployed to production on demand.

#### Architecture Capabilities

1. **Use a loosely coupled architecture** - Coupling affects the extent to which a team can test and deploy
   applications on-demand and allows teams to work independently.
1. **Architect for empowered teams** - Allow developers their choice of tools.

#### Product and Process Capabilities

1. **Gather and implement customer feedback** - Incorporate feedback into the design of the product.
1. **Make the flow of work visible through the value system** - Teams should be able to see the flow of work from the
   business through to the customers.
1. **Work in small batches** - Slice work into small pieces that can be completed in a week or less. This applies to
   products (MVP) as well as features.
1. **Foster and enable team experimentation** - Allow developers to try new ideas and create and update specifications
   during the development process, without approval from outside the team.

#### Lean Management and Monitoring Capabilities

1. **Have a lightweight change approval process** - Use processes based on peer review, such as pair programming or 
   intrateam code review.
1. **Monitor across application and infrastructure to inform business decisions** - Use application data and
   infrastructure monitoring tools.
1. **Check system health proactively** - Monitor system health, using threshold and rate-of-change warnings to
   preemptively detect and mitigate problems.
1. **Improve processes and manage work with work-in-process (WIP) limits.** - This drives process improvement,
   increases throughput, and makes constraints visible in the system.
1. **Visualize work to monitor quality and communicate throughout the team** - Team members should have access to these
   visual aids at any time.

#### Cultural Capabilities

1. **Support a generative culture** - Hallmarks include good information flow, high cooperation and trust, bridging
   between teams, and conscious inquiry.
1. **Encourage and support learning** - Learning is an essential investment, not an unnecessary cost.
1. **Support and facilitate collaboration among teams** - Across development, operations, and information security.
1. **Provide resources and tools that make work meaningful** - Work is challenging and meaningful; tedious and 
   boring work is automated. Developers are empowered to exercise their skills and judgement, and have the tools
   and resources needed to do their job well.

### Appendix B: The Stats

#### Organizational Performance

- High performers are twice as likely to exceed organizational performance goals as low performers.
- High performers are twice as likely to exceed noncommercial performance goals as low performers.
- High performers had 50% higher market capitalization growth over three years compared to low performers.

#### Software Delivery Performance

- Improving performance and achieving higher levels of tempo and stability is not a trade-off: they move
  in tandem.
- Software delivery performance predicts organizational performance and noncommercial performance.
- Deploy frequency is highly correlated with *continuous delivery* and the comprehensive use of version control.
- Lead time is highly correlated with version control and automated testing.
- Mean time to response is highly correlated with version control and monitoring.
- Software delivery performance is correlated with organizational investment in DevOps.
- Software delivery performance is negatively correlated with deployment pain.

#### Quality

- Unplanned work and rework:
  - High performers reported spending 49% of their time on new work  and 21% of their time on unplanned work or rework.
  - Low performers spend 38% of their time on new work and 27% of their time on unplanned work or rework.
  - Theres evidence of the J-curve in our rework data. Medium performers spend more time on rework than low performers, with 32% of their time spent on unplanned work or rework.
- Manual work:
  - High performers report the lowest amount of manual work across all practices (configuration management, testing,
    deployments, change approval process) at statistically significant levels.
  - Theres evidence of a J-curve again. Medium performers do more manual work than low performers.
  - The table below maps the percentage of time spent performing a manual task for each performance group:
     
    | Manual Work              | High Performers | Medium Performers | Low Performers |
    | ------------------------ | --------------- | ----------------- | -------------- |
    | Configuration management | 28%             | 47%               | 46%            |
    | Testing                  | 35%             | 51%               | 49%            |
    | Deployments              | 26%             | 47%               | 43%            |
    | Change approval process  | 48%             | 67%               | 59%            |

#### Burnout and Deployment Pain

- Deployment pain is negatively correlated with software delivery performance and Westrum organizational culture.
- The five most highly correlated factors with *burnout* are:
  - Westrum organizational culture (negative)
  - Leadership (negative)
  - Organizational investment (negative)
  - Organizational performance (negative)
  - Deployment pain (positive)

#### Technical Capabilities

- Trunk-based development:
  - High performers have the shortest integration times and branch lifetimes, with branch life and integration
    typically lasting hours or days.
  - Low performers have the longes integration times and branch lifetimes, with branch life and integration typically
    lasting days or weeks.
- Technical practices predict:
  - *Continuous delivery*
  - Westrum organizational culture
  - Identity
  - Job satisfaction
  - Software delivery performance
  - Less performance
  - Less *burnout*
  - Less deployment pain
  - Less time spent on rework
- High performers spend 50% less time remedying security issues than low performers.

#### Architecture Practices

- Building a particular type of system is not correlated software delivery performance.
- Low performers were more likely to say that the software they were building - or the set of services they had to
  interact with - was "custom software developed by another company".
- Low performers were more likely to be working on mainframe systems.
- Having to integrate against mainframe systems showed no significant correlation with software delivery performance.
- Medium and high performers have no significant correlation between system type and software delivery performance.
- A loosely coupled, well-encapsulated architecture drives IT performance. In the 2017 data set, this was the biggest
  contributor to *continuous delivery*.
- Among those who deploy at least once per day, as the number of developers on the team increases:
  - Low performers deploy with decreasing frequency.
  - Medium performers deploy at a constant frequency.
  - High performers deploy at a significantly increasing frequency.
- High performers were more likely to respond to the following statements:
  - We can do most of our testing without requiring an integrated environment.
  - We can and do deploy/release our applications independently of other applications/services they depend on.
  - Its custom software that uses a microservices architecture.
- Type of architecture had no significant impact on performance.

#### Lean Management Capabilities

- Lean management capabilities predict:
  - Westrum organizational culture
  - Job satisfaction
  - Software delivery performance
  - Less *burnout*
- Change approvals:
  - Change advisory boards are negatively correlated with software delivery performance.
  - Approval only for high-risk changes was not correlated with software delivery performance.
  - Teams that reported not approval process or used peer review achieved higher software delivery performance.
  - A lightweight change approval process predicts software delivery performance.

#### Lean Product Management Capabilities

- The ability to take an experimental approach to product development is highly correlated with the technical
  practices that contribute to *continuous delivery*.
- Lean product development capabilities predict:
  - Westrum organizational culture
  - Software delivery performance
  - Organizational performance
  - Less *burnout*

#### Organizational culture Capabilities

- The following measures are strongly correlated to culture:
  - Organizational investment in DevOps
  - The experience and effectiveness of team leaders
  - *Continuous delivery* capabilities
  - The ability of development, operations and infosec teams to achieve win-win outcomes
  - Organizational performance
  - Deployment pain
  - Lean management practices
- Westrum organizational culture predicts software delivery performance, organizational performance, and job
  satisfaction.
- Westrum organizational culture is negatively correlated with deployment pain.

#### Identity, Employee Net Promoter Score, and Job Satisfaction

- Identity predicts organizational performance.
- High performers have better employee loyalty, as measured by employee Net Promoter Score (NPS). Employees in
  high-performing organizations were 2.2 time more likely to recommend their organizations as a great place to work.
- NPS is strongly correlated with:
  - The extent to which the organization collects feedback and uses it to inform the design of products and features.
  - The ability of teams to visualize and understand the flow of products or features through development all the
    way to the customer.
  - The extent to which employees identify with their organization's values and goals, and the effort they are
    willing to put in to make the organization successful.
- Employees in high-performing teams are 2.2 time more likely to recommend their *organization* as a great place to
  work.
- Employees in high-performing teams are 1.8 time more likely to recommend their *team* as a great place to work.
- Job satisfaction predicts organizational performance.

#### Leadership

- Characteristics of transformation leadership are highly correlated with software delivery performance.
- Transformational leadership is highly correlated with employee Net Promoter Score.
- Teams with the top 10% of reported transformational leadership characteristics we equally or even less likely to be
  high performers, compared to the entire population of teams represented in survey results.
- Leadership predicts:
  - Lean product development capabilities
  - Technical capabilities

#### Diversity

- Gender:
  - 91% male
  - 6% female
  - 3% non-binary or other
  - Of total respondents:
    - 33% work on teams with no women.
    - 56% work on teams with less than 10% female.
    - 81% work on teams with less than 15% female.
- Underrepresented
  - 77% responded no, I do not identify as underrepresented.
  - 12% responded yes, I identify as underrepresented.
  - 11% did not respond

#### Other

- Investment in DevOps is highly correlated with software delivery performance.
- Percentage of people reporting working in DevOps teams has grown over the last four years:
  - 16% in 2014
  - 19% in 2015
  - 22% in 2016
  - 27% in 2017
- DevOps teams deploy across all operating systems.
- High, medium and low performers show representation across all industries and company sizes.