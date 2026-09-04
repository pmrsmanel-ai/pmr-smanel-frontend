import React from 'react';
import { Navigate } from 'react-router-dom';

import {
  getSession,
  isAllowed,
} from '../../auth';

export default function Protected({
  roles,
  children,
}) {
  const session = getSession();

  if (!isAllowed(session, roles)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}