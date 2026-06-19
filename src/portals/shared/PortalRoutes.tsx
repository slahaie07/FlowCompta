import { Routes, Route, Navigate } from 'react-router-dom';
import { PORTAL_ROUTES } from '../config';
import { RequireRole } from './RequireRole';
import { withPortalSuspense } from './PortalPageLoader';
import { getDefaultRoute } from '../config';
import type { PortalRouteContext } from '../types';
import type { PortalRole } from '../types';

interface PortalRoutesProps {
  ctx: PortalRouteContext;
  role: PortalRole;
}

export function PortalRoutes({ ctx, role }: PortalRoutesProps) {
  const defaultRoute = getDefaultRoute(role);

  return (
    <Routes>
      <Route index element={<Navigate to={defaultRoute} replace />} />

      {PORTAL_ROUTES.map((route) => (
        <Route
          path={route.path}
          element={
            <RequireRole role={role} allowed={route.roles}>
              {withPortalSuspense(route.render(ctx))}
            </RequireRole>
          }
        />
      ))}

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
