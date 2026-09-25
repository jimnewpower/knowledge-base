# Jakarta Faces and PrimeFaces cheat sheet

> Baseline: Jakarta Faces 4.1 and PrimeFaces 15 using its Jakarta artifact. Legacy JSF[^jsf] 2.2 / PrimeFaces 13 applications need their own namespace and API[^api] checks. Reviewed: 2026-09-24.

Debug Faces as a server-side component lifecycle. An AJAX[^ajax] request executes part of that lifecycle and renders selected component subtrees.

Related: [Java and Jakarta modernization](java-jakarta-modernization.md), [Spring Security](spring-security.md), [JPA and Hibernate](jpa-and-hibernate.md)[^jpa].

## Lifecycle and AJAX

| Stage or setting | Meaning | Consequence |
|------------------|---------|-------------|
| Restore view | Rebuild or restore the component tree | Expired view state may require recovery/navigation |
| Apply request values | Decode submitted component values | Only executed inputs participate |
| Process validations | Convert and validate | Failure normally skips model update and application invocation |
| Update model values | Copy valid local values to bean properties | Reading a bean earlier can return its old value |
| Invoke application | Run application actions | Keep business transactions in services |
| Render response | Encode the selected output | Rendering does not submit or validate inputs |
| `process` | Select components to execute | `@this` will not process sibling inputs |
| `update` | Select components to render | Include messages and affected output |

`immediate` changes the phase of applicable events/conversion; it is not a general “ignore validation and save” switch. A cancel action and an input using `immediate` have different effects.

## Small form

Facelet fragment. Requires a CDI[^cdi] bean named `profileView` with `name` getters/setters and a `save()` action. Business validation and authorization belong in its service boundary too.

```xml
<h:form id="profile" xmlns:h="jakarta.faces.html"
        xmlns:p="http://primefaces.org/ui">
    <p:messages id="messages"/>
    <p:inputText id="name" value="#{profileView.name}" required="true"/>
    <p:commandButton value="Save" action="#{profileView.save}"
                     process="@form" update="messages result"/>
    <h:panelGroup id="result" layout="block">
        <h:outputText value="#{profileView.name}"/>
    </h:panelGroup>
</h:form>
```

Keep the AJAX target wrapper rendered even when its contents are conditional: the browser needs an existing element to replace. Naming containers affect client IDs[^id]; use an absolute expression such as `:profile:messages` when crossing them. Do not nest HTML[^html] forms. See [processing](https://github.com/primefaces/primefaces/blob/master/docs/15_0_0/core/ajaxProcessing.md) and [rendering](https://github.com/primefaces/primefaces/blob/master/docs/15_0_0/core/ajaxRendering.md).

## State and data

- Request scope resets between requests. CDI `@ViewScoped` retains state for the view and requires a serializable bean with suitable passivation-capable dependencies. Session state is shared across tabs; avoid using it for an edit form.
- Keep view state small: IDs and editable DTOs[^dto], not a persistent collection or open Hibernate session. Getters may run repeatedly; avoid database work and side effects in them.
- Converters translate representations; validators check values. Stable entity IDs still require server-side access checks.
- A lazy table must apply filters and a deterministic sort before pagination; its count must use the same filters. Add a unique tie-breaker and recheck access on row actions.
- Use PrimeFaces 15's `LazyDataModel` signatures when implementing loading/counting; older examples may override different methods.

## Debug in order

Inspect the submitted component IDs and view state, then conversion/validation messages, model values, action execution, and returned partial-response targets. A successful HTTP[^http] status alone does not prove that the action ran.

## References

- [Jakarta Faces 4.1 specification](https://jakarta.ee/specifications/faces/4.1/jakarta-faces-4.1)
- [PrimeFaces 15 migration guide](https://github.com/primefaces/primefaces/blob/master/docs/migrationguide/15_0_0.md)
- [PrimeFaces 15 DataTable](https://github.com/primefaces/primefaces/blob/master/docs/15_0_0/components/datatable.md)

[^jsf]: JavaServer Faces — the predecessor name of Jakarta Faces.
[^api]: Application Programming Interface — the contract through which software components interact.
[^ajax]: Asynchronous JavaScript and Extensible Markup Language — browser requests that update part of a page without a full reload; payloads need not use that markup format.
[^jpa]: Java Persistence API (Application Programming Interface), now standardized as Jakarta Persistence.
[^cdi]: Contexts and Dependency Injection.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^html]: Hypertext Markup Language.
[^dto]: Data Transfer Object.
[^http]: Hypertext Transfer Protocol.
