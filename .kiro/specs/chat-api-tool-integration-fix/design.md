# Design Document

## Overview

The chat API is failing due to incorrect tool formatting for the AI SDK v3.4.33. The current booking functions use an `inputSchema` property, but the AI SDK expects tools to have a `parameters` property containing the Zod schema. This design outlines the necessary changes to fix the tool integration and ensure proper schema validation.

## Architecture

The fix involves restructuring the booking functions to match the AI SDK's expected tool format:

```
Current Format (Broken):
{
  description: string,
  inputSchema: ZodSchema,
  execute: function
}

Required Format (Working):
{
  description: string,
  parameters: ZodSchema,
  execute: function
}
```

## Components and Interfaces

### 1. Booking Functions Structure

**Current Implementation Issues:**
- Uses `inputSchema` instead of `parameters`
- Tool objects don't match AI SDK expectations
- Zod schemas are not properly accessible for JSON schema conversion

**Required Implementation:**
- Each tool must have `description`, `parameters`, and `execute` properties
- `parameters` must be a valid Zod schema object
- The schema must be directly accessible for the AI SDK's internal JSON schema conversion

### 2. Tool Export Format

**Current Export:**
```typescript
export const bookingFunctions = {
  showStopoverCategories,
  selectStopoverCategory,
  // ... other functions
};
```

**Required Export:**
The tools need to be exported in a format that the AI SDK can process. Based on AI SDK v3.4.33, tools should be an object where each key is a tool name and each value is a tool definition.

### 3. Schema Definitions

All existing Zod schemas are correct and can be reused:
- `emptyCategorySchema`
- `categorySelectionSchema`
- `hotelSelectionSchema`
- `timingDurationSchema`
- `extrasSelectionSchema`
- `paymentInitiationSchema`
- `bookingCompletionSchema`

## Data Models

No changes to data models are required. The existing schemas properly define:
- Category selection parameters
- Hotel selection parameters
- Timing and duration parameters
- Extras selection parameters
- Payment initiation parameters
- Booking completion parameters

## Error Handling

### Current Error
```
TypeError: Cannot read properties of undefined (reading '_def')
```

This occurs because the AI SDK's `zodToJsonSchema` function cannot access the `_def` property of the Zod schema when it's nested under `inputSchema`.

### Solution
By moving the schema to the `parameters` property, the AI SDK can properly access the schema's internal structure for JSON schema conversion.

### Fallback Handling
The existing error handling in the chat API will continue to work:
- Model fallback on tool processing errors
- Proper error logging and reporting
- Graceful degradation when tools fail

## Testing Strategy

### Unit Tests
1. **Tool Structure Validation**
   - Verify each tool has required properties (`description`, `parameters`, `execute`)
   - Validate that `parameters` contains valid Zod schemas
   - Test schema validation with sample inputs

2. **Schema Conversion**
   - Test that Zod schemas can be converted to JSON schema
   - Verify no `_def` property access errors occur
   - Validate parameter validation works correctly

### Integration Tests
1. **Chat API Integration**
   - Test `/api/chat` endpoint with tool calls
   - Verify tools are properly recognized by AI SDK
   - Test tool execution with valid and invalid parameters

2. **Chat Test Page**
   - Test `/chat-test` page loads without errors
   - Verify chat interface can send messages
   - Test tool calls work end-to-end

### Error Scenario Tests
1. **Invalid Parameters**
   - Test tool calls with missing required parameters
   - Verify proper error messages are returned
   - Test parameter type validation

2. **Tool Execution Errors**
   - Test handling of tool execution failures
   - Verify error reporting and logging
   - Test fallback behavior

## Implementation Notes

### Minimal Changes Required
- Only the tool structure needs to change
- All existing business logic in `execute` functions remains unchanged
- All existing Zod schemas can be reused as-is
- No changes needed to the chat API endpoint logic

### Backward Compatibility
- This is an internal structure change
- No API contract changes for consumers
- Existing tool functionality remains identical

### Performance Considerations
- No performance impact expected
- Schema validation performance remains the same
- Tool execution performance unchanged