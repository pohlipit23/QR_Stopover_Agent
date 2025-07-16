import React from 'react';

interface TestComponentProps {
  message: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ message }) => {
  return (
    <div className="card">
      <h3 className="mb-4">React Component Test</h3>
      <p>{message}</p>
      <button className="btn-primary mt-4">
        React Button
      </button>
    </div>
  );
};

export default TestComponent;