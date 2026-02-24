import { CatalogBrowser } from '../components/catalog/CatalogBrowser';
import { PageWrapper } from '../components/layout/PageWrapper';

export function CatalogPage() {
  return (
    <PageWrapper title="Data Catalog">
      <CatalogBrowser />
    </PageWrapper>
  );
}
