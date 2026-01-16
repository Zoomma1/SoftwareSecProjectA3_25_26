import type { ComponentPropsWithoutRef, FC } from 'react';
import './Input.css';

type InputProps = ComponentPropsWithoutRef<'input'> &
  ComponentPropsWithoutRef<'textarea'> & {
    as?: 'input' | 'textarea';
  };

const Input: FC<InputProps> = ({ className = '', as = 'input', ...props }) => {
  const classes = `custom-input ${className}`;

  if (as === 'textarea') {
    return (
      <textarea
        className={classes}
        {...(props as ComponentPropsWithoutRef<'textarea'>)}
      />
    );
  }

  return (
    <input
            className={classes}
      {...(props as ComponentPropsWithoutRef<'input'>)}
    />
  );
};

export default Input;