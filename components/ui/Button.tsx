import React, { forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

// Our Button's specific props
interface ButtonCustomProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Generic props for a polymorphic component
// C: The element type to render (e.g., 'button', 'a', etc.)
// P: The custom props for our component (ButtonCustomProps)
type PolymorphicComponentProps<C extends ElementType, P = {}> = {
  as?: C; // The 'as' prop to define the rendered element
} & P & // Our custom props
  Omit<ComponentPropsWithoutRef<C>, keyof P | 'as'>; // Props of the rendered element, excluding clashes

// Define the final props for our Button component
type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonCustomProps>;

// Define the type for our component so we can use it with forwardRef and generics
// This defines a callable component that is generic and has component static properties.
type PolymorphicComponent = (<C extends ElementType = 'button'>(
  props: ButtonProps<C> & { ref?: React.ComponentPropsWithRef<C>['ref'] }
) => React.ReactElement | null) & { displayName?: string };


const Button = forwardRef(
  <C extends ElementType = 'button'>(
    { as, variant = 'default', size = 'default', className, ...props }: ButtonProps<C>,
    ref: React.ComponentPropsWithRef<C>['ref']
  ) => {
    const Component = as || 'button';

    const baseClasses =
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/20',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'hover:bg-slate-100',
      link: 'text-slate-900 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-10 w-10',
    };

    const variantClass = variants[variant!];
    const sizeClass = sizes[size!];

    return (
      <Component
        className={cn(baseClasses, variantClass, sizeClass, className)}
        ref={ref}
        {...props}
      />
    );
  }
) as PolymorphicComponent;
Button.displayName = 'Button';
export default Button;
