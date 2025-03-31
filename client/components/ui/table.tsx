import { HTMLAttributes } from "react";

export function Table({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`w-full border-collapse border ${className}`} {...props}>
      {children}
    </table>
  );
}

export function TableHead({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-gray-200 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableRow({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`p-2 border ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableBody({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableCell({ 
  children, 
  className = "", 
  ...props 
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`p-2 border ${className}`} {...props}>
      {children}
    </td>
  );
}
