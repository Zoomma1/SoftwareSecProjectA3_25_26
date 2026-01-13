import React from 'react';
import './Input.css';

type InputProps = React.ComponentPropsWithoutRef<'input'> &
  React.ComponentPropsWithoutRef<'textarea'> & {
    as?: 'input' | 'textarea';
  };

const Input: React.FC<InputProps> = ({ className = '', as = 'input', ...props }) => {
  const classes = `custom-input ${className}`;

  if (as === 'textarea') {
    return (
      <textarea
        className={classes}
        {...(props as React.ComponentPropsWithoutRef<'textarea'>)}
      />
    );
  }

  return (
    <input
            className={classes}
      {...(props as React.ComponentPropsWithoutRef<'input'>)}
    />
  );
};

export default Input;