# Chat API Integration Tests

This directory contains comprehensive integration tests for the chat API and booking functions.

## Test Files

### ChatAPIBasic.test.ts
- **Purpose**: Tests the core booking functions parameter validation and execution
- **Coverage**: 
  - Tool parameter validation with valid and invalid inputs
  - Tool execution with various parameter combinations
  - Edge case handling (min/max durations, empty arrays, different payment methods)

### ChatAPIEndpoint.test.ts
- **Purpose**: Tests the complete chat API endpoint integration with AI SDK
- **Coverage**:
  - Tool integration with AI SDK (streamText function)
  - API error handling (rate limits, context length, authentication)
  - Security middleware integration
  - Request/response validation
  - Tool parameter edge cases

## Test Results Summary

All tests verify that:

1. **Tool Parameter Validation**: The AI SDK can properly validate tool parameters using Zod schemas
2. **Tool Execution**: All booking functions execute successfully with valid parameters
3. **Error Handling**: The API gracefully handles various error conditions with appropriate HTTP status codes
4. **Security Integration**: Security middleware is properly integrated and enforced
5. **Tool Integration**: All booking functions are correctly passed to the AI SDK as tools

## Requirements Coverage

These tests fulfill the requirements from task 4:

- ✅ Test the `/api/chat` endpoint to ensure it processes tool calls without errors
- ✅ Verify that the AI SDK can properly validate tool parameters  
- ✅ Test tool execution with both valid and invalid parameters
- ✅ Requirements 2.1, 2.2, 2.3 are covered through comprehensive parameter validation and execution testing

## Running Tests

```bash
# Run all chat API tests
npm test -- --testPathPatterns="ChatAPI"

# Run individual test files
npm test ChatAPIBasic.test.ts
npm test ChatAPIEndpoint.test.ts
```