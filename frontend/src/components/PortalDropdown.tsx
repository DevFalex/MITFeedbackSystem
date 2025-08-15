import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface PortalDropdownProps {
  children: ReactNode;
  position: { top: number; left: number };
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  children,
  position,
}) => {
  const style = {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    zIndex: 9999,
  };

  return ReactDOM.createPortal(
    <div style={style}>{children}</div>,
    document.body,
  );
};

export default PortalDropdown;
