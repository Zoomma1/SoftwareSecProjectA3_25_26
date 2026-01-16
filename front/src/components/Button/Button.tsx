import type { FC, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: FC<ButtonProps> = ({ className = '', children, ...props }) => {
  return (
    <button
      className={`custom-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;