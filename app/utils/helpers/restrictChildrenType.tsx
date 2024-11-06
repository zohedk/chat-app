import React from "react";

export function restrictChildrenType(
  type: React.ElementType | React.ElementType[],
  children: React.ReactNode,
  errorMessage: string
): void {
  const childArray = React.Children.toArray(children);

  childArray.forEach((child) => {
    if (!React.isValidElement(child)) return;

    // Checking if the current element matches the type we want to exclude
    if (Array.isArray(type)) {
      if (type.includes(child.type as React.ElementType)) {
        throw new Error(errorMessage);
      }
    } else {
      if (child.type === type) {
        throw new Error(errorMessage);
      }
    }

    // Recursively checking the children of the current child if it has any
    if (child.props && child.props.children) {
      restrictChildrenType(type, child.props.children, errorMessage);
    }
  });
}
