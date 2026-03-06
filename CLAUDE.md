
<!-- FORGE:TESTING_METHODOLOGY -->

# Testing Requirements (Forge)

## Test Naming

Use semantic names: `Test<Component>_<Behavior>[_<Condition>]`
- Good: `TestStepRunner_BudgetExceeded`, `TestFullPipelineFlow`
- Bad: `TestShouldWork`, `Test1`

## Test Tiers

1. **Unit tests**
2. **Integration tests**
3. **Scenario tests**

## Requirement References

Every test should reference its requirement ID using the `REQ-` prefix.
See TEST_GUIDE.md for the full requirement-to-test mapping.

## Test Pyramid

Every requirement must have at least one test at each tier.
Test counts must satisfy: unit >= integration >= scenario.
New code must increase test counts at all tiers.

<!-- /FORGE:TESTING_METHODOLOGY -->
