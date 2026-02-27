import { PageWrapper } from '../components/layout/PageWrapper';
import { AuditLogViewer } from '../components/audit/AuditLogViewer';

export function AuditPage() {
  return (
    <PageWrapper title="Audit Log">
      <AuditLogViewer />
    </PageWrapper>
  );
}
